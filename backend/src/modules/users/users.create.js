import bcrypt from 'bcryptjs';
import { HttpError } from '../../common/errors.js';
import { publicUser } from '../auth/auth.service.js';
import * as validate from '../auth/auth.validation.js';
export function createUserService(repository, config) {
  return async (actorId, body) => {
    validate.bodyObject(body, ['email', 'password', 'fullName', 'role']);
    const email = validate.email(body.email), password = validate.newPassword(body.password), fullName = validate.fullName(body.fullName);
    if (![config.roles.staff, config.roles.manager, config.roles.analyst].includes(body.role)) {
      throw new HttpError(400, 'INVALID_ROLE', 'Role must be HR staff, HR manager or AI analyst');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      return await repository.transaction(async repo => {
        const actor = await repo.userById(actorId, true);
        if (actor?.status !== 'ACTIVE' || actor.role_name !== config.roles.admin) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can create users');
        await repo.lockEmail(email);
        if (await repo.userByEmail(email)) throw new HttpError(409, 'EMAIL_EXISTS', 'Email already exists');
        const role = await repo.roleByName(body.role);
        if (!role) throw new HttpError(400, 'INVALID_ROLE', 'Role is not configured in the database');
        const id = await repo.insertUser({ email, passwordHash, fullName, roleId: role.id });
        await repo.audit(actorId, 'USER_CREATED', id);
        return publicUser(await repo.userById(id));
      });
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'EMAIL_EXISTS', 'Email already exists');
      throw error;
    }
  };
}
