import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createTokens } from '../src/modules/auth/auth.tokens.js';

const config = { jwtSecret: 'unit-test-key-'.repeat(4) };
const user = { id: 10, password_hash: 'test-password-hash' };

test('access, refresh and reset tokens cannot substitute for each other', () => {
  const tokens = createTokens(config);
  for (const kind of ['access', 'refresh', 'reset']) {
    const token = tokens.sign(kind, user, 900);
    assert.equal(tokens.verify(kind, token, user.password_hash).sub, '10');
    for (const other of ['access', 'refresh', 'reset'].filter(value => value !== kind)) {
      assert.throws(() => tokens.verify(other, token, user.password_hash));
    }
  }
});

test('signature, required expiry, and password-bound reset key are enforced', () => {
  const tokens = createTokens(config);
  const noExpiry = jwt.sign({ purpose: 'refresh' }, config.jwtSecret, { subject: '10', issuer: 'eris-api', audience: 'eris-refresh' });
  assert.throws(() => tokens.verify('refresh', noExpiry));
  assert.throws(() => tokens.verify('refresh', tokens.sign('refresh', user, -1)));
  const forged = jwt.sign({ purpose: 'reset' }, config.jwtSecret, { subject: '10', issuer: 'eris-api', audience: 'eris-password-reset', expiresIn: 900 });
  assert.throws(() => tokens.verify('reset', forged, user.password_hash));
  const reset = tokens.sign('reset', user, 1800);
  assert.throws(() => tokens.verify('reset', reset, 'new-password-hash'));
  assert.equal(createTokens(config).verify('refresh', tokens.sign('refresh', user, 604800)).sub, '10');
});
