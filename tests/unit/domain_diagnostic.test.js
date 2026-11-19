import test from 'node:test';
import assert from 'node:assert';
import { Diagnostic } from '../../src/domain/entities/Diagnostic.js';
import { Escalation } from '../../src/domain/entities/Escalation.js';

test('[DOMAIN] Diagnostic - Estructura obligatoria de 4 secciones', () => {
  const diag = new Diagnostic({
    id: 'diag-01',
    incidentId: 'inc-01',
    skillCode: 'SKILL-NET-01',
    symptom: 'El usuario no tiene acceso a la red ni navega a Internet',
    probableRootCause: 'Cable de red desconectado o con pines dañados',
    testsPerformed: 'ipconfig /all (IP 169.254.x.x) y ping a gateway con 100% loss',
    actionApplied: 'Se reemplazó cable de red por uno nuevo y se ejecutó ipconfig /renew',
    technicianId: 'usr-tec-01'
  });

  assert.strictEqual(diag.skillCode, 'SKILL-NET-01');
  const plainReport = diag.toPlainTextReport();
  assert.match(plainReport, /ACTA DE SERVICIO TÉCNICO/);
  assert.match(plainReport, /1\. SÍNTOMA REPORTADO/);
  assert.match(plainReport, /2\. PRUEBAS Y COMANDOS REALIZADOS/);
  assert.match(plainReport, /3\. CAUSA RAÍZ PROBABLE/);
  assert.match(plainReport, /4\. ACCIÓN APLICADA Y RESULTADO/);

  const jsonReport = diag.toJsonReport();
  assert.strictEqual(jsonReport.reportType, 'BITACORA_CIERRE_FIELDOPS');
  assert.strictEqual(jsonReport.reportSections.symptom, diag.symptom);
});

test('[DOMAIN] Diagnostic - Falla si falta alguna sección obligatoria', () => {
  assert.throws(() => {
    new Diagnostic({
      id: 'diag-02',
      incidentId: 'inc-01',
      skillCode: 'SKILL-NET-01',
      symptom: 'No hay internet',
      probableRootCause: '', // Vacío
      testsPerformed: 'Ping realizado',
      actionApplied: 'Reinicio de router'
    });
  }, /Causa raíz probable/);
});

test('[DOMAIN] Escalation - Validación estricta de matriz de evidencias mínimas', () => {
  // Caso de rechazo: solo 1 evidencia
  assert.throws(() => {
    new Escalation({
      id: 'esc-01',
      incidentId: 'inc-01',
      targetLevel: 'L3_INGENIERIA_RED',
      reason: 'El router no enruta paquetes hacia el ISP tras múltiples pruebas',
      evidence: {
        pingTest: 'ping 8.8.8.8 100% loss'
        // Faltan ipConfig y tracert
      },
      escalatedBy: 'usr-tec-01'
    });
  }, /Escalamiento rechazado por falta de evidencia mínima/);

  // Caso de éxito: 2 evidencias válidas
  const esc = new Escalation({
    id: 'esc-02',
    incidentId: 'inc-01',
    targetLevel: 'PROVEEDOR_ISP',
    reason: 'Fibra óptica atenuada en ODF local, pérdida total hacia gateway del ISP',
    evidence: {
      pingTest: 'ping al gateway 100% loss',
      tracerouteTest: 'tracert cortado en salto 1'
    },
    escalatedBy: 'usr-tec-01'
  });

  assert.strictEqual(esc.status, 'PENDING_REVIEW');
  assert.strictEqual(esc.targetLevel, 'PROVEEDOR_ISP');
});
