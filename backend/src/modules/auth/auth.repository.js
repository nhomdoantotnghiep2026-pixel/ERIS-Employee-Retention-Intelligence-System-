const columns = 'u.id, u.email, e.full_name, u.employee_id, u.status, u.role_id, r.name AS role_name';
export function createAuthRepository(db) {
  return {
    async transaction(work) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const value = await work(createAuthRepository(client));
        await client.query('COMMIT');
        return value;
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    },
    async userByEmail(email, lock = false) {
      const { rows } = await db.query(`SELECT ${columns}, u.password_hash FROM public.users u
        JOIN public.role r ON r.id = u.role_id LEFT JOIN public.employees e ON e.id = u.employee_id
        WHERE lower(btrim(u.email)) = $1${lock ? ' FOR UPDATE OF u' : ''}`, [email]);
      return rows[0];
    },
    async userById(id, lock = false) {
      const { rows } = await db.query(`SELECT ${columns}${lock ? ', u.password_hash' : ''} FROM public.users u
        JOIN public.role r ON r.id = u.role_id LEFT JOIN public.employees e ON e.id = u.employee_id
        WHERE u.id = $1${lock ? ' FOR UPDATE OF u' : ''}`, [id]);
      return rows[0];
    },
    async updatePassword(userId, hash) {
      await db.query('UPDATE public.users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [userId, hash]);
    },
    async updateStatus(userId, status) {
      await db.query('UPDATE public.users SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [userId, status]);
    },
    async roleById(id) {
      const { rows } = await db.query('SELECT id, name FROM public.role WHERE id = $1', [id]);
      return rows[0];
    },
    async employeeById(id) {
      const { rows } = await db.query('SELECT id FROM public.employees WHERE id = $1', [id]);
      return rows[0];
    },
    async lockEmail(email) {
      // The team's schema has a case-sensitive UNIQUE(email), not a normalized index.
      // Serialize API registrations for the same normalized email across admins.
      await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['eris:user:' + email]);
    },
    async insertUser({ email, passwordHash, employeeId, roleId, status = 'IN_PROCESS' }) {
      const { rows } = await db.query(`INSERT INTO public.users (email, password_hash, employee_id, role_id, status)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`, [email, passwordHash, employeeId ?? null, roleId, status]);
      return rows[0].id;
    },
    async audit(actorId, action, entityId) {
      await db.query(`INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
        VALUES ($1, $2, 'users', $3)`, [actorId, action, entityId]);
    },
  };
}
