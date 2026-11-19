import crypto from 'node:crypto';

const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'authorization', 'secret', 'key'];

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const logger = {
  info: (message, context = {}, correlationId = null) => {
    const logEntry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      correlationId: correlationId || crypto.randomUUID(),
      message,
      context: sanitize(context)
    };
    console.log(JSON.stringify(logEntry));
  },

  warn: (message, context = {}, correlationId = null) => {
    const logEntry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      correlationId: correlationId || crypto.randomUUID(),
      message,
      context: sanitize(context)
    };
    console.warn(JSON.stringify(logEntry));
  },

  error: (message, error = {}, context = {}, correlationId = null) => {
    const logEntry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      correlationId: correlationId || crypto.randomUUID(),
      message,
      error: {
        message: error.message || error,
        code: error.code || 'INTERNAL_ERROR',
        name: error.name
      },
      context: sanitize(context)
    };
    console.error(JSON.stringify(logEntry));
  }
};
