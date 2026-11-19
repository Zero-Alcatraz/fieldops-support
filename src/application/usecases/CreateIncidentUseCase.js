import crypto from 'node:crypto';
import { Incident } from '../../domain/entities/Incident.js';

export class CreateIncidentUseCase {
  constructor(incidentRepo, auditRepo = null) {
    this.incidentRepo = incidentRepo;
    this.auditRepo = auditRepo;
  }

  async execute({
    title,
    severity = 'P3',
    customerName,
    location,
    deviceType = 'ROUTER',
    ipAddress = null,
    technicianId = null
  }, correlationId = null) {
    // Generar código único correlativo INC-YYYY-XXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `INC-${year}-${randomSuffix}`;
    const id = `inc-${crypto.randomUUID()}`;

    const incident = new Incident({
      id,
      code,
      title,
      severity,
      status: technicianId ? 'DIAGNOSING' : 'TRIAGE',
      technicianId,
      customerName,
      location,
      deviceType,
      ipAddress
    });

    const saved = this.incidentRepo.save(incident);
    return saved;
  }
}
