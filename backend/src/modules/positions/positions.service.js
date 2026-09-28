import { HttpError } from '../../common/errors.js';
import { positiveInteger } from '../../common/pagination.js';
import { createReadService } from '../../common/read-resource.js';
import { createRepository } from './positions.repository.js';

export const positionLevels = Object.freeze(['Junior', 'Senior', 'Lead', 'Manager', 'Director']);

const bodyObject = (body, allowed) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'JSON object required');
  }
  if (Object.keys(body).some(key => !allowed.includes(key))) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Unexpected request field');
  }
};
const requiredText = (value, name, maximum) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} requires 1 to ${maximum} characters`);
  }
  return value.trim();
};
const nullableText = (value, name, maximum) => {
  if (value === null) return null;
  if (typeof value !== 'string' || (maximum && value.trim().length > maximum)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must be a string${maximum ? ` up to ${maximum} characters` : ''} or null`);
  }
  return value.trim();
};
const levelValue = value => {
  if (typeof value !== 'string' || !positionLevels.includes(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `level must be one of: ${positionLevels.join(', ')}`);
  }
  return value;
};
const optional = (body, key, parse) => Object.hasOwn(body, key)
  ? { present: true, value: parse(body[key]) }
  : { present: false, value: null };
const conflict = error => {
  if (error.code === '23505') {
    throw new HttpError(409, 'POSITION_EXISTS', 'A position with the same title and level already exists');
  }
  throw error;
};

export function createService(db) {
  const repository = createRepository(db);
  const read = createReadService(repository);
  return {
    ...read,
    async create(actorId, body) {
      bodyObject(body, ['title', 'level', 'description']);
      if (!Object.hasOwn(body, 'title')) throw new HttpError(400, 'VALIDATION_ERROR', 'title is required');
      if (!Object.hasOwn(body, 'level')) throw new HttpError(400, 'VALIDATION_ERROR', 'level is required');
      const input = {
        title: requiredText(body.title, 'title', 150),
        level: levelValue(body.level),
        description: Object.hasOwn(body, 'description') ? nullableText(body.description, 'description') : null,
      };
      try {
        return await repository.transaction(async repo => {
          await repo.lockUnique(input.title, input.level);
          if (await repo.findDuplicate(input.title, input.level)) {
            throw new HttpError(409, 'POSITION_EXISTS', 'A position with the same title and level already exists');
          }
          const position = await repo.create(input);
          await repo.audit(actorId, 'POSITION_CREATED', position.id);
          return position;
        });
      } catch (error) { return conflict(error); }
    },
    async update(actorId, idValue, body) {
      const id = positiveInteger(idValue, 'id');
      bodyObject(body, ['title', 'level', 'description']);
      if (!['title', 'level', 'description'].some(key => Object.hasOwn(body, key))) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'title, level or description is required');
      }
      const title = Object.hasOwn(body, 'title') ? requiredText(body.title, 'title', 150) : undefined;
      const level = optional(body, 'level', levelValue);
      const description = optional(body, 'description', value => nullableText(value, 'description'));
      try {
        return await repository.transaction(async repo => {
          const current = await repo.findByIdForUpdate(id);
          if (!current) throw new HttpError(404, 'POSITION_NOT_FOUND', 'Position not found');
          const changed = (title !== undefined && title !== current.title)
            || (level.present && level.value !== current.level)
            || (description.present && description.value !== current.description);
          if (!changed) return current;
          if (title !== undefined || level.present) {
            const effectiveTitle = title ?? current.title;
            const effectiveLevel = level.present ? level.value : current.level;
            await repo.lockUnique(effectiveTitle, effectiveLevel);
            if (await repo.findDuplicate(effectiveTitle, effectiveLevel, id)) {
              throw new HttpError(409, 'POSITION_EXISTS', 'A position with the same title and level already exists');
            }
          }
          const position = await repo.update(id, { title, level, description });
          await repo.audit(actorId, 'POSITION_UPDATED', id);
          return position;
        });
      } catch (error) { return conflict(error); }
    },
  };
}
