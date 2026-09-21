import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createTokens } from '../src/modules/auth/auth.tokens.js';

const config = { jwtSecret: 'unit-test-key-'.repeat(4) };
const user = { id: 10 };

test('access, refresh and password-change tokens cannot substitute for each other', () => {
  const tokens = createTokens(config);
  const kinds = ['access', 'refresh', 'passwordChange'];
  for (const kind of kinds) {
    const token = tokens.sign(kind, user, 900);
    assert.equal(tokens.verify(kind, token).sub, '10');
    for (const other of kinds.filter(value => value !== kind)) assert.throws(() => tokens.verify(other, token));
  }
  assert.throws(() => tokens.sign('reset', user, 900));
});

test('signature and required expiry are enforced', () => {
  const tokens = createTokens(config);
  const noExpiry = jwt.sign({ purpose: 'refresh' }, config.jwtSecret, {
    subject: '10', issuer: 'eris-api', audience: 'eris-refresh',
  });
  assert.throws(() => tokens.verify('refresh', noExpiry));
  assert.throws(() => tokens.verify('refresh', tokens.sign('refresh', user, -1)));
  assert.equal(tokens.verify('refresh', tokens.sign('refresh', user, 604800)).sub, '10');
});
