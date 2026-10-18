import { HttpError } from '../../common/errors.js';
import { pagination, positiveInteger } from '../../common/pagination.js';

export const definition = {
  "table": "employees",
  "filters": [
    "department_id",
    "position_id"
  ],
  "search": [
    "employee_code",
    "full_name",
    "email"
  ],
  "columns": [
    "id",
    "employee_code",
    "full_name",
    "email",
    "phone",
    "date_of_birth",
    "gender",
    "address",
    "distance_from_home_km",
    "department_id",
    "position_id",
    "hire_date",
    "employment_type",
    "employment_status",
    "current_salary",
    "created_at",
    "updated_at"
  ]
};
const columns = definition.columns.map(column => ['date_of_birth', 'hire_date'].includes(column)
  ? `e.${column}::text AS ${column}` : `e.${column}`).join(', ');
const from = `FROM public.employees e LEFT JOIN public.departments d ON d.id=e.department_id
  LEFT JOIN public.positions p ON p.id=e.position_id`;
const selection = `SELECT ${columns}, d.name AS department_name, p.name AS position_name, p.job_level AS position_job_level ${from}`;

const checkReferences = async (db, changes, lock = false) => {
  for (const [field, table, kind] of [['department_id', 'departments', 'DEPARTMENT'], ['position_id', 'positions', 'POSITION']]) {
    if (!Object.hasOwn(changes, field)) continue;
    const row = (await db.query(`SELECT id,status FROM public.${table} WHERE id=$1${lock ? ' FOR SHARE' : ''}`, [changes[field]])).rows[0];
    if (!row) throw new HttpError(404, `${kind}_NOT_FOUND`, `${kind.toLowerCase()} does not exist`);
    if (row.status !== 'ACTIVE') throw new HttpError(400, `${kind}_INACTIVE`, `Cannot assign an employee to an inactive ${kind.toLowerCase()}`);
  }
};
const checkUnique = async (db, values, id) => {
  const rows = (await db.query(`SELECT employee_code,email FROM public.employees
    WHERE ($3::integer IS NULL OR id<>$3) AND
      (lower(btrim(employee_code))=lower($1) OR ($2::text IS NOT NULL AND lower(btrim(email))=lower($2)))`,
  [values.employee_code ?? null, values.email ?? null, id ?? null])).rows;
  if (rows.some(row => row.employee_code.trim().toLowerCase() === values.employee_code?.toLowerCase())) {
    throw new HttpError(409, 'EMPLOYEE_CODE_EXISTS', 'employeeCode already exists');
  }
  if (rows.length) throw new HttpError(409, 'EMPLOYEE_EMAIL_EXISTS', 'email already exists');
};

export function createRepository(db) {
  const find = async (connection, id, lock = false) => (await connection.query(`${selection} WHERE e.id=$1${lock ? ' FOR UPDATE OF e' : ''}`, [id])).rows[0];
  return {
    findById: id => find(db, id),
    async list(query) {
      const paging = pagination(query), params = [], clauses = [];
      for (const field of ['department_id', 'position_id']) if (query[field] !== undefined) {
        params.push(positiveInteger(query[field], field)); clauses.push(`e.${field}=$${params.length}`);
      }
      if (query.employmentStatus !== undefined) { params.push(query.employmentStatus); clauses.push(`e.employment_status=$${params.length}`); }
      if (query.q !== undefined) {
        params.push(`%${query.q.replace(/[\\%_]/g, '\\$&')}%`);
        clauses.push(`(e.employee_code ILIKE $${params.length} OR e.full_name ILIKE $${params.length} OR e.email ILIKE $${params.length})`);
      }
      const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
      const total = (await db.query(`SELECT count(*)::integer AS total FROM public.employees e${where}`, params)).rows[0]?.total ?? 0;
      params.push(paging.limit, paging.offset);
      const rows = (await db.query(`${selection}${where} ORDER BY e.id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params)).rows;
      return { data: rows, pagination: { page: paging.page, limit: paging.limit, total,
        hasMore: paging.page * paging.limit < total } };
    },
    async preflight(changes, id) { await checkReferences(db, changes); await checkUnique(db, changes, id); },
    async save(actorId, id, changes, validateRecord, distanceCalculation) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const before = id === null ? null : await find(client, id, true);
        if (id !== null && !before) throw new HttpError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
        const proposed = { ...before, ...changes }; validateRecord(proposed);
        await checkReferences(client, changes, true);
        const locks = [`eris:employee:code:${proposed.employee_code.toLowerCase()}`];
        if (proposed.email) locks.push(`eris:employee:email:${proposed.email.toLowerCase()}`);
        for (const key of locks.sort()) await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [key]);
        await checkUnique(client, proposed, id);
        const keys = Object.keys(changes);
        const changed = !before || keys.some(key => ['current_salary', 'distance_from_home_km'].includes(key)
          ? (before[key] === null || changes[key] === null ? before[key] !== changes[key] : Number(before[key]) !== Number(changes[key]))
          : before[key] !== changes[key]);
        if (!changed) { await client.query('COMMIT'); return before; }
        const params = keys.map(key => changes[key]);
        const stored = id === null
          ? await client.query(`INSERT INTO public.employees (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING id`, params)
          : await client.query(`UPDATE public.employees SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=$${keys.length + 1} RETURNING id`, [...params, id]);
        const after = await find(client, stored.rows[0].id);
        await client.query(`INSERT INTO public.audit_logs(user_id,action,entity_type,entity_id,old_value,new_value)
          VALUES ($1,$2,'employees',$3,$4::jsonb,$5::jsonb)`, [actorId, id === null ? 'EMPLOYEE_CREATED' : 'EMPLOYEE_UPDATED',
          after.id, before ? JSON.stringify(before) : null, JSON.stringify({ ...after, ...(distanceCalculation ? { distanceCalculation } : {}) })]);
        await client.query('COMMIT'); return after;
      } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') throw new HttpError(409, error.constraint === 'employees_employee_code_key'
          ? 'EMPLOYEE_CODE_EXISTS' : 'EMPLOYEE_EMAIL_EXISTS', 'employeeCode or email already exists');
        throw error;
      } finally { client.release(); }
    },
  };
}
