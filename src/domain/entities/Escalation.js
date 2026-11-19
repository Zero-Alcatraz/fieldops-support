/**
 * Entidad de Dominio: Escalamiento Técnico
 * Valida niveles de escalado y matriz de evidencia mínima requerida para evitar rebotes.
 */
export class Escalation {
  static TARGET_LEVELS = ['L2_ESPECIALISTA', 'L3_INGENIERIA_RED', 'PROVEEDOR_ISP', 'GARANTIA_HARDWARE'];

  // Evidencias mínimas obligatorias según convención FieldOps
  static REQUIRED_EVIDENCE_KEYS = [
    'pingTest',        // Captura o resultado de ping a Gateway/DNS
    'ipConfig',        // Verificación de direccionamiento IP y máscara
    'tracerouteTest'   // Trazado de ruta demostrando el punto de falla
  ];

  constructor({
    id,
    incidentId,
    targetLevel,
    reason,
    evidence = {},
    escalatedBy,
    status = 'PENDING_REVIEW',
    createdAt = new Date().toISOString()
  }) {
    this.validate({ incidentId, targetLevel, reason, evidence, escalatedBy });

    this.id = id;
    this.incidentId = incidentId;
    this.targetLevel = targetLevel;
    this.reason = reason.trim();
    this.evidence = evidence;
    this.escalatedBy = escalatedBy;
    this.status = status;
    this.createdAt = createdAt;
  }

  validate({ incidentId, targetLevel, reason, evidence, escalatedBy }) {
    if (!incidentId) throw new Error('ID de incidente requerido para escalamiento.');
    if (!escalatedBy) throw new Error('Identificación del técnico escalador requerida.');
    if (!Escalation.TARGET_LEVELS.includes(targetLevel)) {
      throw new Error(`Nivel de escalamiento inválido: ${targetLevel}. Válidos: ${Escalation.TARGET_LEVELS.join(', ')}`);
    }
    if (!reason || reason.trim().length < 10) {
      throw new Error('La justificación del escalamiento debe tener mínimo 10 caracteres explicativos.');
    }

    // Comprobación de evidencia mínima: al menos 2 evidencias técnicas explícitas
    const validEvidenceCount = Escalation.REQUIRED_EVIDENCE_KEYS.filter(
      key => evidence[key] && String(evidence[key]).trim().length > 3
    ).length;

    if (validEvidenceCount < 2) {
      throw new Error(
        `Escalamiento rechazado por falta de evidencia mínima. Debe incluir al menos 2 de las siguientes evidencias verificables: ${Escalation.REQUIRED_EVIDENCE_KEYS.join(', ')}`
      );
    }
  }

  acknowledge() {
    this.status = 'IN_REVIEW';
  }

  close(resolution) {
    this.status = 'CLOSED';
    this.resolution = resolution;
  }
}
