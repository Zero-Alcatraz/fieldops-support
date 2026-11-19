import test from 'node:test';
import assert from 'node:assert';
import { getDatabase } from '../../src/infrastructure/database/sqlite.js';
import { runMigrations } from '../../src/infrastructure/database/migrations.js';
import { ResilientJobQueue } from '../../src/infrastructure/queue/InMemoryResilientQueue.js';

test('[QUEUE] ResilientJobQueue - Reintentos, Dead Letter Queue (DLQ) y Replay', async () => {
  const memDb = getDatabase(':memory:');
  runMigrations(memDb);

  // autoProcess = false para controlar los pasos de la cola en la prueba
  const queue = new ResilientJobQueue(memDb, false);

  let attemptCount = 0;
  // Handler que siempre falla para probar DLQ
  queue.registerHandler('FAILING_JOB', async (payload) => {
    attemptCount++;
    throw new Error('Fallo simulado de conexión');
  });

  // Encolar tarea con máximo 2 intentos
  const job = queue.enqueue('FAILING_JOB', { data: 'test' }, 2);
  assert.strictEqual(job.status, 'PENDING');

  // Primer intento
  await queue.processNext();
  let row = memDb.prepare('SELECT * FROM job_queue WHERE id = ?').get(job.id);
  assert.strictEqual(row.attempts, 1);
  assert.strictEqual(row.status, 'PENDING');

  // Segundo intento (debe pasar a DEAD_LETTER al alcanzar max_attempts = 2)
  await queue.processNext();
  row = memDb.prepare('SELECT * FROM job_queue WHERE id = ?').get(job.id);
  assert.strictEqual(row.attempts, 2);
  assert.strictEqual(row.status, 'DEAD_LETTER');

  // Replay controlado desde DLQ
  queue.replayDeadLetter(job.id);
  row = memDb.prepare('SELECT * FROM job_queue WHERE id = ?').get(job.id);
  assert.strictEqual(row.status, 'PENDING');
  assert.strictEqual(row.attempts, 0);
});
