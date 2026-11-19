import { getDatabase } from '../database/sqlite.js';
import { Skill } from '../../domain/entities/Skill.js';

export class SqliteSkillRepository {
  constructor(customDb = null) {
    this.db = customDb || getDatabase();
  }

  save(skill) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO skills (
        id, code, title, category, summary, content_json, version, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      `skill-${skill.code.toLowerCase()}`,
      skill.code,
      skill.title,
      skill.category,
      skill.summary,
      JSON.stringify(skill),
      '1.0',
      skill.isActive ? 1 : 0,
      new Date().toISOString()
    );

    return skill;
  }

  findByCode(code) {
    const row = this.db.prepare(`
      SELECT * FROM skills WHERE code = ? AND is_active = 1
    `).get(code);

    if (!row) return null;
    return this._mapToEntity(row);
  }

  findAll() {
    const rows = this.db.prepare(`
      SELECT * FROM skills WHERE is_active = 1 ORDER BY code ASC
    `).all();

    return rows.map(r => this._mapToEntity(r));
  }

  _mapToEntity(row) {
    const parsed = JSON.parse(row.content_json);
    return new Skill({
      code: row.code,
      title: row.title,
      category: row.category,
      summary: row.summary,
      decisionTree: parsed.decisionTree || [],
      commands: parsed.commands || [],
      checklists: parsed.checklist || parsed.mandatorySections || parsed.severityMatrix || [],
      isActive: Boolean(row.is_active)
    });
  }
}
