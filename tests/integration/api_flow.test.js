import test from 'node:test';
import assert from 'node:assert';
import { getDatabase } from '../../src/infrastructure/database/sqlite.js';
import { runSeed } from '../../src/infrastructure/database/seed.js';
import { SqliteUserRepository } from '../../src/infrastructure/repositories/SqliteUserRepository.js';
import { SqliteIncidentRepository } from '../../src/infrastructure/repositories/SqliteIncidentRepository.js';
import { SqliteDiagnosticRepository } from '../../src/infrastructure/repositories/SqliteDiagnosticRepository.js';
import { SqliteEscalationRepository } from '../../src/infrastructure/repositories/SqliteEscalationRepository.js';
import { SqliteSkillRepository } from '../../src/infrastructure/repositories/SqliteSkillRepository.js';
import { CreateIncidentUseCase } from '../../src/application/usecases/CreateIncidentUseCase.js';
import { RunDiagnosticUseCase } from '../../src/application/usecases/RunDiagnosticUseCase.js';
import { EscalateIncidentUseCase } from '../../src/application/usecases/EscalateIncidentUseCase.js';
import { AuthenticateUserUseCase } from '../../src/application/usecases/AuthenticateUserUseCase.js';

test('[INTEGRATION] Flujo Operativo Completo: Auth -> Incidente -> Diagnóstico -> Bitácora -> Escalamiento', async () => {
  const memDb = getDatabase(':memory:');
  runSeed(memDb);

  const userRepo = new SqliteUserRepository(memDb);
  const incidentRepo = new SqliteIncidentRepository(memDb);
  const diagnosticRepo = new SqliteDiagnosticRepository(memDb);
  const escalationRepo = new SqliteEscalationRepository(memDb);
  const skillRepo = new SqliteSkillRepository(memDb);

  // 1. Autenticación RBAC
  const authUseCase = new AuthenticateUserUseCase(userRepo);
  const authResult = await authUseCase.execute({
    email: 'tecnico1@fieldops.local',
    password: 'FieldOps2026!'
  });
  assert.ok(authResult.token, 'Token JWT generado');
  assert.strictEqual(authResult.user.role, 'tecnico');

  // 2. Consulta de Skills del banco modular
  const skills = skillRepo.findAll();
  assert.ok(skills.length >= 7, 'Banco modular con al menos 7 skills cargadas');
  const skillNet01 = skillRepo.findByCode('SKILL-NET-01');
  assert.strictEqual(skillNet01.code, 'SKILL-NET-01');

  // 3. Crear Incidente
  const createIncidentUseCase = new CreateIncidentUseCase(incidentRepo);
  const incident = await createIncidentUseCase.execute({
    title: 'Sede Occidente: Corte de enlace con gateway local',
    severity: 'P2',
    customerName: 'Sucursal Occidente',
    deviceType: 'ROUTER',
    ipAddress: '192.168.5.1',
    technicianId: authResult.user.id
  });

  assert.ok(incident.id);
  assert.strictEqual(incident.status, 'DIAGNOSING');

  // 4. Ejecutar Diagnóstico Técnico con 4 partes obligatorias
  const runDiagnosticUseCase = new RunDiagnosticUseCase(diagnosticRepo, incidentRepo);
  const diagResult = await runDiagnosticUseCase.execute({
    incidentId: incident.id,
    skillCode: 'SKILL-NET-01',
    symptom: 'Usuarios no navegan ni responden a ping local hacia 192.168.5.1',
    probableRootCause: 'Puerto LAN del router bloqueado por bucle de switching',
    testsPerformed: 'ipconfig /all (IP estática probada), ping a 192.168.5.1 timeout, show mac address-table',
    actionApplied: 'Se desconectó bucle en switch secundario y se reanudó tráfico ARP. Gateway respondiendo a 1ms.',
    technicianId: authResult.user.id,
    resolveIncident: true
  });

  assert.ok(diagResult.diagnostic.id);
  assert.strictEqual(diagResult.incidentStatus, 'RESOLVED');
  assert.match(diagResult.plainTextReport, /ACTA DE SERVICIO TÉCNICO/);

  // 5. Probar Escalamiento en un segundo incidente
  const incident2 = await createIncidentUseCase.execute({
    title: 'Saturación crítica de enlace WAN por falla en central de ISP',
    severity: 'P1',
    customerName: 'Centro de Cómputo Principal'
  });

  const escalateUseCase = new EscalateIncidentUseCase(escalationRepo, incidentRepo);
  const escResult = await escalateUseCase.execute({
    incidentId: incident2.id,
    targetLevel: 'PROVEEDOR_ISP',
    reason: 'Fibra de última milla atenuada en -32dBm; router ISP no entrega tráfico IP',
    evidence: {
      pingTest: 'ping sostenido 50 paquetes: 98% packet loss',
      tracerouteTest: 'tracert cortado en primer salto hacia el gateway del ISP'
    },
    escalatedBy: authResult.user.id
  });

  assert.strictEqual(escResult.incidentStatus, 'ESCALATED');
  assert.strictEqual(escResult.escalation.targetLevel, 'PROVEEDOR_ISP');
});
