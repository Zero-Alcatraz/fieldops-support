import test from 'node:test';
import assert from 'node:assert';
import { Incident } from '../../src/domain/entities/Incident.js';

test('[DOMAIN] Incident - Creación y validación de invariantes de negocio', () => {
  const incident = new Incident({
    id: 'inc-test-01',
    code: 'INC-2026-999',
    title: 'Falla crítica de enlace de fibra en sede principal',
    severity: 'P1',
    customerName: 'Sede Principal - NOC',
    location: 'Calle 100 #15-20'
  });

  assert.strictEqual(incident.code, 'INC-2026-999');
  assert.strictEqual(incident.severity, 'P1');
  assert.strictEqual(incident.status, 'TRIAGE');
  assert.strictEqual(incident.getSlaHours(), 2); // P1 SLA es 2 horas
});

test('[DOMAIN] Incident - Rechazo por título o cliente insuficiente', () => {
  assert.throws(() => {
    new Incident({
      id: '1',
      code: 'INC-01',
      title: 'Red', // Menor a 5 caracteres
      severity: 'P1',
      customerName: 'Cliente'
    });
  }, /El título del incidente debe tener al menos 5 caracteres/);

  assert.throws(() => {
    new Incident({
      id: '1',
      code: 'INC-01',
      title: 'Falla en enlace principal',
      severity: 'P5', // Severidad inválida
      customerName: 'Cliente'
    });
  }, /Severidad inválida/);
});

test('[DOMAIN] Incident - Transición de estados y asignación de técnico', () => {
  const incident = new Incident({
    id: 'inc-02',
    code: 'INC-2026-002',
    title: 'Lentitud recurrente en videollamadas',
    severity: 'P2',
    customerName: 'Gerencia'
  });

  assert.strictEqual(incident.status, 'TRIAGE');
  incident.assignTechnician('usr-tec-01');
  assert.strictEqual(incident.status, 'DIAGNOSING');
  assert.strictEqual(incident.technicianId, 'usr-tec-01');

  incident.resolve();
  assert.strictEqual(incident.status, 'RESOLVED');

  // No se puede volver a resolver ni escalar un incidente ya resuelto
  assert.throws(() => {
    incident.escalate();
  }, /No se puede escalar un incidente que ya fue resuelto/);
});
