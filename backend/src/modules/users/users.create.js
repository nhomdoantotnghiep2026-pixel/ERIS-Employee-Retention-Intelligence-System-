import bcrypt from 'bcryptjs';
import { HttpError } from '../../common/errors.js';
import { publicUser } from '../auth/auth.service.js';
import * as validate from '../auth/auth.validation.js';
export function createUserService(repository, config, mailer) {
  return async (actorId, body) => {
    validate.bodyObject(body, ['email', 'fullName', 'roleId']);
    const email = validate.email(body.email), fullName = validate.fullName(body.fullName);
    const roleId = validate.roleId(body.roleId);
    if (!mailer?.configured) throw new HttpError(503, 'EMAIL_NOT_CONFIGURED', 'Account invitation email is unavailable');
    const passwordHash = await bcrypt.hash(config.initialUserPassword, 12);
    try {
      return await repository.transaction(async repo => {
        const actor = await repo.userById(actorId, true);
        if (actor?.status !== 'ACTIVE' || actor.role_name !== config.roles.admin) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can create users');
        const role = await repo.roleById(roleId);
        if (!role || ![config.roles.staff, config.roles.manager, config.roles.analyst].includes(role.name)) {
          throw new HttpError(400, 'INVALID_ROLE', 'roleId must identify an allowed non-admin role');
        }
        await repo.lockEmail(email);
        if (await repo.userByEmail(email)) throw new HttpError(409, 'EMAIL_EXISTS', 'Email already exists');
        const id = await repo.insertUser({ email, passwordHash, fullName, roleId, status: 'IN_PROCESS' });
        await repo.audit(actorId, 'USER_CREATED', id);
        try { await mailer.sendWelcome(email, config.initialUserPassword); }
        catch { throw new HttpError(503, 'EMAIL_DELIVERY_FAILED', 'Account invitation email could not be sent'); }
        return publicUser(await repo.userById(id));
      });
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'EMAIL_EXISTS', 'Email already exists');
      throw error;
    }
  };
}
