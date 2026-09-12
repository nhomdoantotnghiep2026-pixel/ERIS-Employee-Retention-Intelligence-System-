import { HttpError } from '../../common/errors.js';
const invalid = message => { throw new HttpError(400, 'VALIDATION_ERROR', message); };
export function bodyObject(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('JSON object required');
  if (Object.keys(body).some(key => !allowed.includes(key))) invalid('Unexpected request field');
}
export function email(value) {
  if (typeof value !== 'string') invalid('Valid email required');
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) invalid('Valid email required');
  return normalized;
}
export function currentPassword(value) {
  if (typeof value !== 'string' || !value.length || Buffer.byteLength(value, 'utf8') > 72) invalid('Password requires 1 to 72 UTF-8 bytes');
  return value;
}
export function newPassword(value) {
  currentPassword(value);
  // Project default; the specification leaves the exact password policy open.
  if (value.length < 12 || !/[a-z]/.test(value) || !/[A-Z]/.test(value)
      || !/[0-9]/.test(value) || !/[^a-zA-Z0-9\s]/.test(value)) {
    invalid('New password requires at least 12 characters, uppercase, lowercase, digit and symbol');
  }
  return value;
}
export function fullName(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 150) invalid('fullName requires 1 to 150 characters');
  return value.trim();
}
export const opaqueToken = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
