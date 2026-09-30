import test from 'node:test';
import assert from 'node:assert/strict';
import { createDistanceService } from '../src/modules/distance/distance.service.js';

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, async json() { return body; } });

test('Vietmap coordinates are routed by TomTom without traffic', async () => {
  const calls = [];
  const fetchImpl = async url => {
    const parsed = new URL(url); calls.push(parsed);
    if (parsed.pathname === '/api/search/v4') return json(200, [{ ref_id: `geo:${parsed.searchParams.get('text')}` }]);
    if (parsed.pathname === '/api/place/v4') {
      return parsed.searchParams.get('refid').includes('Home')
        ? json(200, { lat: 10.77, lng: 106.7, display: 'Exact Home' })
        : json(200, { lat: 10.8, lng: 106.8, display: 'Exact Company' });
    }
    return json(200, { routes: [{ summary: { lengthInMeters: 24200, travelTimeInSeconds: 2100 } }] });
  };
  const service = createDistanceService({ apiKey: 'tomtom-key', baseUrl: 'https://tomtom.test',
    geocodingApiKey: 'vietmap-key', geocodingBaseUrl: 'https://vietmap.test', timeoutMs: 1000 }, fetchImpl);
  const result = await service.calculate({ homeAddress: 'Home address', companyAddress: 'Company address' });
  assert.deepEqual(result, { distanceFromHomeKm: 24.2, estimatedDurationMinutes: 35, trafficAware: false,
    travelMode: 'car', origin: 'Exact Home', destination: 'Exact Company',
    provider: 'vietmap-geocoding+tomtom-routing' });
  const route = calls.find(call => call.pathname.includes('/calculateRoute/'));
  assert.match(route.pathname, /10\.77,106\.7:10\.8,106\.8/);
  assert.equal(route.searchParams.get('traffic'), 'false');
  assert.equal(route.searchParams.get('routeType'), 'fastest');
});

test('distance integration validates keys, body and missing addresses', async () => {
  await assert.rejects(() => createDistanceService({}).calculate({ homeAddress: 'Home', companyAddress: 'Office' }),
    error => error.status === 503 && error.code === 'ROUTING_NOT_CONFIGURED');
  const service = createDistanceService({ apiKey: 'tomtom', geocodingApiKey: 'vietmap' }, async () => json(200, []));
  await assert.rejects(() => service.calculate({ homeAddress: 'Home', companyAddress: 'Office' }),
    error => error.status === 422 && error.code === 'ADDRESS_NOT_FOUND');
  await assert.rejects(() => service.calculate({ homeAddress: 'Home', companyAddress: 'Office', extra: true }),
    error => error.status === 400 && error.code === 'VALIDATION_ERROR');
});

test('TomTom authorization failures identify key restrictions', async () => {
  const fetchImpl = async url => {
    const parsed = new URL(url);
    if (parsed.pathname === '/api/search/v4') return json(200, [{ ref_id: 'geo:place' }]);
    if (parsed.pathname === '/api/place/v4') return json(200, { lat: 10.77, lng: 106.7 });
    return json(403, {});
  };
  const service = createDistanceService({ apiKey: 'tomtom', geocodingApiKey: 'vietmap' }, fetchImpl);
  await assert.rejects(() => service.calculate({ homeAddress: 'Home', companyAddress: 'Office' }),
    error => error.status === 503 && error.code === 'ROUTING_CONFIGURATION_ERROR');
});
