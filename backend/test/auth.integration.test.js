import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { createTokens } from '../src/modules/auth/auth.tokens.js';
import { authDatabase } from '../test-support/auth-database.js';

test('Cookie authentication against team schema and HTTP', async t => {
  const db = await authDatabase();
  t.after(() => db.close());
  const password = 'InitialPassword123!';
  const passwordHash = await bcrypt.hash(password, 4);
  const config = { origin: 'http://localhost:5173', jwtSecret: 'test-auth-secret-'.repeat(3),
    roles: { admin: 'ADMIN', staff: 'HR_STAFF', manager: 'HR_MANAGER', analyst: 'AI_ANALYST' },
    auth: { cookieSecure: true, cookieSameSite: 'lax', accessTtlSeconds: 900, refreshTtlSeconds: 604800, resetTtlSeconds: 1800 } };

  async function fixture(sub, options = {}) {
    await db.query('TRUNCATE public.roles RESTART IDENTITY CASCADE');
    for (const role of Object.values(config.roles)) await db.query('INSERT INTO public.roles(name) VALUES ($1)', [role]);
    for (const [email, role, status] of [['admin@eris.test', 1, 'ACTIVE'], ['staff@eris.test', 2, 'ACTIVE'], ['disabled@eris.test', 2, 'INACTIVE']]) {
      await db.query('INSERT INTO public.users(email, password_hash, full_name, role_id, status) VALUES ($1,$2,$3,$4,$5)', [email, passwordHash, 'Test User', role, status]);
    }
    const deliveries = [];
    const mailer = options.mailer ?? { configured: true, async sendReset(email, token) { deliveries.push({ email, token }); } };
    const server = createApp({ db, config, mailer }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    sub.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, { method = 'POST', body, access, cookie, headers = {} } = {}) => {
      const response = await fetch(base + path, { method, headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(access ? { Authorization: `Bearer ${access}` } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers,
      }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie'), headers: response.headers };
    };
    const login = (email = 'staff@eris.test', pass = password) => request('/api/auth/login', { body: { email, password: pass } });
    return { request, login, deliveries };
  }

  await t.test('login sets signed seven-day refresh cookie without session tables', async sub => {
    const f = await fixture(sub);
    const result = await f.login(' STAFF@ERIS.TEST ');
    assert.equal(result.status, 200);
    assert.equal(result.body.user.role, 'HR_STAFF');
    assert.equal(result.body.user.fullName, 'Test User');
    assert.equal(result.body.refreshToken, undefined);
    assert.equal(result.body.user.password_hash, undefined);
    assert.match(result.cookie, /HttpOnly/); assert.match(result.cookie, /Secure/);
    assert.match(result.cookie, /SameSite=Lax/); assert.match(result.cookie, /Path=\/api/);
    const raw = result.cookie.split(';')[0].split('=')[1];
    const refreshClaims = createTokens(config).verify('refresh', raw);
    assert.equal(refreshClaims.exp - refreshClaims.iat, 604800);
    assert.match(result.cookie, /Max-Age=604800/);
    const tables = (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
    assert.deepEqual(tables.map(r => r.tablename), ['audit_logs', 'roles', 'users']);
    const claims = jwt.verify(result.body.accessToken, config.jwtSecret);
    assert.equal(claims.exp - claims.iat, 900);
  });
  await t.test('login has 400, generic 401, inactive 403, and no public register', async sub => {
    const f = await fixture(sub);
    assert.equal((await f.request('/api/auth/login', { body: { email: 'bad' } })).status, 400);
    const unknown = await f.login('unknown@eris.test');
    const wrong = await f.login('staff@eris.test', 'wrong-password');
    assert.equal(unknown.status, 401); assert.equal(wrong.status, 401);
    assert.equal(unknown.body.error.message, wrong.body.error.message);
    assert.equal((await f.login('disabled@eris.test')).status, 403);
    assert.equal((await f.request('/api/auth/register', { body: {} })).status, 404);
  });
  await t.test('me reads live role/status; tampered and expired JWTs fail', async sub => {
    const f = await fixture(sub); const session = await f.login(); const access = session.body.accessToken;
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access })).body.role, 'HR_STAFF');
    await db.query("UPDATE public.users SET role_id=3 WHERE email='staff@eris.test'");
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access })).body.role, 'HR_MANAGER');
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access: access + 'x' })).status, 401);
    const expired = jwt.sign({}, config.jwtSecret, { subject: '2', issuer: 'eris-api', audience: 'eris-web', expiresIn: -1 });
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access: expired })).status, 401);
    await db.query("UPDATE public.users SET status='INACTIVE' WHERE email='staff@eris.test'");
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access })).status, 401);
  });
  await t.test('refresh checks signature, expiry and active user without creating a new cookie', async sub => {
    const f = await fixture(sub); const session = await f.login(); const cookie = session.cookie;
    const refreshed = await f.request('/api/auth/refresh', { cookie });
    assert.equal(refreshed.status, 200); assert.equal(refreshed.cookie, null);
    assert.equal((await f.request('/api/auth/refresh')).status, 401);
    await db.query("UPDATE public.users SET status='INACTIVE' WHERE email='staff@eris.test'");
    assert.equal((await f.request('/api/auth/refresh', { cookie })).status, 401);
    await db.query("UPDATE public.users SET status='ACTIVE' WHERE email='staff@eris.test'");
    const expiredToken = createTokens(config).sign('refresh', { id: 2 }, -1);
    const expired = await f.request('/api/auth/refresh', { cookie: 'eris_refresh=' + expiredToken });
    assert.equal((await f.request('/api/auth/refresh', { cookie: 'eris_refresh=' + expiredToken + 'x' })).status, 401);
    assert.equal(expired.status, 401); assert.match(expired.cookie, /Expires=Thu, 01 Jan 1970/);
  });
  await t.test('logout clears browser cookie; copied refresh token remains valid until expiry', async sub => {
    const f = await fixture(sub); const one = await f.login(); const two = await f.login();
    const logout = await f.request('/api/auth/logout', { cookie: one.cookie });
    assert.equal(logout.body.message, 'Logged out successfully');
    assert.match(logout.cookie, /Expires=Thu, 01 Jan 1970/);
    assert.equal((await f.request('/api/auth/refresh')).status, 401);
    assert.equal((await f.request('/api/auth/refresh', { cookie: one.cookie })).status, 200);
    assert.equal((await f.request('/api/auth/refresh', { cookie: two.cookie })).status, 200);
    assert.equal((await f.request('/api/auth/logout')).status, 200);
  });
  await t.test('HTTP guards reject access and refresh token substitution', async sub => {
    const f = await fixture(sub); const login = await f.login();
    const refresh = login.cookie.split(';')[0].split('=')[1];
    assert.equal((await f.request('/api/auth/me', { method: 'GET', access: refresh })).status, 401);
    assert.equal((await f.request('/api/auth/refresh', { cookie: 'eris_refresh=' + login.body.accessToken })).status, 401);
  });
  await t.test('change password clears cookie but does not revoke stateless refresh tokens', async sub => {
    const f = await fixture(sub); const one = await f.login(); const two = await f.login();
    const access = one.body.accessToken;
    assert.equal((await f.request('/api/auth/change-password', { method: 'PATCH', access,
      body: { currentPassword: 'wrong', newPassword: 'ChangedPassword123!' } })).status, 400);
    assert.equal((await f.request('/api/auth/refresh', { cookie: two.cookie })).status, 200);
    const changed = await f.request('/api/auth/change-password', { method: 'PATCH', access,
      body: { currentPassword: password, newPassword: 'ChangedPassword123!' } });
    assert.equal(changed.status, 200);
    assert.match(changed.cookie, /Expires=Thu, 01 Jan 1970/);
    for (const session of [one, two]) assert.equal((await f.request('/api/auth/refresh', { cookie: session.cookie })).status, 200);
    assert.equal((await f.login()).status, 401);
    assert.equal((await f.login('staff@eris.test', 'ChangedPassword123!')).status, 200);
  });
  await t.test('reset link is password-bound, single-use and does not revoke refresh tokens', async sub => {
    const f = await fixture(sub); const login = await f.login();
    const known = await f.request('/api/auth/forgot-password', { body: { email: 'staff@eris.test' } });
    const unknown = await f.request('/api/auth/forgot-password', { body: { email: 'unknown@eris.test' } });
    const inactive = await f.request('/api/auth/forgot-password', { body: { email: 'disabled@eris.test' } });
    assert.deepEqual(known.body, unknown.body); assert.deepEqual(known.body, inactive.body);
    assert.equal(f.deliveries.length, 1);
    const token = f.deliveries[0].token;
    const storedUser = (await db.query("SELECT id, password_hash FROM public.users WHERE email='staff@eris.test'")).rows[0];
    const resetClaims = createTokens(config).verify('reset', token, storedUser.password_hash);
    assert.equal(resetClaims.exp - resetClaims.iat, 1800);
    assert.ok(!JSON.stringify(known.body).includes(token));
    const body = { token, newPassword: 'ResetPassword456!' };
    assert.equal((await f.request('/api/auth/reset-password', { body })).status, 200);
    assert.equal((await f.request('/api/auth/reset-password', { body })).status, 400);
    assert.equal((await f.request('/api/auth/refresh', { cookie: login.cookie })).status, 200);
    assert.equal((await f.login('staff@eris.test', 'ResetPassword456!')).status, 200);
  });
  await t.test('expired reset and reused token during parallel requests are rejected', async sub => {
    const f = await fixture(sub);
    await f.request('/api/auth/forgot-password', { body: { email: 'staff@eris.test' } });
    const user = (await db.query("SELECT id, password_hash FROM public.users WHERE email='staff@eris.test'")).rows[0];
    const expiredReset = createTokens(config).sign('reset', user, -1);
    assert.equal((await f.request('/api/auth/reset-password', { body: { token: expiredReset, newPassword: 'ResetPassword456!' } })).status, 400);
    await f.request('/api/auth/forgot-password', { body: { email: 'staff@eris.test' } });
    const body = { token: f.deliveries[1].token, newPassword: 'ResetPassword456!' };
    const results = await Promise.all([f.request('/api/auth/reset-password', { body }), f.request('/api/auth/reset-password', { body })]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
  });
  await t.test('password change invalidates pending reset links and rejects a weak password', async sub => {
    const f = await fixture(sub); const session = await f.login();
    await f.request('/api/auth/forgot-password', { body: { email: 'staff@eris.test' } });
    assert.equal((await f.request('/api/auth/change-password', { method: 'PATCH', access: session.body.accessToken,
      body: { currentPassword: password, newPassword: 'weak' } })).status, 400);
    assert.equal((await f.request('/api/auth/change-password', { method: 'PATCH', access: session.body.accessToken,
      body: { currentPassword: password, newPassword: 'ChangedPassword123!' } })).status, 200);
    assert.equal((await f.request('/api/auth/reset-password', { body: { token: f.deliveries[0].token, newPassword: 'ResetPassword456!' } })).status, 400);
  });
  await t.test('password update rolls back if audit write fails', async sub => {
    const f = await fixture(sub); const session = await f.login();
    await db.query("ALTER TABLE public.audit_logs ADD CONSTRAINT test_password_audit_failure CHECK (action <> 'AUTH_PASSWORD_CHANGED')");
    try {
      assert.equal((await f.request('/api/auth/change-password', { method: 'PATCH', access: session.body.accessToken,
        body: { currentPassword: password, newPassword: 'ChangedPassword123!' } })).status, 500);
      assert.equal((await f.login()).status, 200);
      assert.equal((await f.request('/api/auth/refresh', { cookie: session.cookie })).status, 200);
    } finally { await db.query('ALTER TABLE public.audit_logs DROP CONSTRAINT test_password_audit_failure'); }
  });
  await t.test('SMTP failure does not reveal account or token', async sub => {
    const f = await fixture(sub, { mailer: { configured: true, async sendReset() { throw new Error('SMTP secret'); } } });
    const known = await f.request('/api/auth/forgot-password', { body: { email: 'staff@eris.test' } });
    const unknown = await f.request('/api/auth/forgot-password', { body: { email: 'none@eris.test' } });
    assert.equal(known.status, 200); assert.deepEqual(known.body, unknown.body);
    assert.equal(known.body.token, undefined);
  });
  await t.test('missing SMTP configuration fails uniformly', async sub => {
    const f = await fixture(sub, { mailer: { configured: false } });
    for (const email of ['staff@eris.test', 'none@eris.test']) {
      assert.equal((await f.request('/api/auth/forgot-password', { body: { email } })).status, 503);
    }
  });
  await t.test('ADMIN creates user and audit record; role escalation and duplicate email blocked', async sub => {
    const f = await fixture(sub); const admin = await f.login('admin@eris.test'); const staff = await f.login();
    const body = { email: 'New@eris.test', password, fullName: 'New Analyst', role: 'AI_ANALYST' };
    assert.equal((await f.request('/api/users', { body, access: staff.body.accessToken })).status, 403);
    const created = await f.request('/api/users', { body, access: admin.body.accessToken });
    assert.equal(created.status, 201); assert.equal(created.body.email, 'new@eris.test');
    assert.equal(created.body.password_hash, undefined);
    assert.equal((await f.request('/api/users', { body, access: admin.body.accessToken })).status, 409);
    assert.equal((await f.request('/api/users', { body: { ...body, role: 'ADMIN' }, access: admin.body.accessToken })).status, 400);
    const stored = (await db.query('SELECT password_hash FROM public.users WHERE id=$1', [created.body.id])).rows[0];
    assert.ok(await bcrypt.compare(password, stored.password_hash));
    const audit = (await db.query("SELECT * FROM public.audit_logs WHERE action='USER_CREATED'")).rows[0];
    assert.equal(audit.user_id, 1); assert.equal(audit.entity_id, created.body.id);
    assert.equal((await f.login('new@eris.test')).status, 200);
  });
  await t.test('audit failure rolls back user creation', async sub => {
    const f = await fixture(sub); const admin = await f.login('admin@eris.test');
    await db.query("ALTER TABLE public.audit_logs ADD CONSTRAINT test_audit_failure CHECK (action <> 'USER_CREATED')");
    try {
      const result = await f.request('/api/users', { access: admin.body.accessToken,
        body: { email: 'rollback@eris.test', password, fullName: 'Rollback', role: 'HR_STAFF' } });
      assert.equal(result.status, 500);
      assert.equal((await db.query("SELECT count(*)::int AS n FROM public.users WHERE email='rollback@eris.test'")).rows[0].n, 0);
    } finally { await db.query('ALTER TABLE public.audit_logs DROP CONSTRAINT test_audit_failure'); }
  });
  await t.test('cross-site cookie requests blocked and credentialed CORS enabled', async sub => {
    const f = await fixture(sub); const session = await f.login();
    const bad = await f.request('/api/auth/refresh', { cookie: session.cookie, headers: { Origin: 'https://evil.test' } });
    assert.equal(bad.status, 403);
    assert.equal((await f.request('/api/auth/logout', { cookie: session.cookie, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
    const good = await f.request('/api/auth/refresh', { cookie: session.cookie, headers: { Origin: config.origin } });
    assert.equal(good.status, 200); assert.equal(good.headers.get('access-control-allow-credentials'), 'true');
  });
  await t.test('forgot-password rate limiter returns 429', async sub => {
    const f = await fixture(sub);
    for (let i = 0; i < 5; i++) assert.equal((await f.request('/api/auth/forgot-password', { body: { email: 'unknown@eris.test' } })).status, 200);
    assert.equal((await f.request('/api/auth/forgot-password', { body: { email: 'unknown@eris.test' } })).status, 429);
  });
});
