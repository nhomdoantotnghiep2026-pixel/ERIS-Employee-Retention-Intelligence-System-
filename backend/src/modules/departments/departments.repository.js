import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  table: 'departments',
  columns: ['id', 'name', 'description', 'created_at', 'updated_at'],
  filters: [],
  search: ['name'],
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
      const { rows } = await db.query(`SELECT id, name, description, created_at, updated_at
        FROM public.departments WHERE id = $1 FOR UPDATE`, [id]);
      return rows[0];
    },
    async lockUnique(name) {
      await db.query(`SELECT pg_advisory_xact_lock(hashtext(
        'eris:department:' || lower(btrim($1::text))
      ))`, [name]);
    },
    async findDuplicate(name, excludeId = null) {
      const { rows } = await db.query(`SELECT id FROM public.departments
        WHERE lower(btrim(name)) = lower(btrim($1::text))
          AND ($2::integer IS NULL OR id <> $2) LIMIT 1`, [name, excludeId]);
      return rows[0];
    },
    async create({ name, description }) {
      const { rows } = await db.query(`INSERT INTO public.departments (name, description)
        VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at`, [name, description]);
      return rows[0];
    },
    async update(id, { name, description }) {
      const { rows } = await db.query(`UPDATE public.departments SET
        name = COALESCE($2, name),
        description = CASE WHEN $3 THEN $4 ELSE description END
        WHERE id = $1 RETURNING id, name, description, created_at, updated_at`,
      [id, name, description.present, description.value]);
      return rows[0];
    },
    async audit(actorId, action, entityId) {
      await db.query(`INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
        VALUES ($1, $2, 'departments', $3)`, [actorId, action, entityId]);
    },
  };
}
