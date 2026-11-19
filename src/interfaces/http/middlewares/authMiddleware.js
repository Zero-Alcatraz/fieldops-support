import { tokenService } from '../../../infrastructure/security/authService.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Acceso no autorizado: Token JWT no proporcionado o formato inválido.'
      }
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = tokenService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Token de sesión expirado o firma inválida.'
      }
    });
  }

  req.user = payload;
  next();
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Permisos insuficientes. Requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        }
      });
    }
    next();
  };
}
