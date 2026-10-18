import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmployeeDistance } from '../src/modules/distance/address-resolution.js';

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

