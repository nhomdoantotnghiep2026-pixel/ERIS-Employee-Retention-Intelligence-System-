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
    admin: env.ROLE_ADMIN || 'ADMIN',
    staff: env.ROLE_HR_STAFF || 'HR_STAFF',
    manager: env.ROLE_HR_MANAGER || 'HR_MANAGER',
    analyst: env.ROLE_ANALYST || 'AI_ANALYST',
  };
  if (new Set(Object.values(roles)).size !== 4) throw new Error('Role names must be distinct');
  const integer = (name, fallback, min, max) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid ${name}`);
    return value;
  };
  const boolean = (name, fallback) => {
    const value = env[name] ?? String(fallback);
    if (!['true', 'false'].includes(value)) throw new Error(`Invalid ${name}`);
    return value === 'true';
  };
  const production = env.NODE_ENV === 'production';
  const origin = env.CORS_ORIGIN || 'http://localhost:5173';
  const originUrl = new URL(origin);
  if (!['http:', 'https:'].includes(originUrl.protocol) || originUrl.origin !== origin) throw new Error('CORS_ORIGIN must be one exact HTTP(S) origin');
  const auth = {
    accessTtlSeconds: integer('ACCESS_TOKEN_TTL_SECONDS', 3600, 60, 3600),
    refreshTtlSeconds: integer('REFRESH_TOKEN_TTL_SECONDS', 604800, 3600, 2592000),
    resetTtlSeconds: integer('RESET_TOKEN_TTL_SECONDS', 1800, 60, 3600),
    cookieSecure: boolean('AUTH_COOKIE_SECURE', production),
    cookieSameSite: env.AUTH_COOKIE_SAME_SITE || 'lax',
    resetUrl: env.PASSWORD_RESET_URL || '',
  };
  if (!['strict', 'lax', 'none'].includes(auth.cookieSameSite)) throw new Error('Invalid AUTH_COOKIE_SAME_SITE');
  if ((production || auth.cookieSameSite === 'none') && !auth.cookieSecure) throw new Error('Secure cookies required');
  if (production && originUrl.protocol !== 'https:') throw new Error('HTTPS CORS_ORIGIN required in production');
  if (auth.resetUrl) {
    const url = new URL(auth.resetUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || url.origin !== origin
        || (production && url.protocol !== 'https:')) throw new Error('PASSWORD_RESET_URL must use the trusted frontend origin');
  }
  const smtp = { host: env.SMTP_HOST, port: port('SMTP_PORT', 587), secure: boolean('SMTP_SECURE', false),
    user: env.SMTP_USER, password: env.SMTP_PASSWORD, from: env.SMTP_FROM };
  if (Boolean(smtp.user) !== Boolean(smtp.password)) throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together');
  return {
    port: port('PORT', 3000), origin, auth, smtp,
    jwtSecret: env.JWT_SECRET, roles,
    db: { host: env.PGHOST, port: port('PGPORT', 5432), database: env.PGDATABASE,
      user: env.PGUSER, password: env.PGPASSWORD, sslMode, caPath: env.PGSSLROOTCERT },
  };
}
