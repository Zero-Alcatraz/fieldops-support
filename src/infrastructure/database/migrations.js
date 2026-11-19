import { getDatabase } from './sqlite.js';

export const migrations = [
  {
    version: 1,
    name: '001_initial_schema',
    up: (db) => {
      db.exec(`
        -- Tabla de control de migraciones
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );

        -- Tabla de Usuarios con roles RBAC
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('tecnico', 'mesa_ayuda', 'coordinador', 'admin')),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        -- Tabla de Banco de Skills Modulares
        CREATE TABLE IF NOT EXISTS skills (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          summary TEXT NOT NULL,
          content_json TEXT NOT NULL,
          version TEXT NOT NULL DEFAULT '1.0',
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );

        -- Tabla de Incidentes Técnicos
        CREATE TABLE IF NOT EXISTS incidents (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          severity TEXT NOT NULL CHECK(severity IN ('P1', 'P2', 'P3', 'P4')),
          status TEXT NOT NULL CHECK(status IN ('TRIAGE', 'DIAGNOSING', 'RESOLVED', 'ESCALATED')),
          technician_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          customer_name TEXT NOT NULL,
          location TEXT,
          device_type TEXT NOT NULL DEFAULT 'ROUTER',
          ip_address TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Tabla de Diagnósticos y Bitácoras Operativas
        CREATE TABLE IF NOT EXISTS diagnostics (
          id TEXT PRIMARY KEY,
          incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
          skill_code TEXT NOT NULL,
          symptom TEXT NOT NULL,
          probable_root_cause TEXT NOT NULL,
          tests_performed TEXT NOT NULL,
          action_applied TEXT NOT NULL,
          checklist_results_json TEXT NOT NULL DEFAULT '[]',
          network_metrics_json TEXT NOT NULL DEFAULT '{}',
          technician_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL
        );

        -- Tabla de Escalamientos Técnicos
        CREATE TABLE IF NOT EXISTS escalations (
          id TEXT PRIMARY KEY,
          incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
          target_level TEXT NOT NULL CHECK(target_level IN ('L2_ESPECIALISTA', 'L3_INGENIERIA_RED', 'PROVEEDOR_ISP', 'GARANTIA_HARDWARE')),
          reason TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          escalated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
          resolution TEXT,
          created_at TEXT NOT NULL
        );

        -- Tabla de Auditoría y Trazabilidad (Correlation IDs)
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          correlation_id TEXT NOT NULL,
          user_id TEXT,
          action TEXT NOT NULL,
          entity TEXT NOT NULL,
          entity_id TEXT,
          details_json TEXT,
          ip_origin TEXT,
          created_at TEXT NOT NULL
        );
      `);
    },
    down: (db) => {
      db.exec(`
        DROP TABLE IF EXISTS audit_logs;
        DROP TABLE IF EXISTS escalations;
        DROP TABLE IF EXISTS diagnostics;
        DROP TABLE IF EXISTS incidents;
        DROP TABLE IF EXISTS skills;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS schema_migrations;
      `);
    }
  },
  {
    version: 2,
    name: '002_performance_indexes_and_queues',
    up: (db) => {
      db.exec(`
        -- Índices compuestos para eliminar latencia N+1 (SKILLS.md Optimización N+1)
        CREATE INDEX IF NOT EXISTS idx_incidents_status_severity ON incidents(status, severity);
        CREATE INDEX IF NOT EXISTS idx_incidents_technician ON incidents(technician_id);
        CREATE INDEX IF NOT EXISTS idx_diagnostics_incident_id ON diagnostics(incident_id);
        CREATE INDEX IF NOT EXISTS idx_escalations_incident_id ON escalations(incident_id);
        CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_logs(correlation_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

        -- Tabla de persistencia para Cola de Tareas Asíncronas y Dead-Letter Queue (DLQ)
        CREATE TABLE IF NOT EXISTS job_queue (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER')),
          attempts INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 3,
          last_error TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
      `);
    },
    down: (db) => {
      db.exec(`
        DROP TABLE IF EXISTS job_queue;
        DROP INDEX IF EXISTS idx_incidents_status_severity;
        DROP INDEX IF EXISTS idx_incidents_technician;
        DROP INDEX IF EXISTS idx_diagnostics_incident_id;
        DROP INDEX IF EXISTS idx_escalations_incident_id;
        DROP INDEX IF EXISTS idx_audit_correlation;
        DROP INDEX IF EXISTS idx_audit_created;
      `);
    }
  }
];

export function runMigrations(customDb = null) {
  const db = customDb || getDatabase();

  // Asegurar tabla de migraciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations ORDER BY version ASC').all();
  const appliedVersions = new Set(appliedRows.map(r => r.version));

  console.log('[MIGRATION] Comprobando versiones de base de datos...');
  for (const m of migrations) {
    if (!appliedVersions.has(m.version)) {
      console.log(`[MIGRATION] Aplicando versión ${m.version}: ${m.name}`);
      m.up(db);
      db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
        .run(m.version, m.name, new Date().toISOString());
      console.log(`[MIGRATION] Versión ${m.version} completada.`);
    }
  }
  console.log('[MIGRATION] Base de datos SQLite sincronizada correctamente.');
}

// Si se ejecuta directamente vía CLI: node src/infrastructure/database/migrations.js
if (process.argv[1]?.endsWith('migrations.js')) {
  runMigrations();
}
