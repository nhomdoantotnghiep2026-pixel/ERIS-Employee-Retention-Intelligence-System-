export function readConfig(env = process.env) {
  const required = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'JWT_SECRET', 'INITIAL_USER_PASSWORD'];
  for (const key of required) {
    if (!env[key] || /replace/i.test(env[key])) throw new Error(`Configure ${key}`);
  }
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET requires at least 32 characters');
  if (Buffer.byteLength(env.INITIAL_USER_PASSWORD, 'utf8') > 72 || env.INITIAL_USER_PASSWORD.length < 12
      || !/[a-z]/.test(env.INITIAL_USER_PASSWORD) || !/[A-Z]/.test(env.INITIAL_USER_PASSWORD)
      || !/[0-9]/.test(env.INITIAL_USER_PASSWORD) || !/[^a-zA-Z0-9\s]/.test(env.INITIAL_USER_PASSWORD)) {
    throw new Error('INITIAL_USER_PASSWORD does not meet the password policy');
  }
  const port = (name, fallback) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`Invalid ${name}`);
    return value;
  };
  const sslMode = env.PGSSLMODE || 'disable';
  if (!['disable', 'require'].includes(sslMode)) throw new Error('PGSSLMODE must be disable or require');
  const roles = {
    admin: env.ROLE_ADMIN || 'ADMIN',
    staff: env.ROLE_HR || env.ROLE_HR_STAFF || 'HR',
    employee: env.ROLE_EMPLOYEE || 'EMPLOYEE',
  };
  if (new Set(Object.values(roles)).size !== Object.keys(roles).length) throw new Error('Role names must be distinct');
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
    otpTtlSeconds: integer('PASSWORD_RESET_OTP_TTL_SECONDS', 900, 60, 3600),
    otpMaxAttempts: integer('PASSWORD_RESET_OTP_MAX_ATTEMPTS', 5, 1, 10),
    passwordChangeTokenTtlSeconds: integer('PASSWORD_CHANGE_TOKEN_TTL_SECONDS', 900, 60, 1800),
    cookieSecure: boolean('AUTH_COOKIE_SECURE', production),
    cookieSameSite: env.AUTH_COOKIE_SAME_SITE || 'lax',
  };
  if (!['strict', 'lax', 'none'].includes(auth.cookieSameSite)) throw new Error('Invalid AUTH_COOKIE_SAME_SITE');
  if ((production || auth.cookieSameSite === 'none') && !auth.cookieSecure) throw new Error('Secure cookies required');
  if (production && originUrl.protocol !== 'https:') throw new Error('HTTPS CORS_ORIGIN required in production');
  const smtp = { host: env.SMTP_HOST, port: port('SMTP_PORT', 587), secure: boolean('SMTP_SECURE', false),
    user: env.SMTP_USER, password: env.SMTP_PASSWORD, from: env.SMTP_FROM };
  if (Boolean(smtp.user) !== Boolean(smtp.password)) throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together');
  const routingBaseUrl = env.TOMTOM_BASE_URL || 'https://api.tomtom.com';
  const routingUrl = new URL(routingBaseUrl);
  if (!['http:', 'https:'].includes(routingUrl.protocol)) throw new Error('TOMTOM_BASE_URL must be an HTTP(S) URL');
  const geocodingBaseUrl = env.VIETMAP_BASE_URL || 'https://maps.vietmap.vn';
  const geocodingUrl = new URL(geocodingBaseUrl);
  if (!['http:', 'https:'].includes(geocodingUrl.protocol)) throw new Error('VIETMAP_BASE_URL must be an HTTP(S) URL');
  return {
    port: port('PORT', 3000), origin, auth, smtp, redisUrl: env.REDIS_URL || 'redis://127.0.0.1:6379',
    routing: { apiKey: env.TOMTOM_API_KEY, baseUrl: routingUrl.origin,
      geocodingApiKey: env.VIETMAP_API_KEY, geocodingBaseUrl: geocodingUrl.origin,
      timeoutMs: integer('ROUTING_TIMEOUT_MS', 10000, 1000, 30000) },
    jwtSecret: env.JWT_SECRET, initialUserPassword: env.INITIAL_USER_PASSWORD, roles,
    db: { host: env.PGHOST, port: port('PGPORT', 5432), database: env.PGDATABASE,
      user: env.PGUSER, password: env.PGPASSWORD, sslMode, caPath: env.PGSSLROOTCERT },
  };
}
