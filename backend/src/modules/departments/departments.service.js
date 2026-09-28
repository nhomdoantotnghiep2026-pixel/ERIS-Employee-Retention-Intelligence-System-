import { HttpError } from '../../common/errors.js';
import { positiveInteger } from '../../common/pagination.js';
import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './departments.repository.js';

const bodyObject = (body, allowed) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'JSON object required');
  }
  if (Object.keys(body).some(key => !allowed.includes(key))) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Unexpected request field');
  }
};
const nameValue = value => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 150) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'name requires 1 to 150 characters');
  }
  return value.trim();
};
const descriptionValue = value => {
  if (value === null) return null;
  if (typeof value !== 'string') throw new HttpError(400, 'VALIDATION_ERROR', 'description must be a string or null');
  return value.trim();
};
const conflict = error => {
  if (error.code === '23505') throw new HttpError(409, 'DEPARTMENT_EXISTS', 'Department name already exists');
  throw error;
};

export function createService(db) {
  const repository = createRepository(db);
  const read = createReadService(repository);
  return {
    ...read,
    async create(actorId, body) {
      bodyObject(body, ['name', 'description']);
      if (!Object.hasOwn(body, 'name')) throw new HttpError(400, 'VALIDATION_ERROR', 'name is required');
      const input = {
        name: nameValue(body.name),
        description: Object.hasOwn(body, 'description') ? descriptionValue(body.description) : null,
      };
      try {
        return await repository.transaction(async repo => {
          await repo.lockUnique(input.name);
          if (await repo.findDuplicate(input.name)) {
            throw new HttpError(409, 'DEPARTMENT_EXISTS', 'Department name already exists');
          }
          const department = await repo.create(input);
          await repo.audit(actorId, 'DEPARTMENT_CREATED', department.id);
          return department;
        });
      } catch (error) { return conflict(error); }
    },
    async update(actorId, idValue, body) {
      const id = positiveInteger(idValue, 'id');
      bodyObject(body, ['name', 'description']);
      if (!Object.hasOwn(body, 'name') && !Object.hasOwn(body, 'description')) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'name or description is required');
      }
      const name = Object.hasOwn(body, 'name') ? nameValue(body.name) : undefined;
      const description = Object.hasOwn(body, 'description')
        ? { present: true, value: descriptionValue(body.description) }
        : { present: false, value: null };
      try {
        return await repository.transaction(async repo => {
          const current = await repo.findByIdForUpdate(id);
          if (!current) throw new HttpError(404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
          const changed = (name !== undefined && name !== current.name)
            || (description.present && description.value !== current.description);
          if (!changed) return current;
          if (name !== undefined) {
            await repo.lockUnique(name);
            if (await repo.findDuplicate(name, id)) {
              throw new HttpError(409, 'DEPARTMENT_EXISTS', 'Department name already exists');
            }
          }
          const department = await repo.update(id, { name, description });
          await repo.audit(actorId, 'DEPARTMENT_UPDATED', id);
          return department;
        });
      } catch (error) { return conflict(error); }
    },
  };
}
