import { Router } from 'express';
import { AuthenticateUserUseCase } from '../../../application/usecases/AuthenticateUserUseCase.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { loginSchema } from '../schemas/zodSchemas.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export function createAuthRouter(userRepo) {
  const router = Router();
  const authUseCase = new AuthenticateUserUseCase(userRepo);

  router.post('/login', validateBody(loginSchema), async (req, res, next) => {
    try {
      const result = await authUseCase.execute(req.body);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: err.message
        }
      });
    }
  });

  router.get('/me', authMiddleware, (req, res) => {
    const user = userRepo.findById(req.user.userId);
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  });

  return router;
}
