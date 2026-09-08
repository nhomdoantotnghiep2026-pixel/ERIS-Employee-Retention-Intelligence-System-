import { HttpError } from './errors.js';

export function positiveInteger(value, name, maximum = 2147483647) {
  if (!/^\d+$/.test(String(value))) throw new HttpError(400, 'INVALID_PARAMETER', `${name} must be a positive integer`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} is outside the allowed range`);
  }
  return number;
}

export function pagination(query) {
  const page = positiveInteger(query.page ?? '1', 'page', 1000000);
  const limit = positiveInteger(query.limit ?? '20', 'limit', 100);
  return { page, limit, offset: (page - 1) * limit };
}
