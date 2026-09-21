import { readConfig } from './config/env.js';
import { createDatabase } from './config/database.js';
import { createApp } from './app.js';
import { createClient } from 'redis';
import { createOtpStore } from './modules/auth/auth.otp-store.js';

const config = readConfig();
const db = createDatabase(config.db);
db.on('error', () => console.error(JSON.stringify({ event: 'database_pool_error' })));
const redis = createClient({ url: config.redisUrl });
redis.on('error', () => console.error(JSON.stringify({ event: 'redis_error' })));
await redis.connect();
const otpStore = createOtpStore(redis, config.jwtSecret, config.auth.otpTtlSeconds, config.auth.otpMaxAttempts);
const server = createApp({ db, config, otpStore }).listen(config.port, '0.0.0.0', () => {
  const baseUrl = `http://localhost:${config.port}`;
  console.info(`ERIS backend is running at ${baseUrl}`);
  console.info(`Postman base URL: ${baseUrl}/api`);
});
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(async () => { await Promise.all([db.end(), redis.quit()]); clearTimeout(timeout); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
