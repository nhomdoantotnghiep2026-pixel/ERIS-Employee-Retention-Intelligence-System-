import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { HttpError } from './errors.js';
import { positiveInteger } from './pagination.js';
import { createReadRepository } from './read-resource.js';
import { bodyObject } from '../modules/auth/auth.validation.js';

const levels = ['Junior', 'Senior', 'Lead', 'Manager', 'Director'];
const requiredText = (value, field, limit) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${field} requires 1 to ${limit} characters`);
  }
  return value.trim();
};

export function createCatalogService(db, definition) {
  const position = definition.table === 'positions';
  if (!['departments', 'positions'].includes(definition.table)) throw new Error('Unsupported catalog');
  const table = `public.${definition.table}`;
  const kind = position ? 'POSITION' : 'DEPARTMENT';
  const repository = createReadRepository(db, definition);
  const notFound = () => new HttpError(404, `${kind}_NOT_FOUND`, `${kind.toLowerCase()} not found`);
  const conflict = () => new HttpError(409, `${kind}_EXISTS`, 'Code or name already exists');
  const parse = (body, creating) => {
    bodyObject(body, position ? ['code', 'name', 'title', 'jobLevel', 'level', 'description'] : ['code', 'name', 'description']);
    if (!Object.keys(body).length) throw new HttpError(400, 'VALIDATION_ERROR', 'At least one field is required');
    if (body.name !== undefined && body.title !== undefined || body.jobLevel !== undefined && body.level !== undefined) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Use one field name for each value');
    }
    const data = {};
    if (creating || Object.hasOwn(body, 'name') || Object.hasOwn(body, 'title')) {
      data.name = requiredText(body.name ?? body.title, 'name', 150);
    }
    if (Object.hasOwn(body, 'code')) data.code = requiredText(body.code, 'code', 50);
    else if (creating) data.code = `${position ? 'POS' : 'DEPT'}-${randomUUID()}`;
    if (position && (creating || Object.hasOwn(body, 'jobLevel') || Object.hasOwn(body, 'level'))) {
      const value = requiredText(body.jobLevel ?? body.level, 'jobLevel', 150);
      data.job_level = levels.find(level => level.toLowerCase() === value.toLowerCase());
      if (!data.job_level) throw new HttpError(400, 'VALIDATION_ERROR', `jobLevel must be one of ${levels.join(', ')}`);
    }
    if (Object.hasOwn(body, 'description')) {
      if (body.description !== null && (typeof body.description !== 'string' || body.description.length > 5000)) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'description must be null or text up to 5000 characters');
      }
      data.description = body.description === null ? null : body.description.trim();
    }
    return data;
  };
  const save = async (actorId, id, changes) => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      let before = null;
      if (id !== null) {
        before = (await client.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`, [id])).rows[0];
        if (!before) throw notFound();
      }
      const proposed = { ...before, ...changes };
      if (position && !proposed.job_level) throw new HttpError(400, 'VALIDATION_ERROR', 'This position needs a jobLevel before updating');
      // Serialize normalized-name checks across API requests without altering the schema.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `${definition.table}:${proposed.name.toLowerCase()}:${position ? proposed.job_level.toLowerCase() : ''}`,
      ]);
      const duplicate = await client.query(`SELECT id FROM ${table} WHERE lower(btrim(name))=lower($1)
        ${position ? 'AND lower(btrim(job_level))=lower($3)' : ''} AND ($2::integer IS NULL OR id<>$2)`,
      position ? [proposed.name, id, proposed.job_level] : [proposed.name, id]);
      if (duplicate.rows.length) throw conflict();
      const keys = Object.keys(changes);
      const changed = !before || keys.some(key => before[key] !== changes[key]);
      if (!changed) { await client.query('COMMIT'); return before; }
      const params = keys.map(key => changes[key]);
      const result = id === null
        ? await client.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, params)
        : await client.query(`UPDATE ${table} SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(', ')}, updated_at=CURRENT_TIMESTAMP
          WHERE id=$${keys.length + 1} RETURNING *`, [...params, id]);
      const after = result.rows[0];
      await client.query(`INSERT INTO public.audit_logs(user_id,action,entity_type,entity_id,old_value,new_value)
        VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`, [actorId, `${kind}_${id === null ? 'CREATED' : 'UPDATED'}`,
        definition.table, after.id, before ? JSON.stringify(before) : null, JSON.stringify(after)]);
      await client.query('COMMIT'); return after;
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') throw conflict();
      throw error;
    } finally { client.release(); }
  };
  return {
    list: query => repository.list(query),
    async get(value) {
      const result = await repository.findById(positiveInteger(value, 'id'));
      if (!result) throw notFound(); return result;
    },
    create: (actorId, body) => save(actorId, null, parse(body, true)),
    update: (actorId, id, body) => save(actorId, positiveInteger(id, 'id'), parse(body, false)),
  };
}

export function createCatalogRouter(service) {
  const router = Router();
  router.get('/', async (req, res) => res.json(await service.list(req.query)));
  router.get('/:id', async (req, res) => res.json({ data: await service.get(req.params.id) }));
  router.post('/', async (req, res) => res.status(201).json({ data: await service.create(req.user.id, req.body) }));
  router.patch('/:id', async (req, res) => res.json({ data: await service.update(req.user.id, req.params.id, req.body) }));
  return router;
}
