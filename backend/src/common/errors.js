export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Invalid JSON body', request_id: req.id } });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Request body too large', request_id: req.id } });
  }
  const known = error instanceof HttpError;
  if (!known) console.error(JSON.stringify({ event: 'request_failed', request_id: req.id, code: 'INTERNAL_ERROR' }));
  res.status(known ? error.status : 500).json({ error: {
    code: known ? error.code : 'INTERNAL_ERROR',
    message: known ? error.message : 'Unexpected server error', request_id: req.id,
  } });
}
