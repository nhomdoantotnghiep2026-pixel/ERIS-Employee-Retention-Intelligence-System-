import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

export async function authDatabase() {
  const engine = new PGlite();
  const schema = readFileSync(new URL('../../database/schema.reference.sql', import.meta.url), 'utf8')
    .replace(/^\\.*$/gm, '')
    .replace(/^ALTER .* OWNER TO .*;\r?$/gm, '');
  await engine.exec(schema);
  await engine.exec(readFileSync(new URL('../../database/migrations/001_auth_sessions.sql', import.meta.url), 'utf8'));
  // PGlite is single-connection. Serialize the Pool-shaped adapter so HTTP
  // requests cannot accidentally join another request's transaction.
  let tail = Promise.resolve();
  const acquire = async () => {
    const previous = tail;
    let release;
    tail = new Promise(resolve => { release = resolve; });
    await previous;
    return release;
  };
  return {
    engine,
    async connect() {
      const release = await acquire();
      return { query: (sql, values) => engine.query(sql, values), release };
    },
    async query(sql, values) {
      const release = await acquire();
      try { return await engine.query(sql, values); } finally { release(); }
    },
    close: () => engine.close(),
  };
}
