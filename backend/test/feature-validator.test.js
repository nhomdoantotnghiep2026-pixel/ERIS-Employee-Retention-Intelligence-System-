import test from 'node:test';
import assert from 'node:assert/strict';
import { modelFeatures, validateFeatures } from '../src/modules/data-validation/feature-validator.js';

function validFeatures() {
  return Object.fromEntries(modelFeatures.map(row => {
    if (row.data_type === 'categorical') return [row.column_name, row.allowed_values_or_range.split(' | ')[0]];
    const range = /integer in \[(\d+),/.exec(row.project_validation_rule)
      || /^\[(\d+),/.exec(row.observed_values_or_range);
    return [row.column_name, Number(range?.[1] || 0)];
  }));
}

test('catalog selects 25 features and excludes labels, identifiers and audit attributes', () => {
  assert.equal(modelFeatures.length, 25);
  for (const name of ['Attrition', 'EmployeeNumber', 'Gender', 'MaritalStatus', 'DailyRate', 'MonthlyRate']) {
    assert.ok(!modelFeatures.some(row => row.column_name === name));
  }
  assert.equal(validateFeatures(validFeatures()).valid, true);
});
test('label leakage and fairness-only attributes are rejected at prediction boundary', () => {
  const result = validateFeatures({ ...validFeatures(), Attrition: 'Yes', Gender: 'Male' });
  assert.equal(result.valid, false);
  assert.equal(result.errors.filter(e => e.code === 'NOT_A_MODEL_FEATURE').length, 2);
});
test('missing values are not imputed', () => {
  const input = validFeatures(); delete input.Age; input.MonthlyIncome = null;
  assert.deepEqual(validateFeatures(input).errors.map(e => e.field), ['Age', 'MonthlyIncome']);
});
test('database scale 1-5 cannot silently pass catalog scale 1-4', () => {
  const result = validateFeatures({ ...validFeatures(), JobSatisfaction: 5, PerformanceRating: 2 });
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
});
test('observed Age range is a warning, not a hard bound', () => {
  const result = validateFeatures({ ...validFeatures(), Age: 65 });
  assert.equal(result.valid, true);
  assert.deepEqual(result.warnings.map(w => w.field), ['Age']);
});
test('decimals, booleans and numeric strings cannot masquerade as model integers', () => {
  for (const value of [1.5, true, '5', NaN, Infinity]) {
    assert.equal(validateFeatures({ ...validFeatures(), YearsAtCompany: value }).valid, false);
  }
});
test('catalog vocabularies remain case-sensitive and exact', () => {
  assert.equal(validateFeatures({ ...validFeatures(), OverTime: true }).valid, false);
  assert.equal(validateFeatures({ ...validFeatures(), Department: 'IT' }).valid, false);
});
