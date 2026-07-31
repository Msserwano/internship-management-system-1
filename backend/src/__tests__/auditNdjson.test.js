const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../config/db');

const ADMIN_TOKEN = jwt.sign({ id: 'U003', role: 'admin' }, process.env.JWT_SECRET || 'development-only-secret');

describe('Audit NDJSON export', () => {
  beforeAll(async () => {
    await db.appendAuditLog({ action: 'ndjson-test', table: 'users', id: 'U888', actor: { id: 'U003', role: 'admin' }, reason: 'ndjson test' });
  });

  it('returns NDJSON streaming data', async () => {
    const res = await request(app)
      .get('/api/data/audit-logs/export?format=ndjson&stream=true&limit=10')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .buffer(true)
      .parse((res, cb) => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => cb(null, data));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/x-ndjson/);
    const bodyStr = (typeof res.text === 'string') ? res.text : (typeof res.body === 'string' ? res.body : '');
    expect(bodyStr).toBeTruthy();
    const lines = bodyStr.split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    const parsed = lines.map(l => JSON.parse(l));
    const found = parsed.find(p => p.action === 'ndjson-test');
    expect(found).toBeTruthy();
  });
});
