import { HttpError } from '../../common/errors.js';
import { positiveInteger } from '../../common/pagination.js';
import { createRepository } from './employees.repository.js';
import { parseEmployee, validateDates } from './employees.validation.js';
import { resolveEmployeeDistance } from '../distance/address-resolution.js';

const baseOutput = row => ({ id: row.id, employeeCode: row.employee_code, fullName: row.full_name,
  email: row.email, department: row.department_id === null ? null : { id: row.department_id, name: row.department_name },
  position: row.position_id === null ? null : { id: row.position_id, name: row.position_name, jobLevel: row.position_job_level },
  employmentStatus: row.employment_status });
const knownDistance = row => ({ status: row.distance_from_home_km !== null ? 'READY' : row.address ? 'REVIEW' : 'NOT_PROVIDED',
  reason: row.address && row.distance_from_home_km === null ? 'DISTANCE_NOT_AVAILABLE' : null });
const detailOutput = (row, distance = knownDistance(row)) => ({ ...baseOutput(row), phone: row.phone,
  dateOfBirth: row.date_of_birth, gender: row.gender, address: row.address,
  distanceFromHomeKm: row.distance_from_home_km === null ? null : Number(row.distance_from_home_km),
  hireDate: row.hire_date, employmentType: row.employment_type, currentSalary: row.current_salary === null ? null : String(row.current_salary),
  createdAt: row.created_at, updatedAt: row.updated_at, distanceCalculation: distance });

export function createService(db, { distanceService, now = () => new Date() } = {}) {
  const repository = createRepository(db);
  const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now());
  const get = async id => {
    const row = await repository.findById(positiveInteger(id, 'id'));
    if (!row) throw new HttpError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
    return row;
  };
  return {
    async list(query) {
      const allowed = ['page', 'limit', 'q', 'search', 'departmentId', 'positionId', 'department_id', 'position_id', 'employmentStatus'];
      if (Object.keys(query).some(key => !allowed.includes(key)) || Object.values(query).some(value => typeof value !== 'string')) {
        throw new HttpError(400, 'INVALID_PARAMETER', 'Unsupported or repeated query parameter');
      }
      if (query.q !== undefined && query.search !== undefined) throw new HttpError(400, 'INVALID_PARAMETER', 'Use q or search, not both');
      const canonical = { page: query.page, limit: query.limit, q: query.q ?? query.search, employmentStatus: query.employmentStatus };
      if (canonical.q !== undefined && canonical.q.length > 100) throw new HttpError(400, 'INVALID_SEARCH', 'Search exceeds 100 characters');
      if (canonical.employmentStatus !== undefined && (!canonical.employmentStatus.trim() || canonical.employmentStatus.length > 30)) {
        throw new HttpError(400, 'INVALID_PARAMETER', 'employmentStatus requires 1 to 30 characters');
      }
      for (const [camel, snake] of [['departmentId', 'department_id'], ['positionId', 'position_id']]) {
        if (query[camel] !== undefined && query[snake] !== undefined) throw new HttpError(400, 'INVALID_PARAMETER', `Use ${camel} or ${snake}, not both`);
        canonical[snake] = query[camel] ?? query[snake];
      }
      const result = await repository.list(canonical);
      return { ...result, data: result.data.map(baseOutput) };
    },
    async get(id) { return detailOutput(await get(id)); },
    async create(actorId, body) {
      const changes = { employment_status: 'ACTIVE', ...parseEmployee(body, true) };
      validateDates(changes, today()); await repository.preflight(changes);
      const distance = await resolveEmployeeDistance(changes.address, distanceService);
      changes.distance_from_home_km = distance.distanceFromHomeKm;
      const record = await repository.save(actorId, null, changes, row => validateDates(row, today()), distance);
      return detailOutput(record, distance);
    },
    async update(actorId, idValue, body) {
      const id = positiveInteger(idValue, 'id'), changes = parseEmployee(body, false);
      const current = await get(id); validateDates({ ...current, ...changes }, today());
      await repository.preflight(changes, id);
      let distance;
      if (Object.hasOwn(changes, 'address')) {
        distance = await resolveEmployeeDistance(changes.address, distanceService);
        changes.distance_from_home_km = distance.distanceFromHomeKm;
      }
      const record = await repository.save(actorId, id, changes, row => validateDates(row, today()), distance);
      return detailOutput(record, distance ?? knownDistance(record));
    },
  };
}

