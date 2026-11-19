import { logger } from '../../../infrastructure/logging/logger.js';

export function errorHandler(err, req, res, next) {
  const correlationId = req.correlationId || 'unknown-correlation-id';

  logger.error('Error no controlado en solicitud HTTP', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  }, correlationId);

  // Respuesta al usuario sin filtrar stack traces internos
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Ha ocurrido un error inesperado al procesar la solicitud.',
      correlationId
    }
  });
}
