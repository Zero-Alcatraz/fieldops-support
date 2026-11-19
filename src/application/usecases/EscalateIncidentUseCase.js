import crypto from 'node:crypto';
import { Escalation } from '../../domain/entities/Escalation.js';

export class EscalateIncidentUseCase {
  constructor(escalationRepo, incidentRepo, queueService = null) {
    this.escalationRepo = escalationRepo;
    this.incidentRepo = incidentRepo;
    this.queueService = queueService;
  }

  async execute({
    incidentId,
    targetLevel,
    reason,
    evidence = {},
    escalatedBy
  }, correlationId = null) {
    const incident = this.incidentRepo.findById(incidentId);
    if (!incident) {
      throw new Error(`Incidente no encontrado: ${incidentId}`);
    }

    if (incident.status === 'RESOLVED') {
      throw new Error('No es posible escalar un incidente que ya fue marcado como RESUELTO.');
    }

    const escalationId = `esc-${crypto.randomUUID()}`;

    // La entidad valida automáticamente la matriz de evidencias mínimas
    const escalation = new Escalation({
      id: escalationId,
      incidentId,
      targetLevel,
      reason,
      evidence,
      escalatedBy,
      status: 'PENDING_REVIEW'
    });

    const savedEscalation = this.escalationRepo.save(escalation);

    // Actualizar estado del incidente a ESCALATED
    incident.escalate();
    this.incidentRepo.update(incident);

    // Encolar notificación asíncrona a nivel superior (NOC/L2/ISP)
    if (this.queueService) {
      this.queueService.enqueue('NOTIFY_ESCALATION_TIER', {
        escalationId: savedEscalation.id,
        incidentId,
        incidentCode: incident.code,
        targetLevel,
        severity: incident.severity,
        reason
      });
    }

    return {
      escalation: savedEscalation,
      incidentStatus: incident.status
    };
  }
}
