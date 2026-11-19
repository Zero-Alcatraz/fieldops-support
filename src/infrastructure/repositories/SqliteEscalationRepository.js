import { getDatabase } from '../database/sqlite.js';
import { Escalation } from '../../domain/entities/Escalation.js';

export class SqliteEscalationRepository {
  constructor(customDb = null) {
    this.db = customDb || getDatabase();
  }

  save(escalation) {
    const stmt = this.db.prepare(`
      INSERT INTO escalations (
        id, incident_id, target_level, reason, evidence_json,
        escalated_by, status, resolution, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      escalation.id,
      escalation.incidentId,
      escalation.targetLevel,
      escalation.reason,
      JSON.stringify(escalation.evidence || {}),
      escalation.escalatedBy,
      escalation.status,
      escalation.resolution || null,
      escalation.createdAt
    );

    return escalation;
  }

  findById(id) {
    const row = this.db.prepare(`
      SELECT e.*, u.full_name as escalated_by_name, i.title as incident_title, i.code as incident_code, i.severity as incident_severity
      FROM escalations e
      JOIN incidents i ON e.incident_id = i.id
      JOIN users u ON e.escalated_by = u.id
      WHERE e.id = ?
    `).get(id);

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findAll(filters = {}) {
    let query = `
      SELECT e.*, u.full_name as escalated_by_name, i.title as incident_title, i.code as incident_code, i.severity as incident_severity
      FROM escalations e
      JOIN incidents i ON e.incident_id = i.id
      JOIN users u ON e.escalated_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND e.status = ?`;
      params.push(filters.status);
    }
    if (filters.targetLevel) {
      query += ` AND e.target_level = ?`;
      params.push(filters.targetLevel);
    }

    query += ` ORDER BY e.created_at DESC`;

    const rows = this.db.prepare(query).all(...params);
    return rows.map(r => this._mapToEntity(r));
  }

  update(escalation) {
    const stmt = this.db.prepare(`
      UPDATE escalations
      SET status = ?, resolution = ?
      WHERE id = ?
    `);
    stmt.run(escalation.status, escalation.resolution || null, escalation.id);
    return escalation;
  }

  _mapToEntity(row) {
    const esc = new Escalation({
      id: row.id,
      incidentId: row.incident_id,
      targetLevel: row.target_level,
      reason: row.reason,
      evidence: JSON.parse(row.evidence_json || '{}'),
      escalatedBy: row.escalated_by,
      status: row.status,
      createdAt: row.created_at
    });
    esc.resolution = row.resolution;
    esc.escalatedByName = row.escalated_by_name;
    esc.incidentTitle = row.incident_title;
    esc.incidentCode = row.incident_code;
    esc.incidentSeverity = row.incident_severity;
    return esc;
  }
}
