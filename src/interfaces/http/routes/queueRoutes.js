import { Router } from 'express';
import { authMiddleware, requireRoles } from '../middlewares/authMiddleware.js';

export function createQueueRouter(queueService) {
  const router = Router();

  // Obtener estado y métricas de la cola asíncrona y Dead Letter Queue (DLQ)
  router.get('/metrics', authMiddleware, requireRoles('coordinador', 'admin'), (req, res) => {
    const data = queueService.getMetrics();
    res.json({
      success: true,
      data
    });
  });

  // Replay controlado de una tarea fallida en Dead Letter Queue
  router.post('/replay/:jobId', authMiddleware, requireRoles('coordinador', 'admin'), (req, res, next) => {
    try {
      const result = queueService.replayDeadLetter(req.params.jobId);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: { code: 'REPLAY_FAILED', message: err.message }
      });
    }
  });

  return router;
}
