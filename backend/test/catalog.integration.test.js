import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { authDatabase } from '../test-support/auth-database.js';
import { createApp } from '../src/app.js';
import { createTokens } from '../src/modules/auth/auth.tokens.js';

test('only HR manages departments and positions using the updated team schema', async t => {
  const db = await authDatabase(); t.after(() => db.close());
  const config = { origin: 'http://localhost:5173', jwtSecret: 'catalog-test-secret-'.repeat(3),
    roles: { admin: 'ADMIN', staff: 'HR', employee: 'EMPLOYEE' } };
  await db.query("INSERT INTO public.role(name) VALUES ('ADMIN'),('HR'),('EMPLOYEE')");
  await db.query(`INSERT INTO public.users(email,password_hash,role_id,status) VALUES
    ('admin@test.example','unused',1,'ACTIVE'),('hr@test.example','unused',2,'ACTIVE'),('employee@test.example','unused',3,'ACTIVE')`);
  const server = createApp({ db, config, mailer: { configured: false } }).listen(0, '127.0.0.1');
  await once(server, 'listening'); t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const tokens = createTokens(config);
  const access = { admin: tokens.sign('access', { id: 1 }, 3600), hr: tokens.sign('access', { id: 2 }, 3600), employee: tokens.sign('access', { id: 3 }, 3600) };
  const request = async (path, role = 'hr', method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json',
      ...(access[role] ? { Authorization: `Bearer ${access[role]}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  await t.test('both URL versions reject ADMIN, EMPLOYEE and unauthenticated catalog requests', async () => {
    for (const prefix of ['/api', '/api/v1']) for (const module of ['departments', 'positions']) {
      for (const role of ['admin', 'employee', 'none']) {
        for (const [method, suffix, body] of [['GET', '', null], ['GET', '/1', null], ['POST', '', { name: 'Blocked' }], ['PATCH', '/1', { name: 'Blocked' }]]) {
          assert.equal((await request(`${prefix}/${module}${suffix}`, role, method, body)).status, role === 'none' ? 401 : 403);
        }
      }
      assert.equal((await request(`${prefix}/${module}`)).status, 200);
    }
  });
  await t.test('HR creates and updates departments; normalized names and codes cannot collide', async () => {
    const created = await request('/api/departments', 'hr', 'POST', { name: ' Engineering ', description: null });
    assert.equal(created.status, 201); const department = created.body.data;
    assert.equal(department.name, 'Engineering'); assert.ok(department.code.startsWith('DEPT-'));
    assert.equal((await request('/api/departments', 'hr', 'POST', { name: ' engineerING ' })).status, 409);
    assert.equal((await request('/api/departments', 'hr', 'POST', { code: department.code, name: 'Other' })).status, 409);
    assert.equal((await request('/api/departments', 'hr', 'POST', { name: ' ' })).status, 400);
    assert.equal((await request('/api/departments', 'hr', 'POST', { name: 'X'.repeat(151) })).status, 400);
    assert.equal((await request('/api/departments', 'hr', 'POST', { name: 'Unknown', unknown: true })).status, 400);
    const edited = await request(`/api/v1/departments/${department.id}`, 'hr', 'PATCH', { name: 'Technology', description: 'Updated' });
    assert.equal(edited.status, 200); assert.equal(edited.body.data.name, 'Technology');
    assert.equal((await request(`/api/departments/${department.id}`, 'hr', 'PATCH', { description: null })).body.data.description, null);
    assert.equal((await request(`/api/departments/${department.id}`, 'hr', 'PATCH', {})).status, 400);
    assert.equal((await request('/api/departments/999', 'hr', 'PATCH', { name: 'Missing' })).status, 404);
    const search = await request('/api/departments?q=technology'); assert.equal(search.body.data.length, 1);
    const audit = (await db.query("SELECT * FROM public.audit_logs WHERE action='DEPARTMENT_UPDATED' ORDER BY id LIMIT 1")).rows[0];
    assert.equal(audit.user_id, 2); assert.equal(audit.old_value.name, 'Engineering'); assert.equal(audit.new_value.name, 'Technology');
  });
  let positionId;
  await t.test('HR manages positions with required levels and legacy title/level aliases', async () => {
    const created = await request('/api/positions', 'hr', 'POST', { title: ' Engineer ', level: 'senior' });
    assert.equal(created.status, 201); positionId = created.body.data.id;
    assert.equal(created.body.data.name, 'Engineer'); assert.equal(created.body.data.job_level, 'Senior');
    assert.equal((await request('/api/positions', 'hr', 'POST', { name: 'engineer', jobLevel: 'SENIOR' })).status, 409);
    for (const body of [{ name: 'Engineer' }, { level: 'Lead' }, { title: 'Engineer', level: null }, { name: 'Engineer', jobLevel: 'Intern' }]) {
      assert.equal((await request('/api/positions', 'hr', 'POST', body)).status, 400);
    }
    for (const body of [{ level: null }, { level: 'Intern' }, {}]) assert.equal((await request(`/api/positions/${positionId}`, 'hr', 'PATCH', body)).status, 400);
    const edited = await request(`/api/positions/${positionId}`, 'hr', 'PATCH', { level: 'Lead' });
    assert.equal(edited.status, 200); assert.equal(edited.body.data.job_level, 'Lead');
    assert.equal((await request('/api/positions/999')).body.error.code, 'POSITION_NOT_FOUND');
  });
  await t.test('failed audit rolls back the catalog change', async () => {
    await db.query("ALTER TABLE public.audit_logs ADD CONSTRAINT reject_catalog_test CHECK (action <> 'POSITION_UPDATED') NOT VALID");
    try {
      assert.equal((await request(`/api/positions/${positionId}`, 'hr', 'PATCH', { name: 'Should roll back' })).status, 500);
      assert.equal((await db.query('SELECT name FROM public.positions WHERE id=$1', [positionId])).rows[0].name, 'Engineer');
    } finally { await db.query('ALTER TABLE public.audit_logs DROP CONSTRAINT reject_catalog_test'); }
  });
  await t.test('simultaneous duplicate creates allow only one row', async () => {
    const results = await Promise.all([request('/api/departments', 'hr', 'POST', { name: 'Concurrent' }),
      request('/api/departments', 'hr', 'POST', { name: 'concurrent' })]);
    assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  });
});
