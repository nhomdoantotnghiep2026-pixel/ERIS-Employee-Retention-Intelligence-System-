import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  table: 'positions',
  columns: ['id', 'title', 'level', 'description', 'created_at', 'updated_at'],
  filters: [],
  search: ['title'],
};

export function createRepository(db) {
  const read = createReadRepository(db, definition);
  return {
    ...read,
    async transaction(work) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const result = await work(createRepository(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async findByIdForUpdate(id) {
      const { rows } = await db.query(`SELECT id, title, level, description, created_at, updated_at
        FROM public.positions WHERE id = $1 FOR UPDATE`, [id]);
      return rows[0];
    },
    async lockUnique(title, level) {
      await db.query(`SELECT pg_advisory_xact_lock(hashtext(
        'eris:position:' || lower(btrim($1::text)) || ':' || coalesce(lower(btrim($2::text)), '<null>')
      ))`, [title, level]);
    },
    async findDuplicate(title, level, excludeId = null) {
      const { rows } = await db.query(`SELECT id FROM public.positions
        WHERE lower(btrim(title)) = lower(btrim($1::text))
          AND ((level IS NULL AND $2::text IS NULL) OR lower(btrim(level)) = lower(btrim($2::text)))
          AND ($3::integer IS NULL OR id <> $3) LIMIT 1`, [title, level, excludeId]);
      return rows[0];
    },
    async create({ title, level, description }) {
      const { rows } = await db.query(`INSERT INTO public.positions (title, level, description)
        VALUES ($1, $2, $3) RETURNING id, title, level, description, created_at, updated_at`,
      [title, level, description]);
      return rows[0];
    },
    async update(id, { title, level, description }) {
      const { rows } = await db.query(`UPDATE public.positions SET
        title = COALESCE($2, title),
        level = CASE WHEN $3 THEN $4 ELSE level END,
        description = CASE WHEN $5 THEN $6 ELSE description END
        WHERE id = $1 RETURNING id, title, level, description, created_at, updated_at`,
      [id, title, level.present, level.value, description.present, description.value]);
      return rows[0];
    },
    async audit(actorId, action, entityId) {
      await db.query(`INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
        VALUES ($1, $2, 'positions', $3)`, [actorId, action, entityId]);
    },
  };
}
