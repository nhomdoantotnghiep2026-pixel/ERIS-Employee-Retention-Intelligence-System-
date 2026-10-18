const userColumns = `u.id, u.email, e.full_name, u.employee_id, u.role_id, r.name AS role_name,
  u.status, u.created_at, u.updated_at`;

// Kept for shared safety checks and consumers that inspect public user fields.
export const definition = {
  table: 'users',
  columns: ['id', 'email', 'employee_id', 'role_id', 'status', 'created_at', 'updated_at'],
};

export function createRepository(db) {
  return {
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

    async list({ page, limit, offset, search, roleId, status }) {
      const values = [];
      const clauses = [];
      if (search !== undefined) {
        values.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`);
        clauses.push(`(u.email ILIKE $${values.length} ESCAPE '\\' OR e.full_name ILIKE $${values.length} ESCAPE '\\')`);
      }
      if (roleId !== undefined) {
        values.push(roleId);
        clauses.push(`u.role_id = $${values.length}`);
      }
      if (status !== undefined) {
        values.push(status);
        clauses.push(`u.status = $${values.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const countResult = await db.query(`SELECT count(*)::int AS total FROM public.users u
        LEFT JOIN public.employees e ON e.id = u.employee_id ${where}`, values);
      values.push(limit, offset);
      const { rows } = await db.query(`SELECT ${userColumns} FROM public.users u
        JOIN public.role r ON r.id = u.role_id LEFT JOIN public.employees e ON e.id = u.employee_id ${where}
        ORDER BY u.id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
      return { rows, total: countResult.rows[0].total, page, limit };
    },

    async findById(id, lock = false) {
      const { rows } = await db.query(`SELECT ${userColumns} FROM public.users u
        JOIN public.role r ON r.id = u.role_id LEFT JOIN public.employees e ON e.id = u.employee_id
        WHERE u.id = $1${lock ? ' FOR UPDATE OF u' : ''}`, [id]);
      return rows[0];
    },

    async updateStatus(id, status) {
      await db.query('UPDATE public.users SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id, status]);
    },

    async updateRole(id, roleId) {
      await db.query('UPDATE public.users SET role_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id, roleId]);
    },

    async findRole(id) {
      const { rows } = await db.query('SELECT id, name, description FROM public.role WHERE id = $1', [id]);
      return rows[0];
    },

    async listRoles() {
      const { rows } = await db.query('SELECT id, name, description FROM public.role ORDER BY id');
      return rows;
    },

    async audit(actorId, action, entityId) {
      await db.query(`INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
        VALUES ($1, $2, 'users', $3)`, [actorId, action, entityId]);
    },
  };
}
