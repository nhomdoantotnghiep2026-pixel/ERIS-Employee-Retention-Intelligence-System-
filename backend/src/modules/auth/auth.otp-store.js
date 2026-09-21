import { createHmac } from 'node:crypto';

const consumeScript = `
local digest = redis.call('HGET', KEYS[1], 'digest')
if not digest then return 0 end
local attempts = tonumber(redis.call('HGET', KEYS[1], 'attempts') or '0')
if attempts >= tonumber(ARGV[2]) then redis.call('DEL', KEYS[1]); return 0 end
if digest == ARGV[1] then redis.call('DEL', KEYS[1]); return 1 end
attempts = redis.call('HINCRBY', KEYS[1], 'attempts', 1)
if attempts >= tonumber(ARGV[2]) then redis.call('DEL', KEYS[1]) end
return 0
`;

export function createOtpStore(redis, secret, ttlSeconds = 900, maxAttempts = 5) {
  const key = (purpose, userId) => `eris:${purpose}:${userId}`;
  const digest = (purpose, userId, otp) => createHmac('sha256', secret)
    .update(`${purpose}:${userId}:${otp}`).digest('hex');
  return {
    async issue(purpose, userId, otp) {
      await redis.multi().hSet(key(purpose, userId), { digest: digest(purpose, userId, otp), attempts: '0' })
        .expire(key(purpose, userId), ttlSeconds).exec();
    },
    async consume(purpose, userId, otp) {
      return Number(await redis.eval(consumeScript, {
        keys: [key(purpose, userId)], arguments: [digest(purpose, userId, otp), String(maxAttempts)],
      })) === 1;
    },
    async remove(purpose, userId) { await redis.del(key(purpose, userId)); },
  };
}
