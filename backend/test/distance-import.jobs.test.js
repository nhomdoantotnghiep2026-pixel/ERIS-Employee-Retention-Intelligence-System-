import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { createDistanceImportJobs } from '../src/modules/distance/distance-import.jobs.js';
import { createDistanceImportRouter } from '../src/modules/distance/distance-import.routes.js';
import { errorHandler } from '../src/common/errors.js';

const csv = 'employeeId,houseNumber,street,ward,district,city\nE1,197,Trần Phú,Phường 4,Quận 5,Hồ Chí Minh\nE2,,Trần Phú,Phường 4,Quận 5,Hồ Chí Minh\n';
test('CSV import previews without API calls, reports background progress and protects owner downloads', async t => {
  let release, calls = 0, clock = 1_000;
  const gate = new Promise(resolve => { release = resolve; });
  const service = {
    async geocodeFull() {
      calls += 1; await gate;
      return [{ ref_id: 'geo:one', name: '197 Trần Phú', boundaries: [
        { type: 2, name: '4' }, { type: 1, name: '5' }, { type: 0, name: 'Hồ Chí Minh' }] }];
    },
    async placeByRefId() { return { hs_num: '197', street: 'Trần Phú', ward: 'Phường 4', district: 'Quận 5',
      city: 'Hồ Chí Minh', lat: 10.75, lng: 106.65, display: '197 Trần Phú' }; },
    async calculate() { return { distanceFromHomeKm: 24 }; },
  };
  const jobs = createDistanceImportJobs(service, { now: () => clock, ttlMs: 1000 });
  const app = express(); app.use(express.json());
  app.use((req, res, next) => { req.user = { id: req.get('x-test-owner') || 'owner' }; next(); });
  app.use('/imports', createDistanceImportRouter(jobs)); app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/imports`;
  const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const preview = await (await post('/preview', { csv })).json();
  assert.equal(preview.total, 2); assert.equal(preview.issues.length, 1); assert.equal(calls, 0);
  assert.equal((await post('/preview', { csv: 'wrong,columns' })).status, 400);
  const created = await post('', { csv }); assert.equal(created.status, 202);
  const job = await created.json(); assert.equal(job.status, 'RUNNING');
  assert.equal((await post('', { csv })).status, 409);
  assert.equal((await fetch(`${base}/${job.id}/download`)).status, 409);
  assert.equal((await fetch(`${base}/${job.id}`, { headers: { 'x-test-owner': 'other' } })).status, 404);
  assert.equal((await fetch(`${base}/${job.id}/download`, { headers: { 'x-test-owner': 'other' } })).status, 404);
  release();
  await new Promise(resolve => setImmediate(resolve));
  const done = await (await fetch(`${base}/${job.id}`)).json();
  assert.equal(done.status, 'COMPLETED'); assert.equal(done.processed, 2);
  assert.equal(done.ready, 1); assert.equal(done.review, 1);
  const download = await fetch(`${base}/${job.id}/download`);
  assert.equal(download.status, 200);
  const bytes = Buffer.from(await download.arrayBuffer()); assert.equal(bytes.subarray(0, 3).toString('hex'), 'efbbbf');
  assert.match(bytes.toString('utf8'), /"READY"/); assert.match(bytes.toString('utf8'), /"REVIEW"/);
  clock += 1001;
  assert.equal((await fetch(`${base}/${job.id}`)).status, 404);
});
