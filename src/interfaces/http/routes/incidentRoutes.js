import { Router } from 'express';
import { CreateIncidentUseCase } from '../../../application/usecases/CreateIncidentUseCase.js';
import { authMiddleware, requireRoles } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validationMiddleware.js';
import { createIncidentSchema } from '../schemas/zodSchemas.js';

export function createIncidentRouter(incidentRepo, userRepo) {
  const router = Router();
  const createUseCase = new CreateIncidentUseCase(incidentRepo);

  // Listar incidentes con filtros (status, severity, technicianId)
  router.get('/', authMiddleware, (req, res, next) => {
    try {
      const { status, severity, technicianId } = req.query;
      const incidents = incidentRepo.findAll({ status, severity, technicianId });
      res.json({
        success: true,
        data: incidents
      });
    } catch (err) {
      next(err);
    }
  });

  // Obtener detalle de incidente
  router.get('/:id', authMiddleware, (req, res, next) => {
    try {
      const incident = incidentRepo.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incidente no encontrado.' }
        });
      }
      res.json({ success: true, data: incident });
    } catch (err) {
      next(err);
    }
  });

  // Crear nuevo incidente (Mesa de ayuda, Coordinador o Admin)
  router.post('/', authMiddleware, validateBody(createIncidentSchema), async (req, res, next) => {
    try {
      const created = await createUseCase.execute(req.body, req.correlationId);
      res.status(201).json({
        success: true,
        data: created
      });
    } catch (err) {
      next(err);
    }
  });

  // Asignar técnico al incidente
  router.patch('/:id/assign', authMiddleware, (req, res, next) => {
    try {
      const { technicianId } = req.body;
      const incident = incidentRepo.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incidente no encontrado.' }
        });
      }

      incident.assignTechnician(technicianId);
      incidentRepo.update(incident);

      res.json({
        success: true,
        data: incident
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
