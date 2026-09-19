import bcrypt from 'bcryptjs';
import { HttpError } from '../../common/errors.js';
import * as validate from './auth.validation.js';
import { createTokens } from './auth.tokens.js';

export const publicUser = user => ({ id: user.id, email: user.email, fullName: user.full_name, role: user.role_name, status: user.status });
const unauthorized = () => new HttpError(401, 'INVALID_SESSION', 'Invalid or expired token');
const invalidReset = () => new HttpError(400, 'INVALID_RESET_TOKEN', 'Invalid or expired reset token');
export const forgotMessage = 'If the account is eligible, a password reset email will be sent';
const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);

export function createAuthService(repository, config, mailer) {
  const tokens = createTokens(config);
  const accessTtl = config.auth?.accessTtlSeconds ?? 900;
  const refreshTtl = config.auth?.refreshTtlSeconds ?? 604800;
  const resetTtl = config.auth?.resetTtlSeconds ?? 1800;
  return {
    async login(body) {
      validate.bodyObject(body, ['email', 'password']);
      const email = validate.email(body.email), password = validate.currentPassword(body.password);
      const user = await repository.userByEmail(email);
      const valid = await bcrypt.compare(password, user?.password_hash || dummyHash);
      if (!valid || !user) throw new HttpError(401, 'LOGIN_FAILED', 'Invalid email or password');
      if (user.status !== 'ACTIVE') throw new HttpError(403, 'INACTIVE_USER', 'Account is inactive');
      return { accessToken: tokens.sign('access', user, accessTtl), user: publicUser(user),
        refreshToken: tokens.sign('refresh', user, refreshTtl), expiresIn: accessTtl };
    },
    async refresh(token) {
      let claims;
      try { claims = tokens.verify('refresh', token); } catch { throw unauthorized(); }
      const user = await repository.userById(claims.sub);
      if (user?.status !== 'ACTIVE') throw unauthorized();
      // Fixed expiry: refresh does not extend the refresh cookie's seven-day life.
      return { accessToken: tokens.sign('access', user, accessTtl) };
    },
    async logout() {
      // Cookie is cleared by the route. No server-side session or denylist.
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
        await repo.audit(userId, 'AUTH_PASSWORD_CHANGED', userId);
      });
      return { message: 'Password changed successfully. Please log in again' };
    },
    async forgotPassword(body) {
      validate.bodyObject(body, ['email']);
      const email = validate.email(body.email);
      if (!mailer?.configured) throw new HttpError(503, 'EMAIL_NOT_CONFIGURED', 'Password reset email is unavailable');
      const user = await repository.userByEmail(email);
      if (user?.status === 'ACTIVE') {
        try { await mailer.sendReset(user.email, tokens.sign('reset', user, resetTtl)); }
        catch { console.error(JSON.stringify({ event: 'password_reset_delivery_failed' })); }
      }
      return { message: forgotMessage };
    },
    async resetPassword(body) {
      validate.bodyObject(body, ['token', 'newPassword']);
      const password = validate.newPassword(body.newPassword);
      let userId;
      try { userId = tokens.resetSubject(body.token); } catch { throw invalidReset(); }
      await repository.transaction(async repo => {
        // Lock before verifying the password-bound signature to prevent replay.
        const user = await repo.userById(userId, true);
        if (user?.status !== 'ACTIVE') throw invalidReset();
        try { tokens.verify('reset', body.token, user.password_hash); } catch { throw invalidReset(); }
        await repo.updatePassword(user.id, await bcrypt.hash(password, 12));
        await repo.audit(user.id, 'AUTH_PASSWORD_RESET', user.id);
      });
      return { message: 'Password reset successfully. Please log in again' };
    },
  };
}
