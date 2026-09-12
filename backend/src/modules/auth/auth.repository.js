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
    async createSession(userId, hash, ttl) {
      await db.query(`INSERT INTO public.auth_sessions (user_id, token_hash, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + $3 * interval '1 second')`, [userId, hash, ttl]);
    },
    async session(hash) {
      const { rows } = await db.query(`SELECT user_id FROM public.auth_sessions
        WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > clock_timestamp()`, [hash]);
      return rows[0];
    },
    async revokeSession(hash) {
      await db.query(`UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP
        WHERE token_hash = $1 AND revoked_at IS NULL`, [hash]);
    },
    async revokeAll(userId) {
      await db.query(`UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
    },
    async updatePassword(userId, hash) {
      await db.query('UPDATE public.users SET password_hash = $2 WHERE id = $1', [userId, hash]);
    },
    async invalidateResets(userId) {
      await db.query(`UPDATE public.password_reset_tokens SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND used_at IS NULL`, [userId]);
    },
    async createReset(userId, hash, ttl) {
      await db.query(`INSERT INTO public.password_reset_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + $3 * interval '1 second')`, [userId, hash, ttl]);
    },
    async resetRequest(hash) {
      const { rows } = await db.query(`SELECT user_id FROM public.password_reset_tokens
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > clock_timestamp()`, [hash]);
      return rows[0];
    },
    async invalidateReset(hash) {
      await db.query('UPDATE public.password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = $1', [hash]);
    },
    async roleByName(name) {
      const { rows } = await db.query('SELECT id FROM public.roles WHERE name = $1', [name]);
      return rows[0];
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
