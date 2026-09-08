import { readConfig } from './config/env.js';
import { createDatabase } from './config/database.js';
import { createApp } from './app.js';

const config = readConfig();
const db = createDatabase(config.db);
db.on('error', () => console.error(JSON.stringify({ event: 'database_pool_error' })));
const server = createApp({ db, config }).listen(config.port, '0.0.0.0', () => {
  console.info(JSON.stringify({ event: 'server_started', port: config.port }));
});
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(async () => { await db.end(); clearTimeout(timeout); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
