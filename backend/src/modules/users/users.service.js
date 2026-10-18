import { HttpError } from '../../common/errors.js';
import { pagination, positiveInteger } from '../../common/pagination.js';
import * as validate from '../auth/auth.validation.js';
import { createRepository } from './users.repository.js';

const allowedStatuses = new Set(['ACTIVE', 'INACTIVE']);
const output = user => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name ?? null,
  employeeId: user.employee_id ?? null,
  role: { id: user.role_id, name: user.role_name },
  status: user.status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const isAdmin = (actor, config) => actor?.role_name === config.roles.admin;
const scalar = (value, name) => {
  if (Array.isArray(value) || typeof value === 'object') {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} must have one value`);
  }
  return value;
};
const parseStatus = (value, allowed = allowedStatuses) => {
  if (typeof value !== 'string' || !allowed.has(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `status must be one of: ${[...allowed].join(', ')}`);
  }
  return value;
};

export function createService(db, config) {
  const repository = createRepository(db);
  return {
    async list(actor, query) {
      if (!isAdmin(actor, config)) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can list users');
      const allowed = new Set(['page', 'limit', 'search', 'roleId', 'status']);
      if (Object.keys(query).some(key => !allowed.has(key))) {
        throw new HttpError(400, 'INVALID_PARAMETER', 'Unsupported query parameter');
      }
      const paging = pagination(query);
      let search;
      if (query.search !== undefined) {
        search = scalar(query.search, 'search');
        if (typeof search !== 'string' || search.length > 100) {
          throw new HttpError(400, 'INVALID_SEARCH', 'search must contain at most 100 characters');
        }
      }
      const roleId = query.roleId === undefined ? undefined
        : positiveInteger(scalar(query.roleId, 'roleId'), 'roleId');
      const status = query.status === undefined ? undefined
        : parseStatus(scalar(query.status, 'status'));
      const result = await repository.list({ ...paging, search, roleId, status });
      return {
        data: result.rows.map(output),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          hasMore: result.page * result.limit < result.total,
        },
      };
    },

    async get(actor, idValue) {
      const id = positiveInteger(idValue, 'id');
      if (!isAdmin(actor, config) && actor.id !== id) {
        throw new HttpError(403, 'FORBIDDEN', 'You can only view your own account');
      }
      const user = await repository.findById(id);
      if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
      return output(user);
    },

    async updateStatus(actor, idValue, body) {
      if (!isAdmin(actor, config)) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can change user status');
      const id = positiveInteger(idValue, 'id');
      validate.bodyObject(body, ['status']);
      if (!Object.hasOwn(body, 'status')) throw new HttpError(400, 'VALIDATION_ERROR', 'status is required');
      const status = parseStatus(body.status, new Set(['INACTIVE']));
      if (actor.id === id && status === 'INACTIVE') {
        throw new HttpError(400, 'SELF_LOCK_FORBIDDEN', 'ADMIN cannot lock the account currently in use');
      }
      return repository.transaction(async repo => {
        const current = await repo.findById(id, true);
        if (!current) throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
        if (current.status !== status) {
          await repo.updateStatus(id, status);
          await repo.audit(actor.id, 'USER_STATUS_CHANGED', id);
        }
        return output(await repo.findById(id));
      });
    },

    async updateRole(actor, idValue, body) {
      if (!isAdmin(actor, config)) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can change user roles');
      const id = positiveInteger(idValue, 'id');
      validate.bodyObject(body, ['roleId']);
      if (!Object.hasOwn(body, 'roleId')) throw new HttpError(400, 'VALIDATION_ERROR', 'roleId is required');
      const roleId = validate.roleId(body.roleId);
      return repository.transaction(async repo => {
        const current = await repo.findById(id, true);
        if (!current) throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
        const role = await repo.findRole(roleId);
        if (!role) throw new HttpError(400, 'INVALID_ROLE', 'roleId does not exist');
        if (current.role_name === config.roles.admin || role.name === config.roles.admin) {
          throw new HttpError(403, 'ADMIN_ROLE_PROTECTED', 'ADMIN role cannot be changed or assigned here');
        }
        if (![config.roles.staff, config.roles.employee].includes(role.name)) {
          throw new HttpError(400, 'INVALID_ROLE', 'Only HR or EMPLOYEE can be assigned');
        }
        if (role.name === config.roles.employee && !current.employee_id) {
          throw new HttpError(400, 'EMPLOYEE_REQUIRED', 'EMPLOYEE accounts require a linked employee');
        }
        if (current.role_id !== roleId) {
          await repo.updateRole(id, roleId);
          await repo.audit(actor.id, 'USER_ROLE_CHANGED', id);
        }
        return output(await repo.findById(id));
      });
    },

    async roles(actor) {
      if (!isAdmin(actor, config)) throw new HttpError(403, 'FORBIDDEN', 'Only ADMIN can list roles');
      return { data: await repository.listRoles() };
    },
  };
}
