import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { getDatabase } from '../../infrastructure/database/sqlite.js';
import { runMigrations } from '../../infrastructure/database/migrations.js';
import { SqliteIncidentRepository } from '../../infrastructure/repositories/SqliteIncidentRepository.js';
import { SqliteDiagnosticRepository } from '../../infrastructure/repositories/SqliteDiagnosticRepository.js';
import { SqliteEscalationRepository } from '../../infrastructure/repositories/SqliteEscalationRepository.js';
import { SqliteSkillRepository } from '../../infrastructure/repositories/SqliteSkillRepository.js';
import { SqliteUserRepository } from '../../infrastructure/repositories/SqliteUserRepository.js';
import { ResilientJobQueue } from '../../infrastructure/queue/InMemoryResilientQueue.js';
import { correlationMiddleware } from './middlewares/correlationMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from '../../infrastructure/logging/logger.js';

import { createAuthRouter } from './routes/authRoutes.js';
import { createIncidentRouter } from './routes/incidentRoutes.js';
import { createDiagnosticRouter } from './routes/diagnosticRoutes.js';
import { createEscalationRouter } from './routes/escalationRoutes.js';
import { createSkillRouter } from './routes/skillRoutes.js';
import { createQueueRouter } from './routes/queueRoutes.js';

export function createApp() {
  const db = getDatabase();
  runMigrations(db);

  // Instanciar repositorios SQLite
  const userRepo = new SqliteUserRepository(db);
  const incidentRepo = new SqliteIncidentRepository(db);
  const diagnosticRepo = new SqliteDiagnosticRepository(db);
  const escalationRepo = new SqliteEscalationRepository(db);
  const skillRepo = new SqliteSkillRepository(db);

  // Instanciar cola resiliente y registrar handlers
  const jobQueue = new ResilientJobQueue(db);

  jobQueue.registerHandler('ARCHIVE_DIAGNOSTIC_REPORT', async (payload, jobId) => {
    logger.info(`[WORKER] Archivando bitácora técnica de incidente ${payload.incidentId}`, { payload, jobId });
    // Simula exportación duradera y sincronización de actas
    return true;
  });

  jobQueue.registerHandler('NOTIFY_ESCALATION_TIER', async (payload, jobId) => {
    logger.info(`[WORKER] Notificando escalamiento crítico a ${payload.targetLevel} (${payload.incidentCode})`, { payload, jobId });
    return true;
  });

  const app = express();

  // Middlewares estándar y de seguridad
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(correlationMiddleware);

  // Servir frontend web estático
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // Rutas API REST
  app.use('/api/auth', createAuthRouter(userRepo));
  app.use('/api/incidents', createIncidentRouter(incidentRepo, userRepo));
  app.use('/api/diagnostics', createDiagnosticRouter(diagnosticRepo, incidentRepo, jobQueue));
  app.use('/api/escalations', createEscalationRouter(escalationRepo, incidentRepo, jobQueue));
  app.use('/api/skills', createSkillRouter(skillRepo));
  app.use('/api/queue', createQueueRouter(jobQueue));

  // Endpoint de salud del sistema
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'FieldOps & Support Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Endpoint para servir los manuales técnicos del proyecto (para la página y GitHub)
  app.get('/api/docs/:docName', (req, res) => {
    const allowedDocs = {
      'usuario': 'MANUAL_USUARIO.md',
      'tecnico': 'MANUAL_TECNICO.md',
      'despliegue': 'MANUAL_DESPLIEGUE.md',
      'skills': 'SKILLS.md'
    };

    const fileName = allowedDocs[req.params.docName?.toLowerCase()];
    if (!fileName) {
      return res.status(404).json({ success: false, error: { message: 'Documento no encontrado.' } });
    }

    const filePath = fileName === 'SKILLS.md' 
      ? path.resolve(process.cwd(), 'SKILLS.md')
      : path.resolve(process.cwd(), 'docs', fileName);

    import('node:fs').then(fs => {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: { message: 'Archivo físico no encontrado.' } });
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ success: true, data: { fileName, content } });
    });
  });

  // Manejador centralizado de errores
  app.use(errorHandler);

  return { app, db, jobQueue };
}

const PORT = process.env.PORT || 3000;

if (process.argv[1]?.endsWith('server.js')) {
  const { app } = createApp();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  FieldOps & Support Platform iniciado con éxito`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Arquitectura: Hexagonal | Base de datos: SQLite WAL`);
    console.log(`=======================================================`);
  });
}
