import { PGlite } from '@electric-sql/pglite';
import { authSchema } from './auth-schema.js';

export async function authDatabase() {
  const engine = new PGlite();
  await engine.exec(authSchema);
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
