import crypto from 'node:crypto';
import { Diagnostic } from '../../domain/entities/Diagnostic.js';

export class RunDiagnosticUseCase {
  constructor(diagnosticRepo, incidentRepo, queueService = null) {
    this.diagnosticRepo = diagnosticRepo;
    this.incidentRepo = incidentRepo;
    this.queueService = queueService;
  }

  async execute({
    incidentId,
    skillCode,
    symptom,
    probableRootCause,
    testsPerformed,
    actionApplied,
    checklistResults = [],
    networkMetrics = {},
    technicianId,
    resolveIncident = false
  }, correlationId = null) {
    const incident = this.incidentRepo.findById(incidentId);
    if (!incident) {
      throw new Error(`Incidente no encontrado: ${incidentId}`);
    }

    const diagnosticId = `diag-${crypto.randomUUID()}`;

    const diagnostic = new Diagnostic({
      id: diagnosticId,
      incidentId,
      skillCode,
      symptom,
      probableRootCause,
      testsPerformed,
      actionApplied,
      checklistResults,
      networkMetrics,
      technicianId
    });

    // Guardar diagnóstico en persistencia
    const savedDiagnostic = this.diagnosticRepo.save(diagnostic);

    // Si se indicó resolver el incidente, actualizar su estado
    if (resolveIncident) {
      incident.resolve();
      this.incidentRepo.update(incident);
    }

    // Si hay servicio de colas, encolar tarea asíncrona de archivado y auditoría
    if (this.queueService) {
      this.queueService.enqueue('ARCHIVE_DIAGNOSTIC_REPORT', {
        diagnosticId: savedDiagnostic.id,
        incidentId,
        skillCode,
        timestamp: savedDiagnostic.createdAt
      });
    }

    return {
      diagnostic: savedDiagnostic,
      plainTextReport: savedDiagnostic.toPlainTextReport(),
      jsonReport: savedDiagnostic.toJsonReport(),
      incidentStatus: incident.status
    };
  }
}
