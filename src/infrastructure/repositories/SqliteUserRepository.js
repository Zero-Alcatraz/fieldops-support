import { getDatabase } from '../database/sqlite.js';
import { User } from '../../domain/entities/User.js';

export class SqliteUserRepository {
  constructor(customDb = null) {
    this.db = customDb || getDatabase();
  }

  save(user) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (
        id, email, password_hash, full_name, role, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.passwordHash,
      user.fullName,
      user.role,
      user.isActive ? 1 : 0,
      user.createdAt
    );

    return user;
  }

  findById(id) {
    const row = this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(id);

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findByEmail(email) {
    const row = this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email.toLowerCase().trim());

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findAll() {
    const rows = this.db.prepare(`
      SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY full_name ASC
    `).all();

    return rows.map(r => new User({
      id: r.id,
      email: r.email,
      passwordHash: '',
      fullName: r.full_name,
      role: r.role,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at
    }));
  }

  _mapToEntity(row) {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      role: row.role,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at
    });
  }
}
