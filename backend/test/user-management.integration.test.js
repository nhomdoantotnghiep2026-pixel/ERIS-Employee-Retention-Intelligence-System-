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
    roles: { admin: 'ADMIN', staff: 'HR', employee: 'EMPLOYEE' },
    auth: { cookieSecure: true, cookieSameSite: 'lax', accessTtlSeconds: 3600, refreshTtlSeconds: 604800 },
  };
  for (const role of ['ADMIN', 'HR', 'EMPLOYEE']) {
    await db.query('INSERT INTO public.role(name, description) VALUES ($1, $2)', [role, `${role} role`]);
  }
  for (const [email, name, role] of [
    ['admin@eris.test', 'Admin User', 1],
    ['staff@eris.test', 'Staff User', 2],
    ['other@eris.test', 'Other User', 3],
  ]) {
    const employee = (await db.query('INSERT INTO public.employees(employee_code,full_name,hire_date) VALUES ($1,$2,CURRENT_DATE) RETURNING id', [email, name])).rows[0];
    await db.query(`INSERT INTO public.users(email, password_hash, employee_id, role_id, status)
      VALUES ($1, $2, $3, $4, 'ACTIVE')`, [email, hash, employee.id, role]);
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
    const result = await request('/api/users?page=1&limit=10&search=staff&roleId=2&status=ACTIVE', { access: admin });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.length, 1);
    assert.equal(result.body.data[0].fullName, 'Staff User');
    assert.deepEqual(result.body.data[0].role, { id: 2, name: 'HR' });
    assert.equal(result.body.data[0].password_hash, undefined);
    assert.equal(result.body.pagination.total, 1);
    assert.equal((await request('/api/users?status=UNKNOWN', { access: admin })).status, 400);
    assert.equal((await request('/api/users?status=IN_PROCESS', { access: admin })).status, 400);
    assert.equal((await request('/api/users', { access: staff })).status, 403);
  });

  await t.test('non-ADMIN reads only its own account', async () => {
    assert.equal((await request('/api/users/2', { access: staff })).status, 200);
    assert.equal((await request('/api/users/3', { access: staff })).status, 403);
    assert.equal((await request('/api/users/999', { access: admin })).status, 404);
  });

  await t.test('UM-03 profile update endpoint has been removed for all roles', async () => {
    const updated = await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { fullName: 'Updated Staff', email: 'newstaff@eris.test' },
    });
    assert.equal(updated.status, 404);
    assert.equal((await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { email: 'other@eris.test' },
    })).status, 404);
    assert.equal((await request('/api/users/2', {
      method: 'PATCH', access: staff, body: { roleId: 2 },
    })).status, 404);
    assert.equal((await request('/api/v1/users/2', { method: 'PATCH', access: admin, body: { fullName: 'Blocked' } })).status, 404);
    assert.equal((await db.query('SELECT full_name FROM public.employees WHERE id=2')).rows[0].full_name, 'Staff User');
  });

  await t.test('ADMIN changes role and status while protected actions fail', async () => {
    const role = await request('/api/users/2/role', {
      method: 'PATCH', access: admin, body: { roleId: 3 },
    });
    assert.equal(role.status, 200);
    assert.deepEqual(role.body.role, { id: 3, name: 'EMPLOYEE' });
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
    assert.equal((await request('/api/users/2/status', { method: 'PATCH', access: admin, body: { status: 'ACTIVE' } })).status, 400);
    assert.equal((await request('/api/users/2/status', {
      method: 'PATCH', access: admin, body: { status: 'INACTIVE' },
    })).status, 200);
    assert.equal((await request('/api/users/2', { access: staff })).status, 401);
  });

  await t.test('roles are ordered and mutations create audit records', async () => {
    const roles = await request('/api/roles', { access: admin });
    assert.equal(roles.status, 200);
    assert.deepEqual(roles.body.data.map(role => ({ id: role.id, name: role.name })),
      [{ id: 1, name: 'ADMIN' }, { id: 2, name: 'HR' }, { id: 3, name: 'EMPLOYEE' }]);
    assert.equal((await request('/api/roles', { access: staff })).status, 401);
    const audits = await db.query(`SELECT action FROM public.audit_logs
      WHERE action IN ('USER_UPDATED', 'USER_ROLE_CHANGED', 'USER_STATUS_CHANGED') ORDER BY id`);
    assert.deepEqual(audits.rows.map(row => row.action), ['USER_ROLE_CHANGED', 'USER_STATUS_CHANGED']);
    const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    assert.ok(tables.rows.some(row => row.tablename === 'role'));
    assert.equal(tables.rows.some(row => /session|otp/.test(row.tablename)), false);
  });
});
