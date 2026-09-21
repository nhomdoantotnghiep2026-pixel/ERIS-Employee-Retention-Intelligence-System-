import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const audiences = { access: 'eris-web', refresh: 'eris-refresh', passwordChange: 'eris-password-change' };
export const validSubject = value => typeof value === 'string'
  && /^[1-9]\d*$/.test(value) && Number(value) <= 2147483647;

export function createTokens(config) {
  const audience = kind => {
    if (!audiences[kind]) throw new Error('Invalid token kind');
    return audiences[kind];
  };
  return {
    sign(kind, user, ttl) {
      return jwt.sign({ purpose: kind }, config.jwtSecret, {
        algorithm: 'HS256', subject: String(user.id), issuer: 'eris-api',
        audience: audience(kind), expiresIn: ttl, jwtid: randomUUID(),
      });
    },
    verify(kind, token) {
      if (typeof token !== 'string' || token.length > 4096) throw new Error('Invalid token');
      const claims = jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'], issuer: 'eris-api', audience: audience(kind),
      });
      if (!validSubject(claims.sub) || !Number.isInteger(claims.exp) || claims.purpose !== kind) throw new Error('Invalid claims');
      return claims;
    },
  };
}
