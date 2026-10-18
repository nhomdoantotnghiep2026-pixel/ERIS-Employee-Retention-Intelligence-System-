import test from 'node:test';
import assert from 'node:assert/strict';
import { createDistanceService } from '../src/modules/distance/distance.service.js';

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, async json() { return body; } });
const company = { latitude: 10.841158444047021, longitude: 106.81020893790844, label: 'FPT University HCMC' };

test('Vietmap coordinates are routed by TomTom without traffic', async () => {
  const calls = [];
  const fetchImpl = async url => {
    const parsed = new URL(url); calls.push(parsed);
    if (parsed.pathname === '/api/place/v4') {
      return parsed.searchParams.get('refid').includes('Home')
        ? json(200, { lat: 10.77, lng: 106.7, display: 'Exact Home' })
        : json(200, { lat: 10.8, lng: 106.8, display: 'Exact Company' });
    }
    return json(200, { routes: [{ summary: { lengthInMeters: 24200, travelTimeInSeconds: 2100 } }] });
  };
  const service = createDistanceService({ apiKey: 'tomtom-key', baseUrl: 'https://tomtom.test',
    geocodingApiKey: 'vietmap-key', geocodingBaseUrl: 'https://vietmap.test', timeoutMs: 1000, company }, fetchImpl);
  const result = await service.calculate({ home: { refId: 'geo:Home' } });
  assert.deepEqual(result, { distanceFromHomeKm: 24.2, straightLineDistanceKm: 14.41,
    routeToStraightLineRatio: 1.68, estimatedDurationMinutes: 35, trafficAware: false,
    travelMode: 'car', origin: 'Exact Home', destination: 'FPT University HCMC',
    originCoordinates: { latitude: 10.77, longitude: 106.7 },
    destinationCoordinates: { latitude: company.latitude, longitude: company.longitude },
    provider: 'vietmap-geocoding+tomtom-routing' });
  const route = calls.find(call => call.pathname.includes('/calculateRoute/'));
  assert.match(route.pathname, /10\.77,106\.7:10\.841158444047021,106\.81020893790844/);
  assert.equal(route.searchParams.get('traffic'), 'false');
  assert.equal(route.searchParams.get('routeType'), 'fastest');
});

test('place search returns selectable Vietmap results and supports a ranking focus', async () => {
  const requests = [];
  const service = createDistanceService({ geocodingApiKey: 'vietmap', geocodingBaseUrl: 'https://vietmap.test', company }, async url => {
    const request = new URL(url);
    requests.push(request);
    if (request.pathname === '/api/place/v4') return json(200, { lat: 10.75, lng: 106.65 });
    return json(200, [{ ref_id: 'geo:one', name: 'FPT University', address: 'Thu Duc', display: 'FPT University, Thu Duc' },
      { name: 'Missing ref' }]);
  });
  const places = await service.search('FPT University', { latitude: 10.84, longitude: 106.81 });
  assert.deepEqual(places, [{ refId: 'geo:one', name: 'FPT University', address: 'Thu Duc',
    display: 'FPT University, Thu Duc', latitude: 10.75, longitude: 106.65 }]);
  const searchRequest = requests.find(request => request.pathname === '/api/autocomplete/v4');
  const placeRequest = requests.find(request => request.pathname === '/api/place/v4');
  assert.equal(searchRequest.searchParams.get('text'), 'FPT University');
  assert.equal(searchRequest.searchParams.get('focus'), '10.84,106.81');
  assert.equal(searchRequest.searchParams.get('display_type'), '6');
  assert.equal(placeRequest.searchParams.get('refid'), 'geo:one');
});

test('place search defaults its ranking focus to the fixed company', async () => {
  let request;
  const service = createDistanceService({ geocodingApiKey: 'vietmap', geocodingBaseUrl: 'https://vietmap.test', company }, async url => {
    request = new URL(url); return json(200, []);
  });
  await service.search('Lanh Binh Thang');
  assert.equal(request.searchParams.get('focus'), '10.841158444047021,106.81020893790844');
});

test('full-address geocoding uses Vietmap Search v4 and Place v4 details', async () => {
  const calls = [];
  const service = createDistanceService({ geocodingApiKey: 'vietmap', geocodingBaseUrl: 'https://vietmap.test' }, async url => {
    const request = new URL(url); calls.push(request);
    return request.pathname === '/api/search/v4'
      ? json(200, [{ ref_id: 'geocode:one', name: '197 Trần Phú' }])
      : json(200, { hs_num: '197', street: 'Trần Phú', lat: 10.75, lng: 106.65 });
  });
  const matches = await service.geocodeFull('197 Trần Phú, Phường 4, Hồ Chí Minh');
  const details = await service.placeByRefId(matches[0].ref_id, 'home');
  assert.equal(calls[0].pathname, '/api/search/v4');
  assert.equal(calls[0].searchParams.get('display_type'), '5');
  assert.equal(calls[1].searchParams.get('refid'), 'geocode:one');
  assert.equal(details.hs_num, '197');
});

test('distance integration validates keys, confirmation and missing places', async () => {
  await assert.rejects(() => createDistanceService({}).calculate({ home: {} }),
    error => error.status === 503 && error.code === 'ROUTING_NOT_CONFIGURED');
  const service = createDistanceService({ apiKey: 'tomtom', geocodingApiKey: 'vietmap', company }, async () => json(200, {}));
  await assert.rejects(() => service.calculate({ home: { refId: 'geo:home' } }),
    error => error.status === 422 && error.code === 'ADDRESS_NOT_FOUND');
  await assert.rejects(() => service.calculate({ homeAddress: 'Home', companyAddress: 'Office' }),
    error => error.status === 409 && error.code === 'ADDRESS_CONFIRMATION_REQUIRED');
});

test('confirmed coordinates bypass geocoding and are routed directly', async () => {
  const calls = [];
  const service = createDistanceService({ apiKey: 'tomtom', baseUrl: 'https://tomtom.test', company }, async url => {
    calls.push(new URL(url));
    return json(200, { routes: [{ summary: { lengthInMeters: 10000, travelTimeInSeconds: 1200 } }] });
  });
  const result = await service.calculate({
    home: { latitude: 10.77, longitude: 106.7, label: 'Confirmed home' },
  });
  assert.equal(result.distanceFromHomeKm, 10);
  assert.ok(result.straightLineDistanceKm > 0);
  assert.equal(result.routeToStraightLineRatio, Number((10 / result.straightLineDistanceKm).toFixed(2)));
  assert.equal(result.destination, 'FPT University HCMC');
  assert.equal(calls.length, 1);
  assert.match(calls[0].pathname, /10\.77,106\.7:10\.841158444047021,106\.81020893790844/);
});

test('TomTom authorization failures identify key restrictions', async () => {
  const fetchImpl = async url => {
    const parsed = new URL(url);
    if (parsed.pathname === '/api/place/v4') return json(200, { lat: 10.77, lng: 106.7 });
    return json(403, {});
  };
  const service = createDistanceService({ apiKey: 'tomtom', geocodingApiKey: 'vietmap', company }, fetchImpl);
  await assert.rejects(() => service.calculate({ home: { refId: 'geo:home' } }),
    error => error.status === 503 && error.code === 'ROUTING_CONFIGURATION_ERROR');
});
