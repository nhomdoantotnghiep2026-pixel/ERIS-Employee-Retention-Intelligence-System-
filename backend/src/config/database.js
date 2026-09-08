import pg from 'pg';
import { readFileSync } from 'node:fs';

export function createDatabase(config) {
  const { sslMode, caPath, ...connection } = config;
  return new pg.Pool({
    ...connection,
    ssl: sslMode === 'require' ? {
      rejectUnauthorized: true, ...(caPath ? { ca: readFileSync(caPath, 'utf8') } : {}),
    } : false,
    max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
    statement_timeout: 10000, application_name: 'eris-backend',
  });
}
