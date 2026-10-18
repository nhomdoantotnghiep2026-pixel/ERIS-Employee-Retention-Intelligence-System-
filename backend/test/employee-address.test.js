import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmployeeDistance } from '../src/modules/distance/address-resolution.js';
import { parseEmployee } from '../src/modules/employees/employees.validation.js';

test('automatic geocoding matches old addresses through data_old and refuses multiple candidates', async () => {
  const address = '197 Trần Phú, Phường 4, Quận 5, Hồ Chí Minh';
  const old = { ref_id: 'geo:old', name: '197 Trần Phú', boundaries: [
    { type: 2, full_name: 'Phường 4' }, { type: 1, full_name: 'Quận 5' }, { type: 0, full_name: 'Hồ Chí Minh' }] };
  let selected, routeCalls = 0;
  const service = {
    async geocodeFull() { return [{ ref_id: 'geo:new', name: '197 Trần Phú', boundaries: [
      { type: 2, full_name: 'Phường Chợ Quán' }, { type: 0, full_name: 'Hồ Chí Minh' }], data_old: old }]; },
    async placeByRefId(refId) { selected = refId; return { hs_num: '197', street: 'Trần Phú', ward: 'Phường 4', district: 'Quận 5', city: 'Hồ Chí Minh', lat: 10.75, lng: 106.65 }; },
    async calculate() { routeCalls += 1; return { distanceFromHomeKm: 25 }; },
  };
  const result = await resolveEmployeeDistance(address, service);
  assert.equal(result.status, 'READY'); assert.equal(selected, 'geo:old'); assert.equal(routeCalls, 1);
  service.geocodeFull = async () => [old, { ...old, ref_id: 'geo:another' }];
  assert.equal((await resolveEmployeeDistance(address, service)).reason, 'AMBIGUOUS_ADDRESS');
  assert.equal(routeCalls, 1);
});

test('employee validation rejects nonfinite money and date rollover without normalizing invalid values', () => {
  for (const salary of [NaN, Infinity, -1, {}, true, '1e3', '0.001']) {
    assert.throws(() => parseEmployee({ currentSalary: salary }, false), { status: 400 });
  }
  assert.equal(parseEmployee({ currentSalary: 0 }, false).current_salary, '0');
  assert.equal(parseEmployee({ dateOfBirth: '2000-02-29' }, false).date_of_birth, '2000-02-29');
  assert.throws(() => parseEmployee({ dateOfBirth: '2001-02-29' }, false), { status: 400 });
});
