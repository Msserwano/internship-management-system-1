/**
 * KCCA IMS — Bulk Data Population Script
 * Runs automatically against the live DB and inserts:
 *   - 40 Ugandan applicants (with hashed passwords)
 *   - 120+ applications spread across all 7 internships
 *   - Realistic mix of statuses, universities, courses
 *   - 15 interview records for shortlisted/interview-status applicants
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Data Pools ───────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Sarah','John','Mary','Peter','Agnes','Daniel','Grace','Michael','Prossy','David',
  'Annet','Robert','Fatuma','Joshua','Josephine','Emmanuel','Lydia','Francis','Ritah','Patrick',
  'Mercy','Ronald','Sandra','Charles','Winnie','Gerald','Phionah','Ivan','Daphine','Henry',
  'Brenda','Innocent','Flavia','Geoffrey','Christine','Andrew','Vivian','Moses','Harriet','Samuel'
];

const LAST_NAMES = [
  'Nakimuli','Sserwano','Namukasa','Okello','Atim','Mugisha','Nakayenga','Nsubuga','Namutebi','Waiswa',
  'Namatovu','Kizito','Hassan','Mulindwa','Akello','Ssemakula','Kyeyune','Tumusiime','Birungi','Katusiime',
  'Nakato','Ssenyonga','Nalubega','Musisi','Namwanje','Kayiira','Nabiryo','Sentongo','Nantongo','Lwanga',
  'Nakabuye','Kizito','Nabbosa','Wasswa','Namirembe','Onyango','Nakigozi','Wanyama','Mugenyi','Kiconco'
];

const UNIVERSITIES = [
  'Makerere University','Kyambogo University','Uganda Christian University',
  'Makerere University Business School','Kampala International University',
  'Uganda Martyrs University','Gulu University','Mbarara University of Science & Technology',
  'Busitema University','Ndejje University'
];

const COURSES = {
  'Information & Communication Technology': [
    'Bachelor of Science in Computer Science','Bachelor of Information Technology',
    'Bachelor of Software Engineering','Bachelor of Computer Engineering',
    'Bachelor of Information Systems'
  ],
  'Finance & Accounts': [
    'Bachelor of Commerce','Bachelor of Accounting & Finance',
    'Bachelor of Business Administration','Bachelor of Economics'
  ],
  'Human Resources': [
    'Bachelor of Human Resource Management','Bachelor of Business Administration',
    'Bachelor of Arts in Public Administration','Bachelor of Social Sciences'
  ],
  'Engineering & Technical Services': [
    'Bachelor of Civil Engineering','Bachelor of Electrical Engineering',
    'Bachelor of Mechanical Engineering','Bachelor of Structural Engineering'
  ],
  'Public Health': [
    'Bachelor of Environmental Health','Bachelor of Public Health',
    'Bachelor of Science in Nursing','Bachelor of Medicine & Surgery'
  ],
  'Legal Affairs': [
    'Bachelor of Laws (LLB)','Bachelor of Arts in Law','Diploma in Law'
  ],
  'Internal Audit': [
    'Bachelor of Accounting & Finance','Bachelor of Commerce','Bachelor of Statistics'
  ],
};

const YEAR_LEVELS = ['Year 2','Year 3','Year 4','Final Year'];
const DISTRICTS   = ['Kampala','Wakiso','Mukono','Jinja','Mbarara','Gulu','Lira','Mbale','Masaka','Entebbe'];
const STATUSES    = ['submitted','submitted','under_review','under_review','shortlisted','interview','accepted','rejected','withdrawn'];
const VENUES      = [
  'KCCA Boardroom 2, City Hall, 3rd Floor',
  'KCCA Conference Hall A, Nakawa',
  'ICT Department Meeting Room, City Hall',
  'HR Suite, 2nd Floor, City Hall',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n)   => Array.from({ length: n }, (_, i) => i);
const randGpa = () => (2.5 + Math.random() * 1.9).toFixed(2);
const randPhone = () => `+256 7${String(Math.floor(10000000 + Math.random() * 89999999))}`;
const randDate  = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
};
const appId = (i) => `APP${String(1000 + i).slice(-4)}`;
const ivwId = (i) => `IVW${String(100 + i).slice(-3)}`;

async function run() {
  const client = await pool.connect();
  console.log('✅ Connected to database');

  try {
    // ── 0. Ensure panel_members column exists ────────────────────────────────
    await client.query('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS panel_members TEXT[]');
    await client.query('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS instructions TEXT');
    await client.query('ALTER TABLE applications ADD COLUMN IF NOT EXISTS timeline JSONB');
    console.log('✅ Schema columns verified');

    // ── 1. Fetch existing internship IDs ──────────────────────────────────────
    const intRes = await client.query('SELECT id, department FROM internships WHERE status = $1', ['open']);
    const internships = intRes.rows;
    if (internships.length === 0) {
      console.error('❌ No open internships found. Run seed.sql first.');
      process.exit(1);
    }
    console.log(`✅ Found ${internships.length} open internship(s)`);

    // ── 2. Get how many applicants already exist ───────────────────────────────
    const existRes = await client.query('SELECT COUNT(*)::int AS c FROM applicants');
    const existingCount = existRes.rows[0].c;
    console.log(`ℹ️  ${existingCount} applicant(s) already in DB`);

    // ── 3. How many apps already exist (to avoid ID collisions) ───────────────
    const existAppRes = await client.query('SELECT COUNT(*)::int AS c FROM applications');
    let appCounter = existAppRes.rows[0].c;

    // ── 4. Build list of applicants to insert ────────────────────────────────
    const TARGET_APPLICANTS = 40;
    const toInsert = Math.max(0, TARGET_APPLICANTS - existingCount);

    // Hash password once (Applicant@1234) — reuse for all
    const pwHash = await bcrypt.hash('Applicant@1234', 10);

    const newApplicants = [];
    for (let i = 0; i < toInsert; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName  = LAST_NAMES[i % LAST_NAMES.length];
      const name      = `${firstName} ${lastName}`;
      const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.ac.ug`;
      const uni       = pick(UNIVERSITIES);
      const dept      = pick(Object.keys(COURSES));
      const course    = pick(COURSES[dept]);

      try {
        const r = await client.query(
          `INSERT INTO applicants
             (full_name, email, password_hash, phone_number, institution, course_of_study, academic_year_level, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (email) DO NOTHING
           RETURNING applicant_id`,
          [name, email, pwHash, randPhone(), uni, course, pick(YEAR_LEVELS), randDate(90)]
        );
        if (r.rowCount > 0) {
          newApplicants.push({ id: r.rows[0].applicant_id, name, email, uni, course, dept });
        }
      } catch (e) {
        // skip duplicates silently
      }
    }
    console.log(`✅ Inserted ${newApplicants.length} new applicant(s)`);

    // ── 5. Fetch ALL applicants (existing + new) ────────────────────────────
    const allAppRes = await client.query(
      `SELECT applicant_id AS id, full_name AS name, email, institution AS uni, course_of_study AS course, created_at
       FROM applicants ORDER BY created_at ASC`
    );
    const allApplicants = allAppRes.rows;
    console.log(`✅ Total applicants: ${allApplicants.length}`);

    // ── 6. Check which (applicant, internship) pairs already have applications
    const existPairsRes = await client.query(
      'SELECT applicant_id, internship_id FROM applications'
    );
    const existPairs = new Set(existPairsRes.rows.map(r => `${r.applicant_id}|${r.internship_id}`));

    // ── 7. Create applications — each applicant applies to 2-4 internships ──
    let newAppsCount = 0;
    let ivwCounter = 0;

    for (const applicant of allApplicants) {
      // Pick 2–4 random internships to apply to (no duplicates)
      const shuffled = [...internships].sort(() => Math.random() - 0.5);
      const toApply = shuffled.slice(0, 2 + Math.floor(Math.random() * 3));

      for (const internship of toApply) {
        const pairKey = `${applicant.id}|${internship.id}`;
        if (existPairs.has(pairKey)) continue; // skip already-applied

        appCounter++;
        const id       = appId(appCounter);
        const status   = pick(STATUSES);
        const subDate  = randDate(60);
        const timeline = [{ status: 'submitted', date: subDate, note: 'Application submitted.' }];

        if (status === 'under_review') {
          timeline.push({ status: 'under_review', date: randDate(30), note: 'Application moved to review.' });
        } else if (['shortlisted','interview','accepted','rejected'].includes(status)) {
          timeline.push({ status: 'under_review', date: randDate(50), note: 'Application under review.' });
          timeline.push({ status, date: randDate(20), note: `Status updated to ${status.replace('_',' ')}.` });
        }

        const course = applicant.course || pick(COURSES[Object.keys(COURSES)[0]]);
        const gpa    = randGpa();

        try {
          await client.query(
            `INSERT INTO applications
               (id, internship_id, applicant_id, university, course, gpa, status, review_note, timeline, submitted_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              id,
              internship.id,
              applicant.id,
              applicant.uni || pick(UNIVERSITIES),
              course,
              gpa,
              status,
              status === 'rejected' ? 'Candidate did not meet minimum GPA requirement.' :
              status === 'accepted' ? 'Excellent candidate — offer issued.' :
              status === 'shortlisted' ? 'Strong academic profile; shortlisted for interview.' : null,
              JSON.stringify(timeline),
              subDate,
            ]
          );

          // Update internship applicants_count
          await client.query(
            'UPDATE internships SET applicants_count = COALESCE(applicants_count,0)+1 WHERE id=$1',
            [internship.id]
          );

          existPairs.add(pairKey);
          newAppsCount++;

          // ── 8. Create interview for 'interview' status ─────────────────────
          if (status === 'interview') {
            ivwCounter++;
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5 + Math.floor(Math.random() * 20));
            const iDate = futureDate.toISOString().split('T')[0];
            const iTime = pick(['09:00','10:00','11:00','14:00','15:00','16:00']);

            try {
              await client.query(
                `INSERT INTO interviews
                   (id, application_id, interview_date, interview_time, venue, meeting_link, panel_members, instructions, status, created_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled',NOW())
                 ON CONFLICT (id) DO NOTHING`,
                [
                  ivwId(ivwCounter),
                  id,
                  iDate,
                  iTime,
                  pick(VENUES),
                  'https://meet.google.com/kcca-' + Math.random().toString(36).slice(2,8),
                  ['Mr. Peter Mwesigwa (ICT Lead)','Ms. Rose Nabwire (HR Manager)','Dr. Harriet Katusiime (Dept. Head)'],
                  'Please bring original academic documents, National ID, and one passport photo.',
                ]
              );
            } catch { /* skip if ID collision */ }
          }

        } catch (e) {
          if (!e.message.includes('duplicate')) {
            console.warn('  App insert warn:', e.message.slice(0, 80));
          }
        }
      }
    }

    // ── 9. Final counts ────────────────────────────────────────────────────────
    const finalApplicants = (await client.query('SELECT COUNT(*)::int AS c FROM applicants')).rows[0].c;
    const finalApps       = (await client.query('SELECT COUNT(*)::int AS c FROM applications')).rows[0].c;
    const finalIvws       = (await client.query('SELECT COUNT(*)::int AS c FROM interviews')).rows[0].c;
    const byStatus        = (await client.query(`
      SELECT status, COUNT(*)::int AS count FROM applications GROUP BY status ORDER BY count DESC
    `)).rows;

    console.log('\n═══════════════════════════════════════');
    console.log('  BULK POPULATION COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`  Applicants  : ${finalApplicants}`);
    console.log(`  Applications: ${finalApps} (+${newAppsCount} new)`);
    console.log(`  Interviews  : ${finalIvws}`);
    console.log('\n  Application Status Breakdown:');
    byStatus.forEach(r => console.log(`    ${r.status.padEnd(15)} : ${r.count}`));
    console.log('═══════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
