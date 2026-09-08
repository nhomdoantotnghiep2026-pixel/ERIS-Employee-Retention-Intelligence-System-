import { readFileSync } from 'node:fs';

export const catalog = JSON.parse(readFileSync(
  new URL('../../../../contracts/feature_catalog_v0.json', import.meta.url), 'utf8',
).replace(/^\uFEFF/, ''));
export const modelFeatures = catalog.filter(row => row.use_in_model_v1 === 'TRUE');

// Prediction input is strict JSON: never silently impute, round or coerce values.
export function validateFeatures(input) {
  const errors = [], warnings = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: [{ field: '$', code: 'OBJECT_REQUIRED' }], warnings };
  }
  const selected = new Set(modelFeatures.map(row => row.column_name));
  for (const key of Object.keys(input)) {
    if (!selected.has(key)) errors.push({ field: key, code: 'NOT_A_MODEL_FEATURE' });
  }
  for (const row of modelFeatures) {
    const field = row.column_name, value = input[field];
    if (!Object.hasOwn(input, field) || value === null || value === '') {
      errors.push({ field, code: 'REQUIRED' }); continue;
    }
    if (row.data_type === 'integer') {
      if (!Number.isSafeInteger(value)) { errors.push({ field, code: 'INTEGER_REQUIRED' }); continue; }
      const rule = /integer in \[(-?\d+),\s*(-?\d+)\]/.exec(row.project_validation_rule);
      if (rule && (value < Number(rule[1]) || value > Number(rule[2]))) {
        errors.push({ field, code: 'OUT_OF_ALLOWED_RANGE', allowed: [Number(rule[1]), Number(rule[2])] });
      }
      const observed = /^\[(-?\d+),\s*(-?\d+)\]$/.exec(row.observed_values_or_range);
      if (!rule && observed && (value < Number(observed[1]) || value > Number(observed[2]))) {
        warnings.push({ field, code: 'OUTSIDE_OBSERVED_RANGE', observed: [Number(observed[1]), Number(observed[2])] });
      }
    } else {
      const allowed = row.allowed_values_or_range.split(' | ');
      if (typeof value !== 'string' || !allowed.includes(value)) {
        errors.push({ field, code: 'INVALID_CATEGORY', allowed });
      }
    }
  }
  return { valid: errors.length === 0, errors, warnings,
    ...(errors.length === 0 ? { features: Object.fromEntries(modelFeatures.map(r => [r.column_name, input[r.column_name]])) } : {}) };
}
