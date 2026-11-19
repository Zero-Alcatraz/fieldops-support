import { getDatabase } from '../database/sqlite.js';
import { Diagnostic } from '../../domain/entities/Diagnostic.js';

export class SqliteDiagnosticRepository {
  constructor(customDb = null) {
    this.db = customDb || getDatabase();
  }

  save(diagnostic) {
    const stmt = this.db.prepare(`
      INSERT INTO diagnostics (
        id, incident_id, skill_code, symptom, probable_root_cause,
        tests_performed, action_applied, checklist_results_json,
        network_metrics_json, technician_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      diagnostic.id,
      diagnostic.incidentId,
      diagnostic.skillCode,
      diagnostic.symptom,
      diagnostic.probableRootCause,
      diagnostic.testsPerformed,
      diagnostic.actionApplied,
      JSON.stringify(diagnostic.checklistResults || []),
      JSON.stringify(diagnostic.networkMetrics || {}),
      diagnostic.technicianId,
      diagnostic.createdAt
    );

    return diagnostic;
  }

  findByIncidentId(incidentId) {
    const rows = this.db.prepare(`
      SELECT d.*, u.full_name as technician_name
      FROM diagnostics d
      LEFT JOIN users u ON d.technician_id = u.id
      WHERE d.incident_id = ?
      ORDER BY d.created_at DESC
    `).all(incidentId);

    return rows.map(r => this._mapToEntity(r));
  }

  findAll(limit = 50) {
    const rows = this.db.prepare(`
      SELECT d.*, u.full_name as technician_name, i.title as incident_title, i.code as incident_code
      FROM diagnostics d
      JOIN incidents i ON d.incident_id = i.id
      LEFT JOIN users u ON d.technician_id = u.id
      ORDER BY d.created_at DESC
      LIMIT ?
    `).all(limit);

    return rows.map(r => {
      const diag = this._mapToEntity(r);
      diag.incidentTitle = r.incident_title;
      diag.incidentCode = r.incident_code;
      return diag;
    });
  }

  _mapToEntity(row) {
    const diag = new Diagnostic({
      id: row.id,
      incidentId: row.incident_id,
      skillCode: row.skill_code,
      symptom: row.symptom,
      probableRootCause: row.probable_root_cause,
      testsPerformed: row.tests_performed,
      actionApplied: row.action_applied,
      checklistResults: JSON.parse(row.checklist_results_json || '[]'),
      networkMetrics: JSON.parse(row.network_metrics_json || '{}'),
      technicianId: row.technician_id,
      createdAt: row.created_at
    });
    diag.technicianName = row.technician_name || 'N/A';
    return diag;
  }
}
