import jwt from 'jsonwebtoken';
import { createHmac, randomUUID } from 'node:crypto';

const audiences = { access: 'eris-web', refresh: 'eris-refresh', reset: 'eris-password-reset' };
export const validSubject = value => typeof value === 'string'
  && /^[1-9]\d*$/.test(value) && Number(value) <= 2147483647;

export function createTokens(config) {
  // A reset link is tied to the existing password hash, without putting the hash
  // in the JWT. Changing the password invalidates all previous reset links.
  const resetKey = hash => createHmac('sha256', config.jwtSecret)
    .update('eris:password-reset:').update(hash).digest('hex');
  return {
    sign(kind, user, ttl) {
      return jwt.sign({ purpose: kind }, kind === 'reset' ? resetKey(user.password_hash) : config.jwtSecret, {
        algorithm: 'HS256', subject: String(user.id), issuer: 'eris-api',
        audience: audiences[kind], expiresIn: ttl, jwtid: randomUUID(),
      });
    },
    verify(kind, token, passwordHash) {
      if (typeof token !== 'string' || token.length > 4096) throw new Error('Invalid token');
      const claims = jwt.verify(token, kind === 'reset' ? resetKey(passwordHash) : config.jwtSecret, {
        algorithms: ['HS256'], issuer: 'eris-api', audience: audiences[kind],
      });
      if (!validSubject(claims.sub) || !Number.isInteger(claims.exp) || claims.purpose !== kind) throw new Error('Invalid claims');
      return claims;
    },
    resetSubject(token) {
      if (typeof token !== 'string' || token.length > 4096) throw new Error('Invalid token');
      const claims = jwt.decode(token);
      if (!validSubject(claims?.sub)) throw new Error('Invalid subject');
      // Only a lookup hint. Caller MUST verify signature after retrieving user.
      return claims.sub;
    },
  };
}
