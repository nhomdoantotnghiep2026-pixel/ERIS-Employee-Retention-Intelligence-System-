import { Router } from 'express';
import { HttpError } from './errors.js';
import { pagination, positiveInteger } from './pagination.js';

// Identifiers originate exclusively from checked-in resource definitions.
const identifier = value => {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) throw new Error('Unsafe SQL identifier');
  return `"${value}"`;
};

export function createReadRepository(db, definition) {
  const table = `public.${identifier(definition.table)}`;
  const columns = definition.columns.map(identifier).join(', ');
  return {
    async list(query) {
      const paging = pagination(query);
      const values = [];
      const clauses = [];
      for (const column of definition.filters || []) {
        if (query[column] !== undefined) {
          const value = positiveInteger(query[column], column);
          values.push(value); clauses.push(`${identifier(column)} = $${values.length}`);
        }
      }
      if (query.q !== undefined) {
        if (!definition.search || typeof query.q !== 'string' || query.q.length > 100) {
          throw new HttpError(400, 'INVALID_SEARCH', 'Search is unsupported or exceeds 100 characters');
        }
        // Escape LIKE metacharacters: search is literal, not a user-defined SQL pattern.
        values.push(`%${query.q.replace(/[\\%_]/g, '\\$&')}%`);
        clauses.push(`(${definition.search.map(c => `${identifier(c)} ILIKE $${values.length}`).join(' OR ')})`);
      }
      const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
      values.push(paging.limit + 1, paging.offset);
      const { rows } = await db.query(`SELECT ${columns} FROM ${table}${where} ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
      return { data: rows.slice(0, paging.limit), pagination: {
        page: paging.page, limit: paging.limit, has_more: rows.length > paging.limit,
      } };
    },
    async findById(id) {
      const { rows } = await db.query(`SELECT ${columns} FROM ${table} WHERE id = $1`, [id]);
      return rows[0];
    },
  };
}

export function createReadService(repository) {
  return {
    list: query => repository.list(query),
    async get(id) {
      const record = await repository.findById(positiveInteger(id, 'id'));
      if (!record) throw new HttpError(404, 'NOT_FOUND', 'Record not found');
      return record;
    },
  };
}

export function createReadRouter(service) {
  const router = Router();
  router.get('/', async (req, res) => res.json(await service.list(req.query)));
  router.get('/:id', async (req, res) => res.json({ data: await service.get(req.params.id) }));
  return router;
}
