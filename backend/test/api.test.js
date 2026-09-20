import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

test('API authentication, permission boundaries and unavailable dependencies', async t => {
  const config = { origin: 'http://localhost:5173', jwtSecret: 'unit-test-secret-'.repeat(3),
    roles: { admin: 'ADMIN', staff: 'STAFF', manager: 'MANAGER', analyst: 'ANALYST' } };
  let state = { role: 'STAFF', status: 'ACTIVE', dbDown: false };
  const hash = await bcrypt.hash('test-password', 4);
  const db = { async query(sql) {
    if (state.dbDown) throw new Error('private-db-host-and-password');
    if (sql.includes('JOIN public.roles')) return { rows: [{
      id: 1, email: 'staff@example.test', full_name: 'Test Staff', role_id: 1,
      role_name: state.role, status: state.status,
      ...(sql.includes('password_hash') ? { password_hash: hash } : {}),
    }] };
    return { rows: [] };
  } };
  db.connect = async () => ({ query: db.query.bind(db), release() {} });
  const server = createApp({ db, config }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let token;
  const get = path => fetch(base + path, { headers: { Authorization: `Bearer ${token}` } });

  await t.test('liveness works; employee data needs a token', async () => {
    assert.equal((await fetch(base + '/health/live')).status, 200);
    assert.equal((await fetch(base + '/api/v1/employees')).status, 401);
  });
  await t.test('login returns token without exposing password hash', async () => {
    const response = await fetch(base + '/api/v1/auth/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@example.test', password: 'test-password' }) });
    assert.equal(response.status, 200);
    const body = await response.json(); token = body.access_token;
    assert.ok(token); assert.equal(body.user.password_hash, undefined);
  });
  await t.test('HR staff can list employees but cannot register users', async () => {
    assert.equal((await get('/api/v1/employees')).status, 200);
    const response = await fetch(base + '/api/v1/auth/user_register', { method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 403);
  });
  await t.test('inactive users lose access despite an unexpired token', async () => {
    state.status = 'INACTIVE';
    assert.equal((await get('/api/v1/employees')).status, 401);
    state.status = 'ACTIVE';
  });
  await t.test('incorrect token audience is rejected', async () => {
    const invalid = jwt.sign({}, config.jwtSecret, { subject: '1', issuer: 'eris-api', audience: 'another-app' });
    assert.equal((await fetch(base + '/api/v1/employees', { headers: { Authorization: `Bearer ${invalid}` } })).status, 401);
  });
  await t.test('analyst sees explicit model-not-ready instead of fake predictions', async () => {
    state.role = 'ANALYST';
    const response = await fetch(base + '/api/v1/predictions', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, 'MODEL_NOT_READY');
  });
  await t.test('unavailable database fails readiness and redacts internals', async () => {
    state.dbDown = true;
    assert.equal((await get('/health/ready')).status, 503);
    const response = await get('/api/v1/employees');
    assert.equal(response.status, 500);
    assert.ok(!(await response.text()).includes('private-db-host'));
    state.dbDown = false;
  });
  await t.test('malformed JSON returns a client error', async () => {
    const response = await fetch(base + '/api/v1/auth/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: '{broken' });
    assert.equal(response.status, 400);
  });
});
