import { Router } from 'express';
import { RunDiagnosticUseCase } from '../../../application/usecases/RunDiagnosticUseCase.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { runDiagnosticSchema } from '../schemas/zodSchemas.js';

export function createDiagnosticRouter(diagnosticRepo, incidentRepo, queueService) {
  const router = Router();
  const diagnosticUseCase = new RunDiagnosticUseCase(diagnosticRepo, incidentRepo, queueService);

  // Registrar diagnóstico y generar bitácora estructurada
  router.post('/', authMiddleware, validateBody(runDiagnosticSchema), async (req, res, next) => {
    try {
      const payload = {
        ...req.body,
        technicianId: req.user.userId
      };

      const result = await diagnosticUseCase.execute(payload, req.correlationId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  });

  // Obtener diagnósticos / bitácoras de un incidente específico
  router.get('/incident/:incidentId', authMiddleware, (req, res, next) => {
    try {
      const diagnostics = diagnosticRepo.findByIncidentId(req.params.incidentId);
      res.json({
        success: true,
        data: diagnostics
      });
    } catch (err) {
      next(err);
    }
  });

  // Listar todas las bitácoras recientes
  router.get('/', authMiddleware, (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const diagnostics = diagnosticRepo.findAll(limit);
      res.json({
        success: true,
        data: diagnostics
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
