import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { HttpError } from '../../common/errors.js';
import * as validate from './auth.validation.js';
export const tokenHash = value => createHash('sha256').update(value).digest('hex');
export const publicUser = user => ({ id: user.id, email: user.email, fullName: user.full_name, role: user.role_name, status: user.status });
const unauthorized = () => new HttpError(401, 'INVALID_SESSION', 'Invalid or expired session');
const invalidReset = () => new HttpError(400, 'INVALID_RESET_TOKEN', 'Invalid or expired reset token');
export const forgotMessage = 'If the account is eligible, a password reset email will be sent';
const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);
export function createAuthService(repository, config, mailer) {
  const accessTtl = config.auth?.accessTtlSeconds ?? 900;
  const refreshTtl = config.auth?.refreshTtlSeconds ?? 604800;
  const resetTtl = config.auth?.resetTtlSeconds ?? 1800;
  const sign = user => jwt.sign({}, config.jwtSecret, { algorithm: 'HS256', subject: String(user.id),
    issuer: 'eris-api', audience: 'eris-web', expiresIn: accessTtl });
  return {
    async login(body) {
      validate.bodyObject(body, ['email', 'password']);
      const email = validate.email(body.email), password = validate.currentPassword(body.password);
      return repository.transaction(async repo => {
        const user = await repo.userByEmail(email, true);
        const valid = await bcrypt.compare(password, user?.password_hash || dummyHash);
        if (!valid || !user) throw new HttpError(401, 'LOGIN_FAILED', 'Invalid email or password');
        if (user.status !== 'ACTIVE') throw new HttpError(403, 'INACTIVE_USER', 'Account is inactive');
        const refreshToken = randomBytes(32).toString('base64url');
        await repo.createSession(user.id, tokenHash(refreshToken), refreshTtl);
        return { accessToken: sign(user), user: publicUser(user), refreshToken, expiresIn: accessTtl };
      });
    },
    async refresh(token) {
      if (!validate.opaqueToken(token)) throw unauthorized();
      const hash = tokenHash(token);
      return repository.transaction(async repo => {
        const session = await repo.session(hash);
        if (!session) throw unauthorized();
        // User lock order is shared with login, logout and password mutations.
        const user = await repo.userById(session.user_id, true);
        if (user?.status !== 'ACTIVE' || !await repo.session(hash)) throw unauthorized();
        return { accessToken: sign(user) };
      });
    },
    async logout(token) {
      if (validate.opaqueToken(token)) {
        const hash = tokenHash(token);
        await repository.transaction(async repo => {
          const session = await repo.session(hash);
          if (session) await repo.userById(session.user_id, true);
          await repo.revokeSession(hash);
        });
      }
      return { message: 'Logged out successfully' };
    },
    async changePassword(userId, body) {
      validate.bodyObject(body, ['currentPassword', 'newPassword']);
      const oldPassword = validate.currentPassword(body.currentPassword), password = validate.newPassword(body.newPassword);
      if (oldPassword === password) throw new HttpError(400, 'PASSWORD_UNCHANGED', 'Choose a different password');
      await repository.transaction(async repo => {
        const user = await repo.userById(userId, true);
        if (user?.status !== 'ACTIVE') throw unauthorized();
        if (!await bcrypt.compare(oldPassword, user.password_hash)) throw new HttpError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
        await repo.updatePassword(userId, await bcrypt.hash(password, 12));
        await repo.revokeAll(userId);
        await repo.invalidateResets(userId);
        await repo.audit(userId, 'AUTH_PASSWORD_CHANGED', userId);
      });
      return { message: 'Password changed successfully. Please log in again' };
    },
    async forgotPassword(body) {
      validate.bodyObject(body, ['email']);
      const email = validate.email(body.email);
      if (!mailer?.configured) throw new HttpError(503, 'EMAIL_NOT_CONFIGURED', 'Password reset email is unavailable');
      const token = randomBytes(32).toString('base64url'), hash = tokenHash(token);
      const user = await repository.transaction(async repo => {
        const user = await repo.userByEmail(email, true);
        if (user?.status !== 'ACTIVE') return null;
        await repo.invalidateResets(user.id);
        await repo.createReset(user.id, hash, resetTtl);
        return user;
      });
      if (user) {
        try { await mailer.sendReset(user.email, token); }
        catch {
          await repository.invalidateReset(hash);
          console.error(JSON.stringify({ event: 'password_reset_delivery_failed' }));
        }
      }
      return { message: forgotMessage };
    },
    async resetPassword(body) {
      validate.bodyObject(body, ['token', 'newPassword']);
      const password = validate.newPassword(body.newPassword);
      if (!validate.opaqueToken(body.token)) throw invalidReset();
      const hash = tokenHash(body.token);
      await repository.transaction(async repo => {
        const request = await repo.resetRequest(hash);
        if (!request) throw invalidReset();
        const user = await repo.userById(request.user_id, true);
        if (user?.status !== 'ACTIVE' || !await repo.resetRequest(hash)) throw invalidReset();
        await repo.updatePassword(user.id, await bcrypt.hash(password, 12));
        await repo.invalidateResets(user.id);
        await repo.revokeAll(user.id);
        await repo.audit(user.id, 'AUTH_PASSWORD_RESET', user.id);
      });
      return { message: 'Password reset successfully. Please log in again' };
    },
  };
}
