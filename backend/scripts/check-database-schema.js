import { readConfig } from '../src/config/env.js';
import { createDatabase } from '../src/config/database.js';
import { createAuthRepository } from '../src/modules/auth/auth.repository.js';
import { createRepository as createUsers } from '../src/modules/users/users.repository.js';
import { createDashboardRepository } from '../src/modules/dashboard/dashboard.repository.js';

// Read-only verification against the configured database. Never migrates or seeds data.
const db = createDatabase(readConfig().db);
const client = await db.connect();
try {
  await client.query('BEGIN READ ONLY');
  for (const name of ['roles', 'departments', 'positions', 'employees', 'snapshots', 'models', 'predictions', 'explanations', 'audit']) {
    const { createRepository } = await import(`../src/modules/${name}/${name}.repository.js`);
    await createRepository(client).list({ limit: '1' });
    console.info(`${name}: OK`);
  }
  await createAuthRepository(client).userByEmail('schema-probe@example.invalid');
  await createAuthRepository(client).userById(0);
  await createUsers(client).list({ page: 1, limit: 1, offset: 0, search: 'schema-probe' });
  await createDashboardRepository(client).summary();
  const { rows } = await client.query('SELECT count(*)::integer AS total FROM public.users');
  console.info(`auth, user management, dashboard/reports: OK; existing accounts: ${rows[0].total}`);
} catch (error) {
  console.error(`Schema check failed (${error.code || 'UNKNOWN'}): ${error.message}`);
  process.exitCode = 1;
} finally { await client.query('ROLLBACK'); client.release(); await db.end(); }
