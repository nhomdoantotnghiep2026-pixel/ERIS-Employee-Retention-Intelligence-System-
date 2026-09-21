import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { HttpError } from '../../common/errors.js';
import * as validate from './auth.validation.js';
import { createTokens } from './auth.tokens.js';

export const publicUser = user => ({ id: user.id, email: user.email, fullName: user.full_name, roleId: user.role_id, status: user.status });
const unauthorized = () => new HttpError(401, 'INVALID_SESSION', 'Invalid or expired token');
const invalidOtp = () => new HttpError(400, 'INVALID_OTP', 'Invalid or expired OTP');
export const forgotMessage = 'If the account is eligible, a password reset OTP will be sent';
const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);

export function createAuthService(repository, config, mailer, otpStore) {
  const tokens = createTokens(config);
  const accessTtl = config.auth?.accessTtlSeconds ?? 3600;
  const refreshTtl = config.auth?.refreshTtlSeconds ?? 604800;
  const passwordChangeTtl = config.auth?.passwordChangeTokenTtlSeconds ?? 900;
  const otpCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');
  const requireOtpDependencies = message => {
    if (!mailer?.configured) throw new HttpError(503, 'EMAIL_NOT_CONFIGURED', message);
    if (!otpStore) throw new HttpError(503, 'OTP_STORE_UNAVAILABLE', 'OTP service is unavailable');
  };
  const sendOtp = async (purpose, user, send) => {
    const otp = otpCode();
    try {
      await otpStore.issue(purpose, user.id, otp);
      await send(user.email, otp);
    } catch {
      try { await otpStore.remove(purpose, user.id); } catch {}
      throw new HttpError(503, 'EMAIL_DELIVERY_FAILED', 'OTP email could not be sent');
    }
  };
  return {
    async login(body) {
      validate.bodyObject(body, ['email', 'password']);
      const email = validate.email(body.email), password = validate.currentPassword(body.password);
      const user = await repository.userByEmail(email);
      const valid = await bcrypt.compare(password, user?.password_hash || dummyHash);
      if (!valid || !user) throw new HttpError(401, 'LOGIN_FAILED', 'Invalid email or password');
      if (user.status === 'INACTIVE') throw new HttpError(403, 'INACTIVE_USER', 'Account is inactive');
      if (user.status === 'IN_PROCESS') {
        requireOtpDependencies('Password change email is unavailable');
        await sendOtp('password-change', user, mailer.sendPasswordChangeOtp.bind(mailer));
        return { requiresPasswordChange: true,
          passwordChangeToken: tokens.sign('passwordChange', user, passwordChangeTtl), user: publicUser(user) };
      }
      if (user.status !== 'ACTIVE') throw new HttpError(403, 'INACTIVE_USER', 'Account is unavailable');
      return { accessToken: tokens.sign('access', user, accessTtl), user: publicUser(user),
        refreshToken: tokens.sign('refresh', user, refreshTtl), expiresIn: accessTtl };
    },
    async refresh(token) {
      let claims;
      try { claims = tokens.verify('refresh', token); } catch { throw unauthorized(); }
      const user = await repository.userById(claims.sub);
      if (user?.status !== 'ACTIVE') throw unauthorized();
      return { accessToken: tokens.sign('access', user, accessTtl) };
    },
    async logout() { return { message: 'Logged out successfully' }; },
    async requestPasswordChangeOtp(userId) {
      requireOtpDependencies('Password change email is unavailable');
      const user = await repository.userById(userId);
      if (!['ACTIVE', 'IN_PROCESS'].includes(user?.status)) throw unauthorized();
      await sendOtp('password-change', user, mailer.sendPasswordChangeOtp.bind(mailer));
      return { message: 'If the account is eligible, a password change OTP will be sent' };
    },
    async changePassword(userId, body) {
      validate.bodyObject(body, ['currentPassword', 'otp', 'newPassword']);
      const oldPassword = validate.currentPassword(body.currentPassword), otp = validate.otp(body.otp), password = validate.newPassword(body.newPassword);
      if (oldPassword === password) throw new HttpError(400, 'PASSWORD_UNCHANGED', 'Choose a different password');
      if (!otpStore) throw new HttpError(503, 'OTP_STORE_UNAVAILABLE', 'OTP service is unavailable');
      await repository.transaction(async repo => {
        const user = await repo.userById(userId, true);
        if (!['ACTIVE', 'IN_PROCESS'].includes(user?.status)) throw unauthorized();
        if (!await bcrypt.compare(oldPassword, user.password_hash)) throw new HttpError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
        if (!await otpStore.consume('password-change', user.id, otp)) throw invalidOtp();
        await repo.updatePassword(user.id, await bcrypt.hash(password, 12));
        if (user.status === 'IN_PROCESS') await repo.updateStatus(user.id, 'ACTIVE');
        await repo.audit(user.id, 'AUTH_PASSWORD_CHANGED', user.id);
      });
      try { await otpStore.remove('password-reset', userId); } catch { console.error(JSON.stringify({ event: 'password_reset_otp_cleanup_failed' })); }
      return { message: 'Password changed successfully. Please log in again' };
    },
    async forgotPassword(body) {
      validate.bodyObject(body, ['email']);
      const email = validate.email(body.email);
      requireOtpDependencies('Password reset email is unavailable');
      const user = await repository.userByEmail(email);
      if (user?.status === 'ACTIVE') {
        try { await sendOtp('password-reset', user, mailer.sendReset.bind(mailer)); }
        catch { console.error(JSON.stringify({ event: 'password_reset_delivery_failed' })); }
      }
      return { message: forgotMessage };
    },
    async resetPassword(body) {
      validate.bodyObject(body, ['email', 'otp', 'newPassword']);
      const email = validate.email(body.email), otp = validate.otp(body.otp), password = validate.newPassword(body.newPassword);
      if (!otpStore) throw new HttpError(503, 'OTP_STORE_UNAVAILABLE', 'Password reset is unavailable');
      await repository.transaction(async repo => {
        const user = await repo.userByEmail(email, true);
        if (user?.status !== 'ACTIVE' || !await otpStore.consume('password-reset', user.id, otp)) throw invalidOtp();
        await repo.updatePassword(user.id, await bcrypt.hash(password, 12));
        await repo.audit(user.id, 'AUTH_PASSWORD_RESET', user.id);
      });
      return { message: 'Password reset successfully. Please log in again' };
    },
  };
}
