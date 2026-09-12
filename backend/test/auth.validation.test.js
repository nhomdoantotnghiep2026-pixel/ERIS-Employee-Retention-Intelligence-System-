import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../src/config/env.js';
import { newPassword, email, bodyObject } from '../src/modules/auth/auth.validation.js';

const env = { PGHOST: 'localhost', PGDATABASE: 'test', PGUSER: 'test', PGPASSWORD: 'local-test-only', JWT_SECRET: 'test-secret-'.repeat(4) };
test('new passwords enforce the documented policy and bcrypt byte boundary', () => {
  for (const password of ['short', 'alllowercase123!', 'NoDigitsHere!!!', 'NoSymbolsHere123', 'A1!' + 'é'.repeat(35)]) {
    assert.throws(() => newPassword(password), { status: 400 });
  }
  assert.equal(newPassword('StrongPassword123!'), 'StrongPassword123!');
  assert.throws(() => bodyObject({ email: 'a@b.test', role: 'ADMIN' }, ['email']), { status: 400 });
  assert.equal(email(' Staff@ERIS.test '), 'staff@eris.test');
});
test('auth config rejects insecure production and untrusted reset URLs', () => {
  assert.throws(() => readConfig({ ...env, NODE_ENV: 'production' }));
  assert.throws(() => readConfig({ ...env, AUTH_COOKIE_SAME_SITE: 'none', AUTH_COOKIE_SECURE: 'false' }));
  assert.throws(() => readConfig({ ...env, PASSWORD_RESET_URL: 'https://attacker.test/reset' }));
  assert.throws(() => readConfig({ ...env, ACCESS_TOKEN_TTL_SECONDS: '0' }));
  const config = readConfig({ ...env, NODE_ENV: 'production', CORS_ORIGIN: 'https://eris.example', PASSWORD_RESET_URL: 'https://eris.example/reset-password' });
  assert.equal(config.auth.cookieSecure, true);
  assert.equal(config.roles.admin, 'ADMIN');
});
