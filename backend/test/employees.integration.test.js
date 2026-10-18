import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { authDatabase } from '../test-support/auth-database.js';
import { createApp } from '../src/app.js';
import { createTokens } from '../src/modules/auth/auth.tokens.js';
import { HttpError } from '../src/common/errors.js';

const exactAddress = '197 Trần Phú, Phường 4, Quận 5, Hồ Chí Minh';
test('four HR employee APIs validate profiles and automatically maintain home distance', async t => {
  const db = await authDatabase(); t.after(() => db.close());
  await db.query("INSERT INTO public.role(name) VALUES ('ADMIN'),('HR'),('EMPLOYEE')");
  await db.query("INSERT INTO public.departments(code,name,status) VALUES ('IT','Engineering','ACTIVE'),('OLD','Old department','INACTIVE')");
  await db.query("INSERT INTO public.positions(code,name,job_level,status) VALUES ('DEV','Developer','Senior','ACTIVE'),('OLD','Old position','Junior','INACTIVE')");
  await db.query("INSERT INTO public.employees(employee_code,full_name,hire_date,department_id,position_id) VALUES ('SELF','Existing Employee','2020-01-01',1,1)");
  await db.query(`INSERT INTO public.users(email,password_hash,role_id,status,employee_id) VALUES
    ('admin@test.example','unused',1,'ACTIVE',null),('hr@test.example','unused',2,'ACTIVE',null),('employee@test.example','unused',3,'ACTIVE',1)`);
  const config = { origin: 'http://localhost:5173', jwtSecret: 'employee-test-secret-'.repeat(3),
    roles: { admin: 'ADMIN', staff: 'HR', employee: 'EMPLOYEE' } };
  let geocodes = 0, routes = 0, failRoute = false;
  const distanceService = {
    async geocodeFull(query) {
      geocodes += 1;
      if (!/197/.test(query)) return [];
      return [{ ref_id: 'geocode:home', name: '197 Trần Phú', boundaries: [
        { type: 2, full_name: 'Phường 4' }, { type: 1, full_name: 'Quận 5' }, { type: 0, full_name: 'Thành phố Hồ Chí Minh' }] }];
    },
    async placeByRefId() { return { hs_num: '197', street: 'Đường Trần Phú', ward: 'Phường 4', district: 'Quận 5',
      city: 'Thành phố Hồ Chí Minh', display: exactAddress, lat: 10.75, lng: 106.65 }; },
    async calculate() { routes += 1; if (failRoute) throw new HttpError(503, 'ROUTING_RATE_LIMITED', 'Quota reached'); return { distanceFromHomeKm: 24.2 }; },
  };
  const server = createApp({ db, config, mailer: { configured: false }, distanceService }).listen(0, '127.0.0.1');
  await once(server, 'listening'); t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`, tokens = createTokens(config);
  const access = { admin: tokens.sign('access', { id: 1 }, 3600), hr: tokens.sign('access', { id: 2 }, 3600), employee: tokens.sign('access', { id: 3 }, 3600) };
  const request = async (path, role = 'hr', method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json',
      ...(access[role] ? { Authorization: `Bearer ${access[role]}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  const input = { employeeCode: 'EMP001', fullName: 'Nguyen Van A', email: 'VANA@company.example', phone: '0901234567',
    dateOfBirth: '2000-05-20', gender: 'MALE', address: exactAddress, departmentId: 1, positionId: 1,
    hireDate: '2026-01-10', employmentType: 'FULL_TIME', employmentStatus: 'ACTIVE', currentSalary: 15000000 };
  let employeeId;
  await t.test('both URL versions require HR for all four operations', async () => {
    for (const prefix of ['/api', '/api/v1']) for (const role of ['admin', 'employee', 'none']) {
      for (const [method, suffix, body] of [['GET', '', null], ['GET', '/1', null], ['POST', '', input], ['PATCH', '/1', { phone: '0912345678' }]]) {
        assert.equal((await request(`${prefix}/employees${suffix}`, role, method, body)).status, role === 'none' ? 401 : 403);
      }
    }
    assert.equal(geocodes, 0);
  });
  await t.test('HR creates a profile with server-computed distance and audit, without creating a user', async () => {
    const result = await request('/api/employees', 'hr', 'POST', input);
    assert.equal(result.status, 201); employeeId = result.body.id;
    assert.equal(result.body.employeeCode, 'EMP001'); assert.equal(result.body.email, 'vana@company.example');
    assert.equal(result.body.distanceFromHomeKm, 24.2); assert.equal(result.body.distanceCalculation.status, 'READY');
    assert.equal(result.body.currentSalary, '15000000.00'); assert.equal(result.body.dateOfBirth, '2000-05-20');
    assert.equal(result.body.hireDate, '2026-01-10'); assert.equal(result.body.position.jobLevel, 'Senior');
    const audit = (await db.query("SELECT * FROM public.audit_logs WHERE action='EMPLOYEE_CREATED' AND entity_id=$1", [employeeId])).rows[0];
    assert.equal(audit.user_id, 2); assert.equal(audit.new_value.distanceCalculation.status, 'READY');
    assert.equal((await db.query('SELECT count(*)::integer AS total FROM public.users')).rows[0].total, 3);
  });
  await t.test('list filters and pagination work; detail exposes the full profile using camelCase', async () => {
    const list = await request('/api/employees?q=EMP001&departmentId=1&positionId=1&employmentStatus=ACTIVE&page=1&limit=1');
    assert.equal(list.status, 200); assert.equal(list.body.pagination.total, 1); assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].department.name, 'Engineering'); assert.equal(list.body.data[0].currentSalary, undefined);
    assert.equal((await request('/api/employees?q=%25')).body.data.length, 0);
    assert.equal((await request('/api/employees?departmentId=1&departmentId=2')).status, 400);
    assert.equal((await request('/api/employees?unsupported=1')).status, 400);
    const detail = await request(`/api/v1/employees/${employeeId}`);
    assert.equal(detail.status, 200); assert.equal(detail.body.fullName, input.fullName); assert.equal(detail.body.phone, input.phone);
    assert.equal((await request('/api/employees/999')).body.error.code, 'EMPLOYEE_NOT_FOUND');
  });
  await t.test('HR can preview distance before saving the form without changing employee records', async () => {
    const before = (await db.query('SELECT count(*)::integer AS total FROM public.employees')).rows[0].total;
    const preview = await request('/api/distance/resolve-address', 'hr', 'POST', { address: exactAddress });
    assert.equal(preview.status, 200); assert.equal(preview.body.distanceFromHomeKm, 24.2);
    assert.equal((await db.query('SELECT count(*)::integer AS total FROM public.employees')).rows[0].total, before);
    assert.equal((await request('/api/distance/resolve-address', 'employee', 'POST', { address: exactAddress })).status, 403);
    assert.equal((await request('/api/distance/resolve-address', 'hr', 'POST', { address: '' })).status, 400);
  });
  await t.test('invalid references, dates, money and duplicate identifiers fail before calling maps', async () => {
    const before = geocodes;
    const cases = [
      [{ employeeCode: 'emp001', email: 'different@example.test' }, 409, 'EMPLOYEE_CODE_EXISTS'],
      [{ employeeCode: 'EMP002' }, 409, 'EMPLOYEE_EMAIL_EXISTS'],
      [{ employeeCode: 'EMP002', email: 'other@test.example', departmentId: 999 }, 404, 'DEPARTMENT_NOT_FOUND'],
      [{ employeeCode: 'EMP002', email: 'other@test.example', departmentId: 2 }, 400, 'DEPARTMENT_INACTIVE'],
      [{ employeeCode: 'EMP002', email: 'other@test.example', positionId: 999 }, 404, 'POSITION_NOT_FOUND'],
      [{ employeeCode: 'EMP002', email: 'other@test.example', positionId: 2 }, 400, 'POSITION_INACTIVE'],
      [{ dateOfBirth: '2025-02-29' }, 400, 'VALIDATION_ERROR'],
      [{ dateOfBirth: '2099-01-01' }, 400, 'VALIDATION_ERROR'],
      [{ hireDate: '1999-01-01' }, 400, 'VALIDATION_ERROR'],
      [{ currentSalary: -1 }, 400, 'VALIDATION_ERROR'],
      [{ currentSalary: '1.999' }, 400, 'VALIDATION_ERROR'],
      [{ distanceFromHomeKm: 99 }, 400, 'VALIDATION_ERROR'],
    ];
    for (const [changes, status, code] of cases) {
      const result = await request('/api/employees', 'hr', 'POST', { ...input, ...changes });
      assert.equal(result.status, status, JSON.stringify(changes)); assert.equal(result.body.error.code, code);
    }
    assert.equal(geocodes, before);
  });
  await t.test('PATCH keeps omitted fields and does not call maps for an unrelated edit', async () => {
    const before = geocodes;
    const edited = await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { phone: '0912345678', currentSalary: '1234567890123.45' });
    assert.equal(edited.status, 200); assert.equal(edited.body.fullName, input.fullName);
    assert.equal(edited.body.currentSalary, '1234567890123.45'); assert.equal(edited.body.distanceFromHomeKm, 24.2);
    assert.equal(geocodes, before);
    assert.equal((await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', {})).status, 400);
    assert.equal((await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { departmentId: 2 })).status, 400);
    assert.equal((await request('/api/employees/999', 'hr', 'PATCH', { phone: '0912345678' })).status, 404);
  });
  await t.test('changed addresses reset stale distance on provider failure or ambiguous input', async () => {
    failRoute = true;
    const edited = await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { address: '197 Tran Phu, Phuong 4, Quan 5, Ho Chi Minh' });
    assert.equal(edited.status, 200); assert.equal(edited.body.distanceFromHomeKm, null);
    assert.equal(edited.body.distanceCalculation.reason, 'ROUTING_RATE_LIMITED');
    assert.equal((await db.query('SELECT distance_from_home_km FROM public.employees WHERE id=$1', [employeeId])).rows[0].distance_from_home_km, null);
    failRoute = false;
    const retry = await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { address: exactAddress });
    assert.equal(retry.body.distanceFromHomeKm, 24.2);
    const review = await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { address: 'Ho Chi Minh City' });
    assert.equal(review.body.distanceFromHomeKm, null); assert.equal(review.body.distanceCalculation.status, 'REVIEW');
    const cleared = await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { address: null });
    assert.equal(cleared.body.distanceCalculation.status, 'NOT_PROVIDED');
  });
  await t.test('audit failures roll back the employee update', async () => {
    await db.query("ALTER TABLE public.audit_logs ADD CONSTRAINT reject_employee_test CHECK (action <> 'EMPLOYEE_UPDATED') NOT VALID");
    try {
      assert.equal((await request(`/api/employees/${employeeId}`, 'hr', 'PATCH', { fullName: 'Must roll back' })).status, 500);
      assert.equal((await db.query('SELECT full_name FROM public.employees WHERE id=$1', [employeeId])).rows[0].full_name, input.fullName);
    } finally { await db.query('ALTER TABLE public.audit_logs DROP CONSTRAINT reject_employee_test'); }
  });
  await t.test('simultaneous duplicate employee creates allow only one record', async () => {
    const body = { employeeCode: 'CONCURRENT', fullName: 'Concurrent Employee', hireDate: '2026-01-01', departmentId: 1, positionId: 1 };
    const responses = await Promise.all([request('/api/employees', 'hr', 'POST', body), request('/api/employees', 'hr', 'POST', body)]);
    assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  });
});
