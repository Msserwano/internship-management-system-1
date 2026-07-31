const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../config/db');

const ADMIN_TOKEN = jwt.sign({ id: 'U003', role: 'admin' }, process.env.JWT_SECRET || 'development-only-secret');

describe('Deletion and Audit Log flows', () => {
  let createdIdSoft;
  let createdIdHard;

  it('creates an internship as admin', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const resp = await request(app)
      .post('/api/data/internships')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({
        title: 'Test Intern Role',
        department: 'ICT',
        description: 'This is a test description long enough to pass validation.',
        vacancies: 1,
        deadline: futureDate,
      });
    expect(resp.status).toBe(201);
    expect(resp.body.success).toBe(true);
    createdIdSoft = resp.body.data.id;
  });

  it('soft-deletes the internship and creates an audit log', async () => {
    const del = await request(app)
      .delete(`/api/data/internships/${createdIdSoft}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ reason: 'No longer needed' });
    expect(del.status).toBe(200);
    // item should be excluded from GET by id
    const get = await request(app).get(`/api/data/internships/${createdIdSoft}`);
    expect(get.status).toBe(404);
    // audit logs should include an entry for soft-delete
    const logs = await request(app)
      .get('/api/data/audit-logs')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(logs.status).toBe(200);
    const found = logs.body.data.find(l => l.action === 'soft-delete' && l.table === 'internships' && l.id === createdIdSoft);
    expect(found).toBeTruthy();
  });

  it('creates another internship then hard-deletes it directly', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const resp = await request(app)
      .post('/api/data/internships')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({
        title: 'Hard Delete Role',
        department: 'ICT',
        description: 'This is another test description long enough to pass validation.',
        vacancies: 1,
        deadline: futureDate,
      });
    expect(resp.status).toBe(201);
    createdIdHard = resp.body.data.id;

    const del = await request(app)
      .delete(`/api/data/internships/${createdIdHard}?hard=true`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ reason: 'Purge' });
    expect(del.status).toBe(200);

    // ensure no soft-deleted entry exists and audit has delete entry
    const logs = await request(app)
      .get('/api/data/audit-logs')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    const found = logs.body.data.find(l => (l.action === 'delete' || l.action === 'purge') && l.table === 'internships' && l.id === createdIdHard);
    expect(found).toBeTruthy();
  });

  it('can purge all soft-deleted records from a table', async () => {
    // create one, soft-delete it, then purge
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const resp = await request(app)
      .post('/api/data/internships')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({
        title: 'Purge Role',
        department: 'ICT',
        description: 'This is yet another test description long enough to pass validation.',
        vacancies: 1,
        deadline: futureDate,
      });
    expect(resp.status).toBe(201);
    const id = resp.body.data.id;
    await request(app).delete(`/api/data/internships/${id}`).set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    const purge = await request(app)
      .post('/api/data/purge/internships')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send();
    expect(purge.status).toBe(200);
    expect(purge.body.removed).toBeGreaterThanOrEqual(1);
  });
});
