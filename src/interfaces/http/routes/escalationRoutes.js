import { Router } from 'express';
import { EscalateIncidentUseCase } from '../../../application/usecases/EscalateIncidentUseCase.js';
import { authMiddleware, requireRoles } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { escalateIncidentSchema } from '../schemas/zodSchemas.js';

export function createEscalationRouter(escalationRepo, incidentRepo, queueService) {
  const router = Router();
  const escalateUseCase = new EscalateIncidentUseCase(escalationRepo, incidentRepo, queueService);

  // Escalar un incidente hacia L2, L3 o Proveedor
  router.post('/', authMiddleware, validateBody(escalateIncidentSchema), async (req, res, next) => {
    try {
      const payload = {
        ...req.body,
        escalatedBy: req.user.userId
      };

      const result = await escalateUseCase.execute(payload, req.correlationId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  });

  // Listar escalamientos
  router.get('/', authMiddleware, (req, res, next) => {
    try {
      const { status, targetLevel } = req.query;
      const escalations = escalationRepo.findAll({ status, targetLevel });
      res.json({
        success: true,
        data: escalations
      });
    } catch (err) {
      next(err);
    }
  });

  // Actualizar estado de escalamiento (Revisar, cerrar)
  router.patch('/:id/status', authMiddleware, requireRoles('coordinador', 'admin'), (req, res, next) => {
    try {
      const { status, resolution } = req.body;
      const escalation = escalationRepo.findById(req.params.id);
      if (!escalation) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Escalamiento no encontrado.' }
        });
      }

      escalation.status = status;
      if (resolution) escalation.resolution = resolution;

      escalationRepo.update(escalation);

      res.json({
        success: true,
        data: escalation
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
