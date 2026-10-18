import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import { authDatabase } from '../test-support/auth-database.js';
import { createApp } from '../src/app.js';

test('current team schema supports HR APIs, employee links and latest-result dashboard', async t => {
  const db = await authDatabase(); t.after(() => db.close());
  const config = { origin: 'http://localhost:5173', jwtSecret: 'current-schema-test-secret-'.repeat(3),
    initialUserPassword: 'Testpassword123!', roles: { admin: 'ADMIN', staff: 'HR', employee: 'EMPLOYEE' },
    auth: { cookieSecure: false, cookieSameSite: 'lax' } };
  const hash = await bcrypt.hash('Testpassword123!', 4);
  await db.query("INSERT INTO public.role(name) VALUES ('ADMIN'),('HR'),('EMPLOYEE')");
  await db.query("INSERT INTO public.departments(code,name) VALUES ('IT','Engineering')");
  await db.query("INSERT INTO public.positions(code,name,job_level) VALUES ('DEV','Developer','Senior')");
  for (const id of [1, 2, 3]) await db.query(`INSERT INTO public.employees(employee_code,full_name,hire_date,department_id,position_id,current_salary)
    VALUES ($1,$2,CURRENT_DATE,1,1,1000)`, [`E${id}`, `Employee ${id}`]);
  await db.query(`INSERT INTO public.users(email,password_hash,role_id,status,employee_id) VALUES
    ('admin@example.test',$1,1,'ACTIVE',null),('hr@example.test',$1,2,'ACTIVE',1),('employee@example.test',$1,3,'ACTIVE',2)`, [hash]);
  await db.query('INSERT INTO public.ai_input(employee_id,distance_from_home_km) VALUES (1,12.5)');
  await db.query("INSERT INTO public.model_run(name,created_by) VALUES ('October run',1)");
  await db.query(`INSERT INTO public.prediction_results(prediction_run_id,employee_id,snapshot_id,attrition_probability,risk_level,created_at)
    VALUES (1,1,1,0.1,'LOW','2026-10-01'),(1,1,1,0.8,'HIGH','2026-10-18')`);
  await db.query("INSERT INTO public.explainable(prediction_result_id,feature_name,impact_value) VALUES (2,'distance_from_home_km',0.2)");
  const server = createApp({ db, config, mailer: { configured: true, async sendWelcome() {} } }).listen(0, '127.0.0.1');
  await once(server, 'listening'); t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, token, method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  const login = email => request('/api/auth/login', null, 'POST', { email, password: 'Testpassword123!' });
  const adminLogin = await login('admin@example.test'); assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.body.user.fullName, null);
  const admin = adminLogin.body.accessToken, hr = (await login('hr@example.test')).body.accessToken;
  const employee = (await login('employee@example.test')).body.accessToken;
  for (const path of ['roles', 'departments', 'positions', 'employees', 'snapshots', 'models', 'predictions', 'explanations']) {
    const access = path === 'roles' ? admin : hr;
    const response = await request(`/api/v1/${path}`, access);
    assert.equal(response.status, 200, path); assert.ok(response.body.data.length > 0, path);
    assert.equal((await request(`/api/v1/${path}/${response.body.data[0].id}`, access)).status, 200, path);
  }
  assert.equal((await request('/api/v1/audit', admin)).status, 200);
  assert.equal((await request('/api/v1/employees?manager_id=1', hr)).status, 400);
  assert.equal((await request('/api/v1/retention-actions', hr)).status, 503);
  assert.equal((await request('/api/v1/outcomes', hr)).status, 503);
  assert.equal((await request('/api/v1/employees', employee)).status, 403);
  assert.equal((await request('/api/v1/distance/imports/preview', employee, 'POST', {})).status, 403);
  const summary = await request('/api/v1/dashboard/summary', hr);
  assert.equal(summary.status, 200); assert.equal(summary.body.data[0].high, 1);
  assert.equal(summary.body.data[0].low, 0); assert.equal(summary.body.data[0].unassessed, 2);
  assert.equal((await request('/api/users/1', admin, 'PATCH', { fullName: 'No employee' })).status, 404);
  const updated = await request('/api/users/2', hr, 'PATCH', { fullName: 'Updated Employee' });
  assert.equal(updated.status, 404);
  const create = body => request('/api/auth/user_register', admin, 'POST', body);
  assert.equal((await create({ email: 'new@example.test', roleId: 3 })).status, 400);
  assert.equal((await create({ email: 'new@example.test', roleId: 3, employeeId: 999 })).status, 400);
  const created = await create({ email: 'new@example.test', roleId: 3, employeeId: 3 });
  assert.equal(created.status, 201); assert.equal(created.body.fullName, 'Employee 3');
  assert.equal(created.body.employeeId, 3);
  assert.equal((await create({ email: 'another@example.test', roleId: 3, employeeId: 3 })).status, 409);
});
