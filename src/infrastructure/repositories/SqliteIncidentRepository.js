import { getDatabase } from '../database/sqlite.js';
import { Incident } from '../../domain/entities/Incident.js';

export class SqliteIncidentRepository {
  constructor(customDb = null) {
    this.db = customDb || getDatabase();
  }

  save(incident) {
    const stmt = this.db.prepare(`
      INSERT INTO incidents (
        id, code, title, severity, status, technician_id,
        customer_name, location, device_type, ip_address,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      incident.id,
      incident.code,
      incident.title,
      incident.severity,
      incident.status,
      incident.technicianId ?? null,
      incident.customerName,
      incident.location ?? null,
      incident.deviceType ?? 'ROUTER',
      incident.ipAddress ?? null,
      incident.createdAt,
      incident.updatedAt
    );

    return incident;
  }

  update(incident) {
    const stmt = this.db.prepare(`
      UPDATE incidents
      SET title = ?, severity = ?, status = ?, technician_id = ?,
          customer_name = ?, location = ?, device_type = ?, ip_address = ?,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      incident.title,
      incident.severity,
      incident.status,
      incident.technicianId ?? null,
      incident.customerName,
      incident.location ?? null,
      incident.deviceType ?? 'ROUTER',
      incident.ipAddress ?? null,
      incident.updatedAt,
      incident.id
    );

    return incident;
  }

  findById(id) {
    const row = this.db.prepare(`
      SELECT i.*, u.full_name as technician_name
      FROM incidents i
      LEFT JOIN users u ON i.technician_id = u.id
      WHERE i.id = ?
    `).get(id);

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findByCode(code) {
    const row = this.db.prepare(`
      SELECT i.*, u.full_name as technician_name
      FROM incidents i
      LEFT JOIN users u ON i.technician_id = u.id
      WHERE i.code = ?
    `).get(code);

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findAll(filters = {}) {
    let query = `
      SELECT i.*, u.full_name as technician_name
      FROM incidents i
      LEFT JOIN users u ON i.technician_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND i.status = ?`;
      params.push(filters.status);
    }
    if (filters.severity) {
      query += ` AND i.severity = ?`;
      params.push(filters.severity);
    }
    if (filters.technicianId) {
      query += ` AND i.technician_id = ?`;
      params.push(filters.technicianId);
    }

    query += ` ORDER BY i.created_at DESC`;

    const rows = this.db.prepare(query).all(...params);
    return rows.map(r => this._mapToEntity(r));
  }

  _mapToEntity(row) {
    const incident = new Incident({
      id: row.id,
      code: row.code,
      title: row.title,
      severity: row.severity,
      status: row.status,
      technicianId: row.technician_id,
      customerName: row.customer_name,
      location: row.location,
      deviceType: row.device_type,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
    incident.technicianName = row.technician_name || 'Sin asignar';
    return incident;
  }
}
