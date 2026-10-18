const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/gi, 'd').toLowerCase().replace(/\b(thanh pho|tp\.?|tinh|quan|huyen|phuong|xa|duong)\b/g, ' ')
  .replace(/[^a-z0-9/]+/g, ' ').trim().replace(/\s+/g, ' ');

const same = (a, b) => normalize(a) === normalize(b);
const validPart = value => typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 120;
const fields = ['employeeId', 'houseNumber', 'street', 'ward', 'district', 'city'];

export function parseCsv(input) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  const source = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell === '') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift();
  if (!header || fields.some(field => !header.includes(field)) || new Set(header).size !== header.length) {
    throw new Error(`CSV requires unique columns: ${fields.join(', ')}`);
  }
  if (rows.length > 1000) throw new Error('CSV limit is 1000 employees per file');
  return rows.map((cells, index) => {
    if (cells.length !== header.length) throw new Error(`CSV row ${index + 2} has wrong column count`);
    return Object.fromEntries(header.map((key, position) => [key, cells[position].trim()]));
  });
}

export function writeCsv(rows, columns) {
  const escape = value => {
    const safe = /^[\s]*[=+\-@]/.test(String(value ?? '')) ? `'${value}` : String(value ?? '');
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return '\uFEFF' + [columns, ...rows.map(row => columns.map(column => row[column]))]
    .map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
}

const candidatesMatch = (candidate, row) => {
  const boundaries = candidate.boundaries || [];
  const ward = boundaries.find(item => item.type === 2)?.name;
  const district = boundaries.find(item => item.type === 1)?.name;
  const city = boundaries.find(item => item.type === 0)?.name;
  const name = normalize(candidate.name);
  return name.startsWith(`${normalize(row.houseNumber)} `)
    && name.slice(normalize(row.houseNumber).length + 1) === normalize(row.street)
    && same(ward, row.ward) && same(city, row.city)
    && (!row.district || same(district, row.district));
};

const placeMatches = (place, row) => same(place.hs_num, row.houseNumber)
  && same(place.street, row.street) && same(place.ward, row.ward)
  && same(place.city, row.city) && (!row.district || same(place.district, row.district))
  && Number.isFinite(place.lat) && Number.isFinite(place.lng);

export async function enrichDistanceRows(rows, service, onProgress = () => {}) {
  const seen = new Set();
  const cache = new Map();
  const output = [];
  for (const row of rows) {
    const item = { ...row, status: 'REVIEW', reason: '', normalizedAddress: '', refId: '', latitude: '',
      longitude: '', distanceFromHomeKm: '' };
    output.push(item);
    try {
    if (!row.employeeId || seen.has(row.employeeId)) {
      item.reason = 'MISSING_OR_DUPLICATE_EMPLOYEE_ID'; continue;
    }
    seen.add(row.employeeId);
    if (!validPart(row.houseNumber) || !validPart(row.street) || !validPart(row.ward) || !validPart(row.city)
      || (row.district && !validPart(row.district))) {
      item.reason = 'INCOMPLETE_ADDRESS'; continue;
    }
    const query = [row.houseNumber, row.street, row.ward, row.district, row.city].filter(Boolean).join(', ');
    const cacheKey = normalize(query);
    if (cache.has(cacheKey)) { Object.assign(item, cache.get(cacheKey)); continue; }
    try {
      const variants = (await service.geocodeFull(query))
        .flatMap(candidate => [candidate, candidate.data_old].filter(Boolean));
      const matches = [...new Map(variants.filter(candidate => candidate.ref_id && candidatesMatch(candidate, row))
        .map(candidate => [candidate.ref_id, candidate])).values()];
      if (matches.length !== 1) item.reason = matches.length ? 'AMBIGUOUS_ADDRESS' : 'ADDRESS_NOT_MATCHED';
      else {
        const place = await service.placeByRefId(matches[0].ref_id, 'home');
        if (!placeMatches(place, row)) item.reason = 'PLACE_DETAILS_MISMATCH';
        else {
          const route = await service.calculate({ home: { latitude: place.lat, longitude: place.lng,
            label: place.display || query } });
          Object.assign(item, { status: 'READY', reason: '', normalizedAddress: place.display || query,
            refId: matches[0].ref_id, latitude: place.lat, longitude: place.lng,
            distanceFromHomeKm: route.distanceFromHomeKm });
        }
      }
    } catch (error) {
      item.reason = error.code || 'PROVIDER_ERROR';
    }
    cache.set(cacheKey, { status: item.status, reason: item.reason, normalizedAddress: item.normalizedAddress,
      refId: item.refId, latitude: item.latitude, longitude: item.longitude,
      distanceFromHomeKm: item.distanceFromHomeKm });
    } finally { onProgress({ ...item }, output.length); }
  }
  return output;
}

export const inputColumns = fields;
export const outputColumns = [...fields, 'status', 'reason', 'normalizedAddress', 'refId', 'latitude',
  'longitude', 'distanceFromHomeKm'];
