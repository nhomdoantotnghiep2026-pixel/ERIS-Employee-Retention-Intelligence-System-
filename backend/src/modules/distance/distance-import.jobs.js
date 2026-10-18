import { randomUUID } from 'node:crypto';
import { HttpError } from '../../common/errors.js';
import { enrichDistanceRows, inputColumns, parseCsv } from './distance-import.js';

export function createDistanceImportJobs(service, { now = Date.now, ttlMs = 30 * 60_000 } = {}) {
  const jobs = new Map();
  const clean = () => {
    for (const [id, job] of jobs) if (job.finishedAt && now() - job.finishedAt >= ttlMs) jobs.delete(id);
  };
  const preview = csv => {
    if (typeof csv !== 'string' || Buffer.byteLength(csv, 'utf8') > 200_000) {
      throw new HttpError(400, 'INVALID_CSV', 'Choose a UTF-8 CSV file up to 200 KB');
    }
    let rows;
    try { rows = parseCsv(csv); }
    catch (error) { throw new HttpError(400, 'INVALID_CSV', error.message); }
    if (!rows.length) throw new HttpError(400, 'INVALID_CSV', 'CSV must contain at least one employee');
    if (rows.some(row => Object.keys(row).some(key => !inputColumns.includes(key)))) {
      throw new HttpError(400, 'INVALID_CSV', `Only these columns are supported: ${inputColumns.join(', ')}`);
    }
    const seen = new Set();
    const issues = rows.flatMap((row, index) => {
      const reasons = [];
      if (!row.employeeId || seen.has(row.employeeId)) reasons.push('MISSING_OR_DUPLICATE_EMPLOYEE_ID');
      seen.add(row.employeeId);
      if (['houseNumber', 'street', 'ward', 'city'].some(field => !row[field] || row[field].length > 120)
        || row.district.length > 120) reasons.push('INCOMPLETE_ADDRESS');
      return reasons.length ? [{ row: index + 2, employeeId: row.employeeId, reasons }] : [];
    });
    return { total: rows.length, rows, issues };
  };
  const snapshot = job => ({ id: job.id, status: job.status, total: job.total, processed: job.rows.length,
    ready: job.rows.filter(row => row.status === 'READY').length,
    review: job.rows.filter(row => row.status === 'REVIEW').length,
    rows: job.rows, createdAt: job.createdAt, error: job.error,
    expiresAt: job.finishedAt ? new Date(job.finishedAt + ttlMs).toISOString() : null });
  return {
    preview,
    create(userId, csv) {
      clean();
      if ([...jobs.values()].some(job => job.owner === userId && job.status === 'RUNNING')) {
        throw new HttpError(409, 'IMPORT_IN_PROGRESS', 'You already have an import in progress');
      }
      if (jobs.size >= 20) throw new HttpError(503, 'IMPORT_CAPACITY', 'Import queue is full; try again later');
      const { rows } = preview(csv);
      const job = { id: randomUUID(), owner: userId, status: 'RUNNING', total: rows.length,
        rows: [], createdAt: new Date(now()).toISOString(), finishedAt: null, error: null };
      jobs.set(job.id, job);
      setImmediate(async () => {
        try {
          await enrichDistanceRows(rows, service, item => job.rows.push(item));
          job.status = 'COMPLETED';
        } catch {
          job.status = 'FAILED'; job.error = 'Import could not be completed';
        } finally { job.finishedAt = now(); }
      });
      return snapshot(job);
    },
    get(userId, id) {
      clean();
      const job = jobs.get(id);
      if (!job || job.owner !== userId) throw new HttpError(404, 'IMPORT_NOT_FOUND', 'Import not found or expired');
      return snapshot(job);
    },
  };
}
