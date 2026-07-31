const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../config/db');

const ADMIN_TOKEN = jwt.sign({ id: 'U003', role: 'admin' }, process.env.JWT_SECRET || 'development-only-secret');

describe('Audit export endpoint', () => {
  beforeAll(async () => {
    // ensure there is at least one audit log
    await db.appendAuditLog({ action: 'export-test', table: 'users', id: 'U999', actor: { id: 'U003', role: 'admin' }, reason: 'export test' });
  });

  it('returns CSV by default', async () => {
    const res = await request(app).get('/api/data/audit-logs/export').set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('action');
    expect(res.text).toContain('export-test');
  });

  it('returns JSON when requested', async () => {
    const res = await request(app).get('/api/data/audit-logs/export?format=json').set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    const parsed = JSON.parse(res.text);
    expect(parsed).toHaveProperty('data');
    expect(Array.isArray(parsed.data)).toBe(true);
    const found = parsed.data.find(l => l.action === 'export-test');
    expect(found).toBeTruthy();
  });
});
