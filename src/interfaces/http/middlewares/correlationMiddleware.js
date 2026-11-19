import crypto from 'node:crypto';

export function correlationMiddleware(req, res, next) {
  // Tomar correlation id entrante o generar uno nuevo
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
