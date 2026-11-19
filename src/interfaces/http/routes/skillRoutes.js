import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export function createSkillRouter(skillRepo) {
  const router = Router();

  // Listar todas las skills del banco modular
  router.get('/', authMiddleware, (req, res, next) => {
    try {
      const skills = skillRepo.findAll();
      res.json({
        success: true,
        data: skills
      });
    } catch (err) {
      next(err);
    }
  });

  // Obtener skill por código (ej: SKILL-NET-01)
  router.get('/:code', authMiddleware, (req, res, next) => {
    try {
      const skill = skillRepo.findByCode(req.params.code);
      if (!skill) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Skill con código ${req.params.code} no encontrada.` }
        });
      }
      res.json({
        success: true,
        data: skill
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
