import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichDistanceRows, parseCsv, writeCsv, outputColumns } from '../src/modules/distance/distance-import.js';

const address = { employeeId: 'E1', houseNumber: '71/26A', street: 'Lãnh Binh Thăng',
  ward: 'Phường 8', district: 'Quận 11', city: 'Hồ Chí Minh' };
const candidate = { ref_id: 'geocode:exact', name: '71/26A Đường Lãnh Binh Thăng', boundaries: [
  { type: 2, name: '8' }, { type: 1, name: '11' }, { type: 0, name: 'Hồ Chí Minh' }] };
const place = { hs_num: '71/26A', street: 'Đường Lãnh Binh Thăng', ward: 'Phường 8',
  district: 'Quận 11', city: 'Thành Phố Hồ Chí Minh', lat: 10.76, lng: 106.65,
  display: '71/26A Đường Lãnh Binh Thăng, Phường 8, Quận 11, Thành Phố Hồ Chí Minh' };

test('CSV import auto-calculates only a uniquely matching full address', async () => {
  let geocodes = 0, routes = 0;
  const service = {
    async geocodeFull() { geocodes += 1; return [candidate]; },
    async placeByRefId() { return place; },
    async calculate() { routes += 1; return { distanceFromHomeKm: 25.3 }; },
  };
  const input = '\uFEFFemployeeId,houseNumber,street,ward,district,city\r\n'
    + 'E1,71/26A,Lãnh Binh Thăng,Phường 8,Quận 11,Hồ Chí Minh\r\n'
    + 'E2,71/26A,Lãnh Binh Thăng,Phường 8,Quận 11,Hồ Chí Minh\r\n';
  const rows = await enrichDistanceRows(parseCsv(input), service);
  assert.equal(rows[0].status, 'READY');
  assert.equal(rows[0].distanceFromHomeKm, 25.3);
  assert.equal(rows[1].status, 'READY');
  assert.equal(geocodes, 1);
  assert.equal(routes, 1);
  assert.match(writeCsv(rows, outputColumns), /"25\.3"/);
});

test('CSV import sends missing, ambiguous and mismatched addresses for review', async () => {
  let routes = 0;
  const service = {
    async geocodeFull() { return [candidate, { ...candidate, ref_id: 'geocode:other' }]; },
    async placeByRefId() { throw new Error('should not call Place'); },
    async calculate() { routes += 1; },
  };
  const rows = await enrichDistanceRows([address, { ...address, employeeId: 'E2', city: '' },
    { ...address, employeeId: 'E1' }], service);
  assert.deepEqual(rows.map(row => row.reason), ['AMBIGUOUS_ADDRESS', 'INCOMPLETE_ADDRESS',
    'MISSING_OR_DUPLICATE_EMPLOYEE_ID']);
  assert.equal(routes, 0);
});

test('legacy ward is matched through Vietmap data_old after an administrative merge', async () => {
  const newAddress = { ...candidate, ref_id: 'geocode:new', boundaries: [
    { type: 2, name: 'Chợ Quán' }, { type: 0, name: 'Hồ Chí Minh' }], data_old: candidate };
  let selectedRefId;
  const service = {
    async geocodeFull() { return [newAddress]; },
    async placeByRefId(refId) { selectedRefId = refId; return place; },
    async calculate() { return { distanceFromHomeKm: 25.3 }; },
  };
  const [result] = await enrichDistanceRows([address], service);
  assert.equal(result.status, 'READY');
  assert.equal(selectedRefId, 'geocode:exact');
});

test('CSV parser handles commas in quoted fields and rejects malformed rows', () => {
  const parsed = parseCsv('employeeId,houseNumber,street,ward,district,city\nE1,1,"Đường A, B",P 1,,HCM\n');
  assert.equal(parsed[0].street, 'Đường A, B');
  assert.throws(() => parseCsv('employeeId,houseNumber,street,ward,district,city\nE1,1,"unfinished'));
  assert.match(writeCsv([{ employeeId: '=SUM(1,1)' }], ['employeeId']), /'\=SUM/);
});
