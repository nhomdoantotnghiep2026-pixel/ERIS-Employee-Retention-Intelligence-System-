import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { authDatabase } from '../test-support/auth-database.js';

test('User Management API uses the existing users, roles and audit_logs tables', async t => {
  const db = await authDatabase();
  t.after(() => db.close());
  const password = 'InitialPassword123!';
  const hash = await bcrypt.hash(password, 4);
  const config = {
    origin: 'http://localhost:5173',
    jwtSecret: 'user-management-test-secret-'.repeat(3),
    initialUserPassword: 'Testpassword123!',
    roles: { admin: 'ADMIN', manager: 'HR_MANAGER', staff: 'HR_STAFF', analyst: 'DATA' },
    auth: { cookieSecure: true, cookieSameSite: 'lax', accessTtlSeconds: 3600, refreshTtlSeconds: 604800 },
  };
  for (const role of ['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'DATA']) {
    await db.query('INSERT INTO public.roles(name, description) VALUES ($1, $2)', [role, `${role} role`]);
  }
  for (const [email, name, role] of [
    ['admin@eris.test', 'Admin User', 1],
    ['staff@eris.test', 'Staff User', 3],
    ['other@eris.test', 'Other User', 3],
  ]) {
    await db.query(`INSERT INTO public.users(email, password_hash, full_name, role_id, status)
      VALUES ($1, $2, $3, $4, 'ACTIVE')`, [email, hash, name, role]);
  }
  const mailer = { configured: true };
  const server = createApp({ db, config, mailer }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, { method = 'GET', body, access } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  const login = async email => (await request('/api/auth/login', {
    method: 'POST', body: { email, password },
  })).body.accessToken;
  const admin = await login('admin@eris.test');
  const staff = await login('staff@eris.test');

  await t.test('ADMIN lists, searches and filters users without password hashes', async () => {
    const result = await request('/api/users?page=1&limit=10&search=staff&roleId=3&status=ACTIVE', { access: admin });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.length, 1);
    assert.equal(result.body.data[0].fullName, 'Staff User');
    assert.deepEqual(result.body.data[0].role, { id: 3, name: 'HR_STAFF' });
    assert.equal(result.body.data[0].password_hash, undefined);
    assert.equal(result.body.pagination.total, 1);
    assert.equal((await request('/api/users?status=UNKNOWN', { access: admin })).status, 400);
    assert.equal((await request('/api/users', { access: staff })).status, 403);
  });

  await t.test('non-ADMIN reads only its own account', async () => {
    assert.equal((await request('/api/users/2', { access: staff })).status, 200);
    assert.equal((await request('/api/users/3', { access: staff })).status, 403);
    assert.equal((await request('/api/users/999', { access: admin })).status, 404);
  });

  await t.test('profile updates validate fields and duplicate email', async () => {
    const updated = await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { fullName: 'Updated Staff', email: 'newstaff@eris.test' },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.fullName, 'Updated Staff');
    assert.equal((await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { email: 'other@eris.test' },
    })).status, 409);
    assert.equal((await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { roleId: 2 },
    })).status, 400);
  });

  await t.test('ADMIN changes role and status while protected actions fail', async () => {
    const role = await request('/api/users/2/role', {
      method: 'PATCH', access: admin, body: { roleId: 2 },
    });
    assert.equal(role.status, 200);
    assert.deepEqual(role.body.role, { id: 2, name: 'HR_MANAGER' });
    assert.equal((await request('/api/users/2/role', {
      method: 'PATCH', access: admin, body: { roleId: 999 },
    })).status, 400);
    assert.equal((await request('/api/users/1/role', {
      method: 'PATCH', access: admin, body: { roleId: 2 },
    })).status, 403);
    assert.equal((await request('/api/users/1/status', {
      method: 'PATCH', access: admin, body: { status: 'INACTIVE' },
    })).status, 400);
    assert.equal((await request('/api/users/2/status', {
      method: 'PATCH', access: admin, body: { status: 'IN_PROCESS' },
    })).status, 400);
    assert.equal((await request('/api/users/2/status', {
      method: 'PATCH', access: admin, body: { status: 'INACTIVE' },
    })).status, 200);
    assert.equal((await request('/api/users/2', { access: staff })).status, 401);
  });

  await t.test('roles are ordered and mutations create audit records', async () => {
    const roles = await request('/api/roles', { access: admin });
    assert.equal(roles.status, 200);
    assert.deepEqual(roles.body.data.map(role => role.id), [1, 2, 3, 4]);
    assert.equal((await request('/api/roles', { access: staff })).status, 401);
    const audits = await db.query(`SELECT action FROM public.audit_logs
      WHERE action IN ('USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_STATUS_CHANGED') ORDER BY id`);
    assert.deepEqual(audits.rows.map(row => row.action), ['USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_STATUS_CHANGED']);
    const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    assert.deepEqual(tables.rows.map(row => row.tablename), ['audit_logs', 'roles', 'users']);
  });
});
