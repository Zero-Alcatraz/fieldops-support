import { getDatabase } from '../database/sqlite.js';
import crypto from 'node:crypto';
import { logger } from '../logging/logger.js';

export class ResilientJobQueue {
  constructor(customDb = null, autoProcess = true) {
    this.db = customDb || getDatabase();
    this.handlers = new Map();
    this.isProcessing = false;
    this.autoProcess = autoProcess;
  }

  registerHandler(jobType, handlerFn) {
    this.handlers.set(jobType, handlerFn);
  }

  enqueue(type, payload, maxAttempts = 3) {
    const id = `job-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO job_queue (id, type, payload_json, status, attempts, max_attempts, created_at, updated_at)
      VALUES (?, ?, ?, 'PENDING', 0, ?, ?, ?)
    `);

    stmt.run(id, type, JSON.stringify(payload), maxAttempts, now, now);
    logger.info(`[QUEUE] Tarea encolada: ${type}`, { jobId: id, type });

    if (this.autoProcess) {
      setImmediate(() => this.processNext());
    }

    return { id, type, status: 'PENDING' };
  }

  async processNext() {
    if (this.isProcessing) return null;
    this.isProcessing = true;

    let currentJob = null;

    try {
      currentJob = this.db.prepare(`
        SELECT * FROM job_queue
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 1
      `).get();

      if (!currentJob) {
        this.isProcessing = false;
        return null;
      }

      // Marcar temporalmente en procesamiento
      this.db.prepare(`
        UPDATE job_queue
        SET status = 'PROCESSING', updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), currentJob.id);

      const handler = this.handlers.get(currentJob.type);
      if (!handler) {
        throw new Error(`No hay handler registrado para la tarea tipo: ${currentJob.type}`);
      }

      const payload = JSON.parse(currentJob.payload_json);
      await handler(payload, currentJob.id);

      // Si el handler termina exitosamente, marcar como COMPLETED
      this.db.prepare(`
        UPDATE job_queue
        SET status = 'COMPLETED', attempts = attempts + 1, updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), currentJob.id);

      logger.info(`[QUEUE] Tarea completada con éxito: ${currentJob.id}`, { jobId: currentJob.id, type: currentJob.type });
    } catch (err) {
      if (currentJob) {
        const nextAttempts = currentJob.attempts + 1;
        const isDeadLetter = nextAttempts >= currentJob.max_attempts;
        const newStatus = isDeadLetter ? 'DEAD_LETTER' : 'PENDING';

        this.db.prepare(`
          UPDATE job_queue
          SET status = ?, attempts = ?, last_error = ?, updated_at = ?
          WHERE id = ?
        `).run(newStatus, nextAttempts, err.message, new Date().toISOString(), currentJob.id);

        if (isDeadLetter) {
          logger.error(`[QUEUE-DLQ] Tarea movida a Dead Letter Queue tras ${nextAttempts} intentos fallidos`, err, {
            jobId: currentJob.id,
            type: currentJob.type
          });
        } else {
          logger.warn(`[QUEUE] Tarea falló (intento ${nextAttempts}/${currentJob.max_attempts}), se reintentará`, {
            jobId: currentJob.id,
            error: err.message
          });
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.autoProcess) {
        const pending = this.db.prepare("SELECT COUNT(*) as count FROM job_queue WHERE status = 'PENDING'").get();
        if (pending && pending.count > 0) {
          setImmediate(() => this.processNext());
        }
      }
    }
  }

  replayDeadLetter(jobId) {
    const job = this.db.prepare("SELECT * FROM job_queue WHERE id = ? AND status = 'DEAD_LETTER'").get(jobId);
    if (!job) {
      throw new Error(`Tarea no encontrada o no está en estado DEAD_LETTER: ${jobId}`);
    }

    this.db.prepare(`
      UPDATE job_queue
      SET status = 'PENDING', attempts = 0, last_error = NULL, updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), jobId);

    logger.info(`[QUEUE] Tarea reencolada desde DLQ para replay: ${jobId}`, { jobId });
    if (this.autoProcess) {
      setImmediate(() => this.processNext());
    }
    return { id: jobId, status: 'PENDING_REPLAY' };
  }

  getMetrics() {
    const rows = this.db.prepare(`
      SELECT status, COUNT(*) as count FROM job_queue GROUP BY status
    `).all();

    const metrics = { PENDING: 0, PROCESSING: 0, COMPLETED: 0, DEAD_LETTER: 0, total: 0 };
    for (const r of rows) {
      metrics[r.status] = r.count;
      metrics.total += r.count;
    }

    const recentJobs = this.db.prepare(`
      SELECT id, type, status, attempts, max_attempts, last_error, created_at, updated_at
      FROM job_queue ORDER BY created_at DESC LIMIT 10
    `).all();

    return { metrics, recentJobs };
  }
}
