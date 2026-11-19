/**
 * Entidad de Dominio: Diagnóstico de Red / Dispositivos
 * Estructura obligatoria: Síntoma – Causa raíz probable – Pruebas realizadas – Acción aplicada
 */
export class Diagnostic {
  constructor({
    id,
    incidentId,
    skillCode,
    symptom,
    probableRootCause,
    testsPerformed,
    actionApplied,
    checklistResults = [],
    networkMetrics = {},
    technicianId,
    createdAt = new Date().toISOString()
  }) {
    this.validate({
      incidentId,
      skillCode,
      symptom,
      probableRootCause,
      testsPerformed,
      actionApplied
    });

    this.id = id;
    this.incidentId = incidentId;
    this.skillCode = skillCode;
    this.symptom = symptom.trim();
    this.probableRootCause = probableRootCause.trim();
    this.testsPerformed = testsPerformed.trim();
    this.actionApplied = actionApplied.trim();
    this.checklistResults = checklistResults;
    this.networkMetrics = networkMetrics; // ej: { pingAvgMs: 14, packetLossPct: 0, dnsResolved: true }
    this.technicianId = technicianId;
    this.createdAt = createdAt;
  }

  validate({ incidentId, skillCode, symptom, probableRootCause, testsPerformed, actionApplied }) {
    if (!incidentId) throw new Error('El ID de incidente es obligatorio para el diagnóstico.');
    if (!skillCode) throw new Error('El código de skill aplicada es obligatorio.');

    // Estructura obligatoria según especificación FieldOps & Support
    if (!symptom || symptom.trim().length < 5) {
      throw new Error('Estructura obligatoria incompleta: debe documentar el "Síntoma" detallado.');
    }
    if (!probableRootCause || probableRootCause.trim().length < 5) {
      throw new Error('Estructura obligatoria incompleta: debe documentar la "Causa raíz probable".');
    }
    if (!testsPerformed || testsPerformed.trim().length < 5) {
      throw new Error('Estructura obligatoria incompleta: debe documentar las "Pruebas realizadas" (comandos, mediciones).');
    }
    if (!actionApplied || actionApplied.trim().length < 5) {
      throw new Error('Estructura obligatoria incompleta: debe documentar la "Acción aplicada" para solucionar o mitigar.');
    }
  }

  /**
   * Genera el acta/bitácora técnica en formato texto plano formal
   */
  toPlainTextReport() {
    return [
      `============================================================`,
      `ACTA DE SERVICIO TÉCNICO - FIELDOPS & SUPPORT`,
      `Incidente: ${this.incidentId} | Skill: ${this.skillCode}`,
      `Fecha/Hora: ${this.createdAt}`,
      `Técnico Responsable: ${this.technicianId || 'N/A'}`,
      `------------------------------------------------------------`,
      `1. SÍNTOMA REPORTADO:`,
      `   ${this.symptom}`,
      ``,
      `2. PRUEBAS Y COMANDOS REALIZADOS:`,
      `   ${this.testsPerformed}`,
      ``,
      `3. CAUSA RAÍZ PROBABLE:`,
      `   ${this.probableRootCause}`,
      ``,
      `4. ACCIÓN APLICADA Y RESULTADO:`,
      `   ${this.actionApplied}`,
      `------------------------------------------------------------`,
      `Métricas de Red Verificadas:`,
      `   ${JSON.stringify(this.networkMetrics, null, 2)}`,
      `============================================================`
    ].join('\n');
  }

  /**
   * Genera la bitácora estructurada en JSON estándar
   */
  toJsonReport() {
    return {
      reportType: "BITACORA_CIERRE_FIELDOPS",
      version: "1.0",
      incidentId: this.incidentId,
      skillCode: this.skillCode,
      technicianId: this.technicianId,
      timestamp: this.createdAt,
      reportSections: {
        symptom: this.symptom,
        probableRootCause: this.probableRootCause,
        testsPerformed: this.testsPerformed,
        actionApplied: this.actionApplied
      },
      checklistResults: this.checklistResults,
      networkMetrics: this.networkMetrics
    };
  }
}
