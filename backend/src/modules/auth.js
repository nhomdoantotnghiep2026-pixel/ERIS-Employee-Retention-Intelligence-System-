import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../common/errors.js';
import { hasPermission } from '../common/permissions.js';

const publicUserColumns = 'u.id, u.email, u.full_name, u.status, u.role_id, r.name AS role_name';
const tokenOptions = { algorithm: 'HS256', expiresIn: '15m', issuer: 'eris-api', audience: 'eris-web' };

export function createAuth(db, config) {
  const router = Router();
  // Generated once: unknown accounts still perform one password verification.
  const dummyHash = bcrypt.hashSync('invalid-account-placeholder', 12);
  router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
    standardHeaders: 'draft-8', legacyHeaders: false }), async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || email.length > 255 || typeof password !== 'string' || password.length > 1024) {
      throw new HttpError(400, 'INVALID_CREDENTIALS', 'Provide email and password');
    }
    const { rows } = await db.query(`SELECT ${publicUserColumns}, u.password_hash
      FROM public.users u JOIN public.roles r ON r.id = u.role_id WHERE u.email = $1`, [email.trim()]);
    const user = rows[0];
    const valid = await bcrypt.compare(password, user?.password_hash || dummyHash);
    if (!valid || user?.status !== 'ACTIVE') throw new HttpError(401, 'LOGIN_FAILED', 'Invalid email or password');
    const { password_hash, ...safeUser } = user;
    res.set('Cache-Control', 'no-store').json({
      access_token: jwt.sign({}, config.jwtSecret, { ...tokenOptions, subject: String(user.id) }),
      token_type: 'Bearer', expires_in: 900, user: safeUser,
    });
  });

  const authenticate = async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
    if (!match) throw new HttpError(401, 'UNAUTHENTICATED', 'Bearer token required');
    let payload;
    try {
      payload = jwt.verify(match[1], config.jwtSecret, {
        algorithms: ['HS256'], issuer: tokenOptions.issuer, audience: tokenOptions.audience,
      });
      if (!/^\d+$/.test(payload.sub) || Number(payload.sub) > 2147483647) throw new Error('Invalid subject');
    } catch { throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired token'); }
    // Reload status and role: disabling a user or changing roles takes effect immediately.
    const { rows } = await db.query(`SELECT ${publicUserColumns}
      FROM public.users u JOIN public.roles r ON r.id = u.role_id WHERE u.id = $1`, [payload.sub]);
    if (rows[0]?.status !== 'ACTIVE') throw new HttpError(401, 'INACTIVE_USER', 'Account unavailable');
    req.user = rows[0];
    res.set('Cache-Control', 'no-store');
    next();
  };
  const authorize = group => (req, res, next) => {
    if (!hasPermission(req.user?.role_name, group, config.roles)) {
      throw new HttpError(403, 'FORBIDDEN', 'Permission denied');
    }
    next();
  };
  router.get('/me', authenticate, (req, res) => res.json({ data: req.user }));
  return { router, authenticate, authorize };
}
