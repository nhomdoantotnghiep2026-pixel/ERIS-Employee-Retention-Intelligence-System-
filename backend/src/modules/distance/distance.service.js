import { HttpError } from '../../common/errors.js';

const address = (value, field) => {
  if (typeof value !== 'string') throw new HttpError(400, 'VALIDATION_ERROR', `${field} is required`);
  const normalized = value.trim();
  if (normalized.length < 3 || normalized.length > 300) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${field} must contain 3 to 300 characters`);
  }
  return normalized;
};

const requestJson = async (fetchImpl, url, options, timeoutMs, service) => {
  let response;
  try { response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(timeoutMs) }); }
  catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new HttpError(504, 'ROUTING_TIMEOUT', `${service} request timed out`);
    }
    throw new HttpError(502, 'ROUTING_SERVICE_ERROR', `${service} is unavailable`);
  }
  if (response.status === 429) throw new HttpError(503, 'ROUTING_RATE_LIMITED', `${service} quota reached`);
  if ([401, 403].includes(response.status)) {
    throw new HttpError(503, 'ROUTING_CONFIGURATION_ERROR', `${service} API key or restrictions are invalid`);
  }
  if (!response.ok) throw new HttpError(502, 'ROUTING_SERVICE_ERROR', `${service} request failed`);
  try { return await response.json(); }
  catch { throw new HttpError(502, 'ROUTING_SERVICE_ERROR', `${service} returned an invalid response`); }
};

export function createDistanceService(config = {}, fetchImpl = globalThis.fetch) {
  const tomtomKey = config.apiKey;
  const tomtomBaseUrl = (config.baseUrl || 'https://api.tomtom.com').replace(/\/$/, '');
  const vietmapKey = config.geocodingApiKey;
  const vietmapBaseUrl = (config.geocodingBaseUrl || 'https://maps.vietmap.vn').replace(/\/$/, '');
  const timeoutMs = config.timeoutMs || 10000;
  const geocode = async (query, field) => {
    const searchUrl = new URL(`${vietmapBaseUrl}/api/search/v4`);
    searchUrl.searchParams.set('apikey', vietmapKey);
    searchUrl.searchParams.set('text', query);
    searchUrl.searchParams.set('display_type', '3');
    const matches = await requestJson(fetchImpl, searchUrl, { headers: { Accept: 'application/json' } }, timeoutMs, 'Vietmap');
    const match = Array.isArray(matches) ? matches.find(item => item?.ref_id) : null;
    if (!match) throw new HttpError(422, 'ADDRESS_NOT_FOUND', `${field} could not be located`);
    const placeUrl = new URL(`${vietmapBaseUrl}/api/place/v4`);
    placeUrl.searchParams.set('apikey', vietmapKey);
    placeUrl.searchParams.set('refid', match.ref_id);
    const place = await requestJson(fetchImpl, placeUrl, { headers: { Accept: 'application/json' } }, timeoutMs, 'Vietmap');
    if (!Number.isFinite(place?.lat) || !Number.isFinite(place?.lng)) {
      throw new HttpError(422, 'ADDRESS_NOT_FOUND', `${field} could not be located`);
    }
    return { lat: place.lat, lng: place.lng, label: place.display || place.address || query };
  };
  return {
    async calculate(body) {
      if (!tomtomKey || !vietmapKey) {
        throw new HttpError(503, 'ROUTING_NOT_CONFIGURED', 'Vietmap and TomTom API keys are required');
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Request body must be an object');
      }
      if (Object.keys(body).some(key => !['homeAddress', 'companyAddress'].includes(key))) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Request body contains unsupported fields');
      }
      const homeAddress = address(body.homeAddress, 'homeAddress');
      const companyAddress = address(body.companyAddress, 'companyAddress');
      const [home, company] = await Promise.all([
        geocode(homeAddress, 'homeAddress'), geocode(companyAddress, 'companyAddress'),
      ]);
      const points = `${home.lat},${home.lng}:${company.lat},${company.lng}`;
      const routeUrl = new URL(`${tomtomBaseUrl}/routing/1/calculateRoute/${points}/json`);
      routeUrl.searchParams.set('key', tomtomKey);
      routeUrl.searchParams.set('traffic', 'false');
      routeUrl.searchParams.set('routeType', 'fastest');
      routeUrl.searchParams.set('travelMode', 'car');
      const data = await requestJson(fetchImpl, routeUrl, { headers: { Accept: 'application/json' } }, timeoutMs, 'TomTom');
      const summary = data?.routes?.[0]?.summary;
      if (!Number.isFinite(summary?.lengthInMeters) || !Number.isFinite(summary?.travelTimeInSeconds)) {
        throw new HttpError(422, 'ROUTE_NOT_FOUND', 'A driving route could not be calculated');
      }
      return {
        distanceFromHomeKm: Math.round((summary.lengthInMeters / 1000) * 100) / 100,
        estimatedDurationMinutes: Math.round((summary.travelTimeInSeconds / 60) * 10) / 10,
        trafficAware: false,
        travelMode: 'car',
        origin: home.label,
        destination: company.label,
        provider: 'vietmap-geocoding+tomtom-routing',
      };
    },
  };
}
