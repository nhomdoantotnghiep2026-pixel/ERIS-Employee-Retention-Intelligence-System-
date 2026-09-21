import { Router } from 'express';
import { createTokens } from './auth/auth.tokens.js';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../common/errors.js';
import { hasPermission } from '../common/permissions.js';
import { createAuthRepository } from './auth/auth.repository.js';
import { createAuthService, publicUser } from './auth/auth.service.js';
import { createResetMailer } from './auth/auth.mailer.js';

export function createAuth(db, config, injectedMailer, otpStore) {
  const repository = createAuthRepository(db);
  const tokens = createTokens(config);
  const mailer = injectedMailer ?? createResetMailer(config);
  const service = createAuthService(repository, config, mailer, otpStore);
  const router = Router();
  const cookieName = 'eris_refresh';
  const cookieOptions = { httpOnly: true, secure: config.auth?.cookieSecure ?? true,
    sameSite: config.auth?.cookieSameSite ?? 'lax', path: '/api' };
  const clearCookie = res => res.clearCookie(cookieName, cookieOptions);
  const readCookie = req => {
    const pair = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`));
    return pair?.slice(cookieName.length + 1);
  };
  const limited = limit => rateLimit({ windowMs: 900000, limit,
    standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later' } } });
  const authenticate = async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
    if (!match) throw new HttpError(401, 'UNAUTHENTICATED', 'Bearer token required');
    let payload;
    try {
      payload = tokens.verify('access', match[1]);
    } catch { throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired token'); }
    const user = await repository.userById(payload.sub);
    if (user?.status !== 'ACTIVE') throw new HttpError(401, 'INACTIVE_USER', 'Account unavailable');
    req.user = user; res.set('Cache-Control', 'no-store'); next();
  };
  const authenticatePasswordChange = async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
    if (!match) throw new HttpError(401, 'UNAUTHENTICATED', 'Bearer token required');
    let payload, expectedStatus;
    try { payload = tokens.verify('access', match[1]); expectedStatus = 'ACTIVE'; }
    catch {
      try { payload = tokens.verify('passwordChange', match[1]); expectedStatus = 'IN_PROCESS'; }
      catch { throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired token'); }
    }
    const user = await repository.userById(payload.sub);
    if (user?.status !== expectedStatus) throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    req.user = user; res.set('Cache-Control', 'no-store'); next();
  };
  const authorize = group => (req, res, next) => {
    if (!hasPermission(req.user?.role_name, group, config.roles)) throw new HttpError(403, 'FORBIDDEN', 'Permission denied');
    next();
  };
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    // Browser cookie mutations must originate from the configured frontend.
    // CLI clients may omit Origin; cross-site Fetch Metadata is still rejected.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if ((req.headers.origin && req.headers.origin !== config.origin)
          || (!req.headers.origin && req.headers['sec-fetch-site'] === 'cross-site')) {
        throw new HttpError(403, 'INVALID_ORIGIN', 'Request origin is not allowed');
      }
    }
    next();
  });
  router.post('/login', limited(10), async (req, res) => {
    const { refreshToken, expiresIn, ...result } = await service.login(req.body);
    if (refreshToken) res.cookie(cookieName, refreshToken, { ...cookieOptions, maxAge: (config.auth?.refreshTtlSeconds ?? 604800) * 1000 });
    if (req.baseUrl === '/api/v1/auth') {
      return res.json({ ...result, access_token: result.accessToken, token_type: 'Bearer', expires_in: expiresIn });
    }
    res.json(result);
  });
  router.get('/me', authenticate, (req, res) => {
    res.json(req.baseUrl === '/api/v1/auth' ? { data: req.user } : publicUser(req.user));
  });
  router.post('/refresh', limited(60), async (req, res) => {
    try { res.json(await service.refresh(readCookie(req))); }
    catch (error) { if (error.status === 401) clearCookie(res); throw error; }
  });
  router.post('/logout', async (req, res) => {
    const result = await service.logout(); clearCookie(res); res.json(result);
  });
  router.post('/change-password/otp', limited(5), authenticate, async (req, res) => {
    res.json(await service.requestPasswordChangeOtp(req.user.id));
  });
  router.patch('/change-password', limited(10), authenticatePasswordChange, async (req, res) => {
    const result = await service.changePassword(req.user.id, req.body); clearCookie(res); res.json(result);
  });
  router.post('/forgot-password', limited(5), async (req, res) => res.json(await service.forgotPassword(req.body)));
  router.post('/reset-password', limited(10), async (req, res) => {
    const result = await service.resetPassword(req.body); clearCookie(res); res.json(result);
  });
  return { router, authenticate, authorize, repository, mailer };
}
