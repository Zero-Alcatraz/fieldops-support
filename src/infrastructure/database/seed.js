import { getDatabase } from './sqlite.js';
import { runMigrations } from './migrations.js';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

export function runSeed(customDb = null) {
  const db = customDb || getDatabase();

  // Asegurar que las migraciones estén aplicadas
  runMigrations(db);

  console.log('[SEED] Iniciando carga de datos iniciales...');

  // 1. Usuarios con roles RBAC (Contraseña por defecto: FieldOps2026!)
  const passwordHash = bcrypt.hashSync('FieldOps2026!', 10);
  const now = new Date().toISOString();

  const users = [
    {
      id: 'usr-admin-01',
      email: 'admin@fieldops.local',
      password_hash: passwordHash,
      full_name: 'Administrador General',
      role: 'admin',
      is_active: 1,
      created_at: now
    },
    {
      id: 'usr-coord-01',
      email: 'coordinador@fieldops.local',
      password_hash: passwordHash,
      full_name: 'Carlos Mendoza (Coordinador Operaciones)',
      role: 'coordinador',
      is_active: 1,
      created_at: now
    },
    {
      id: 'usr-mesa-01',
      email: 'mesa1@fieldops.local',
      password_hash: passwordHash,
      full_name: 'Laura Gómez (Agente HelpDesk L1)',
      role: 'mesa_ayuda',
      is_active: 1,
      created_at: now
    },
    {
      id: 'usr-tec-01',
      email: 'tecnico1@fieldops.local',
      password_hash: passwordHash,
      full_name: 'Andrés Morales (Técnico en Campo)',
      role: 'tecnico',
      is_active: 1,
      created_at: now
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.email, u.password_hash, u.full_name, u.role, u.is_active, u.created_at);
  }
  console.log(`[SEED] ${users.length} usuarios operativos RBAC registrados.`);

  // 2. Cargar skills modulares desde el banco JSON
  const skillsDir = path.resolve(process.cwd(), 'src/skills_bank');
  const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));

  const insertSkill = db.prepare(`
    INSERT OR REPLACE INTO skills (id, code, title, category, summary, content_json, version, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let loadedSkills = 0;
  for (const file of skillFiles) {
    const raw = fs.readFileSync(path.join(skillsDir, file), 'utf-8');
    const skillData = JSON.parse(raw);
    const skillId = `skill-${skillData.code.toLowerCase()}`;

    insertSkill.run(
      skillId,
      skillData.code,
      skillData.title,
      skillData.category,
      skillData.summary,
      raw,
      '1.0',
      1,
      now
    );
    loadedSkills++;
  }
  console.log(`[SEED] ${loadedSkills} skills modulares cargadas en el banco operativo.`);

  // 3. Incidentes demostrativos iniciales
  const incidents = [
    {
      id: 'inc-2026-001',
      code: 'INC-2026-001',
      title: 'Sede Norte: Pérdida total de conectividad en área de facturación',
      severity: 'P1',
      status: 'DIAGNOSING',
      technician_id: 'usr-tec-01',
      customer_name: 'Sucursal Norte - Facturación',
      location: 'Calle 100 #15-20, Piso 3',
      device_type: 'ROUTER',
      ip_address: '192.168.10.1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: now
    },
    {
      id: 'inc-2026-002',
      code: 'INC-2026-002',
      title: 'Degradación de voz IP y videollamadas con microcortes continuos',
      severity: 'P2',
      status: 'TRIAGE',
      technician_id: null,
      customer_name: 'Sede Administrativa - Gerencia',
      location: 'Carrera 7 #72-10, Oficina 502',
      device_type: 'SWITCH_ACCESS',
      ip_address: '10.20.4.15',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: now
    },
    {
      id: 'inc-2026-003',
      code: 'INC-2026-003',
      title: 'Puesto contabilidad no puede acceder al portal web corporativo',
      severity: 'P3',
      status: 'TRIAGE',
      technician_id: null,
      customer_name: 'Dpto. Contable - Puesto 4',
      location: 'Edificio Central, Cubículo C-04',
      device_type: 'WORKSTATION',
      ip_address: '192.168.1.105',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: now
    }
  ];

  const insertIncident = db.prepare(`
    INSERT OR REPLACE INTO incidents (id, code, title, severity, status, technician_id, customer_name, location, device_type, ip_address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const inc of incidents) {
    insertIncident.run(
      inc.id,
      inc.code,
      inc.title,
      inc.severity,
      inc.status,
      inc.technician_id,
      inc.customer_name,
      inc.location,
      inc.device_type,
      inc.ip_address,
      inc.created_at,
      inc.updated_at
    );
  }
  console.log(`[SEED] ${incidents.length} incidentes de prueba registrados.`);
  console.log('[SEED] Carga de datos completada exitosamente.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
