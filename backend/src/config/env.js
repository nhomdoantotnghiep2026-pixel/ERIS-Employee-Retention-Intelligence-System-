export function readConfig(env = process.env) {
  const required = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'JWT_SECRET'];
  for (const key of required) {
    if (!env[key] || /replace/i.test(env[key])) throw new Error(`Configure ${key}`);
  }
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET requires at least 32 characters');
  const port = (name, fallback) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`Invalid ${name}`);
    return value;
  };
  const sslMode = env.PGSSLMODE || 'disable';
  if (!['disable', 'require'].includes(sslMode)) throw new Error('PGSSLMODE must be disable or require');
  const roles = {
    admin: env.ROLE_ADMIN || 'SYSTEM_ADMIN',
    staff: env.ROLE_HR_STAFF || 'HR_STAFF',
    manager: env.ROLE_HR_MANAGER || 'HR_MANAGER',
    analyst: env.ROLE_ANALYST || 'DATA_AI_ANALYST',
  };
  if (new Set(Object.values(roles)).size !== 4) throw new Error('Role names must be distinct');
  return {
    port: port('PORT', 3000), origin: env.CORS_ORIGIN || 'http://localhost:5173',
    jwtSecret: env.JWT_SECRET, roles,
    db: { host: env.PGHOST, port: port('PGPORT', 5432), database: env.PGDATABASE,
      user: env.PGUSER, password: env.PGPASSWORD, sslMode, caPath: env.PGSSLROOTCERT },
  };
}
