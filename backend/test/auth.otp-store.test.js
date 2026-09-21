import test from 'node:test';
import assert from 'node:assert/strict';
import { createOtpStore } from '../src/modules/auth/auth.otp-store.js';

test('OTP store hashes codes and applies the configured Redis expiry', async () => {
  const calls = [];
  const chain = {
    hSet(key, value) { calls.push(['hSet', key, value]); return chain; },
    expire(key, ttl) { calls.push(['expire', key, ttl]); return chain; },
    async exec() { calls.push(['exec']); },
  };
  const redis = { multi() { return chain; } };
  const store = createOtpStore(redis, 'test-secret-'.repeat(4), 900, 5);
  await store.issue('password-reset', 12, '012345');
  assert.equal(calls[0][1], 'eris:password-reset:12');
  assert.notEqual(calls[0][2].digest, '012345');
  assert.equal(calls[0][2].digest.length, 64);
  assert.deepEqual(calls[1], ['expire', 'eris:password-reset:12', 900]);
});
