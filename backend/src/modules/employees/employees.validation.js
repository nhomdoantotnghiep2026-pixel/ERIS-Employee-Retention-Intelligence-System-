import { HttpError } from '../../common/errors.js';
import { bodyObject, email } from '../auth/auth.validation.js';

const invalid = message => { throw new HttpError(400, 'VALIDATION_ERROR', message); };
const text = (value, field, max, nullable = false) => {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) invalid(`${field} requires 1 to ${max} characters`);
  return value.trim();
};
const date = (value, field, nullable = false) => {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith('0000-')) invalid(`${field} must be YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) invalid(`${field} is not a valid calendar date`);
  return value;
};
const identifier = (value, field) => {
  if (!Number.isSafeInteger(value) || value < 1 || value > 2147483647) invalid(`${field} must be a positive integer`);
  return value;
};

export function validateDates(record, today) {
  if (record.date_of_birth && record.date_of_birth > today) invalid('dateOfBirth cannot be in the future');
  if (record.date_of_birth && record.hire_date && record.hire_date < record.date_of_birth) invalid('hireDate cannot be before dateOfBirth');
}

export function parseEmployee(body, creating) {
  const fields = ['employeeCode', 'fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'address',
    'departmentId', 'positionId', 'hireDate', 'employmentType', 'employmentStatus', 'currentSalary'];
  bodyObject(body, fields);
  if (!Object.keys(body).length) invalid('At least one employee field is required');
  const result = {};
  const required = new Set(['employeeCode', 'fullName', 'hireDate', 'departmentId', 'positionId']);
  for (const field of fields) {
    if (!Object.hasOwn(body, field) && !(creating && required.has(field))) continue;
    const value = body[field];
    switch (field) {
      case 'employeeCode': result.employee_code = text(value, field, 50); break;
      case 'fullName': result.full_name = text(value, field, 150); break;
      case 'email': result.email = value === null ? null : email(value); break;
      case 'phone':
        result.phone = text(value, field, 30, true);
        if (result.phone !== null && !/^\+?[0-9][0-9 .()-]{4,29}$/.test(result.phone)) invalid('phone has an invalid format');
        break;
      case 'dateOfBirth': result.date_of_birth = date(value, field, true); break;
      case 'hireDate': result.hire_date = date(value, field); break;
      case 'departmentId': result.department_id = identifier(value, field); break;
      case 'positionId': result.position_id = identifier(value, field); break;
      case 'address': result.address = text(value, field, 300, true); break;
      case 'gender':
        result.gender = value === null ? null : text(value, field, 20).toUpperCase();
        if (result.gender !== null && !['MALE', 'FEMALE', 'OTHER'].includes(result.gender)) invalid('gender must be MALE, FEMALE or OTHER');
        break;
      case 'employmentType': result.employment_type = text(value, field, 40, true)?.toUpperCase() ?? null; break;
      case 'employmentStatus': result.employment_status = text(value, field, 30).toUpperCase(); break;
      case 'currentSalary': {
        if (value === null) { result.current_salary = null; break; }
        if (!['string', 'number'].includes(typeof value) || !/^(0|[1-9][0-9]{0,12})(\.[0-9]{1,2})?$/.test(String(value))) {
          invalid('currentSalary must be a nonnegative decimal with at most 13 integer digits and 2 decimal places');
        }
        result.current_salary = String(value); break;
      }
    }
  }
  return result;
}
