import test from 'node:test';
import assert from 'node:assert/strict';
import { createReadRepository } from '../src/common/read-resource.js';
import { pagination } from '../src/common/pagination.js';
import { toCsv } from '../src/modules/reports/csv.js';
import { hasPermission } from '../src/common/permissions.js';
import { definition as users } from '../src/modules/users/users.repository.js';

test('repository uses bound values for employee search', async () => {
  let captured;
  const db = { query: async (sql, values) => { captured = { sql, values }; return { rows: [] }; } };
  const repository = createReadRepository(db, { table: 'employees', columns: ['id', 'full_name'], search: ['full_name'], filters: ['department_id'] });
  await repository.list({ q: "' OR 1=1 --", department_id: '2', limit: '10' });
  assert.ok(!captured.sql.includes("' OR 1=1"));
  assert.ok(captured.sql.includes('ILIKE $2'));
  assert.deepEqual(captured.values, [2, "%' OR 1=1 --%", 11, 0]);
  await assert.rejects(() => repository.list({ department_id: '1 OR 1=1' }), { status: 400 });
});
test('pagination prevents unbounded results and invalid offsets', () => {
  for (const query of [{ limit: '101' }, { page: '-1' }, { page: '1.2' }, { limit: ['5', '6'] }]) {
    assert.throws(() => pagination(query));
  }
});
test('user list never selects password_hash', () => assert.ok(!users.columns.includes('password_hash')));
test('CSV quotes data and neutralizes formulas', () => {
  const csv = toCsv(['name'], [{ name: '=1+1' }, { name: '  @SUM(A1)' }, { name: 'a,"b"' }]);
  assert.ok(csv.includes('"\'=1+1"'));
  assert.ok(csv.includes('"\'  @SUM(A1)"'));
  assert.ok(csv.includes('"a,""b"""'));
});
test('unknown roles fail closed; system administration does not imply HR data access', () => {
  const names = { admin: 'ADMIN', staff: 'STAFF', manager: 'MANAGER', analyst: 'ANALYST' };
  assert.equal(hasPermission('UNKNOWN', 'analysis', names), false);
  assert.equal(hasPermission('ADMIN', 'employees', names), false);
  assert.equal(hasPermission('STAFF', 'admin', names), false);
  assert.equal(hasPermission('ANALYST', 'validation', names), true);
});
