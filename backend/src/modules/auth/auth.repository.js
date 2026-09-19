const columns = 'u.id, u.email, u.full_name, u.status, u.role_id, r.name AS role_name';
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
        JOIN public.roles r ON r.id = u.role_id WHERE lower(btrim(u.email)) = $1${lock ? ' FOR UPDATE OF u' : ''}`, [email]);
      return rows[0];
    },
    async userById(id, lock = false) {
      const { rows } = await db.query(`SELECT ${columns}${lock ? ', u.password_hash' : ''} FROM public.users u
        JOIN public.roles r ON r.id = u.role_id WHERE u.id = $1${lock ? ' FOR UPDATE OF u' : ''}`, [id]);
      return rows[0];
    },
    async updatePassword(userId, hash) {
      await db.query('UPDATE public.users SET password_hash = $2 WHERE id = $1', [userId, hash]);
    },
    async roleByName(name) {
      const { rows } = await db.query('SELECT id FROM public.roles WHERE name = $1', [name]);
      return rows[0];
    },
    async lockEmail(email) {
      // The team's schema has a case-sensitive UNIQUE(email), not a normalized index.
      // Serialize API registrations for the same normalized email across admins.
      await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['eris:user:' + email]);
    },
    async insertUser({ email, passwordHash, fullName, roleId }) {
      const { rows } = await db.query(`INSERT INTO public.users (email, password_hash, full_name, role_id, status)
        VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id`, [email, passwordHash, fullName, roleId]);
      return rows[0].id;
    },
    async audit(actorId, action, entityId) {
      await db.query(`INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
        VALUES ($1, $2, 'users', $3)`, [actorId, action, entityId]);
    },
  };
}
