/**
 * Entidad de Dominio: Incidente
 * Reglas de negocio e invariantes puras (sin dependencias de frameworks ni BD).
 */
export class Incident {
  static SEVERITIES = ['P1', 'P2', 'P3', 'P4'];
  static STATUSES = ['TRIAGE', 'DIAGNOSING', 'RESOLVED', 'ESCALATED'];

  static SLA_HOURS = {
    P1: 2,   // Incidente crítico: Red caída, sede aislada
    P2: 4,   // Alta degradación: Pérdida masiva de paquetes, servicio crítico lento
    P3: 8,   // Afectación moderada: Un usuario/equipo sin servicio específico
    P4: 24   // Solicitud menor o falla menor sin impacto en operación
  };

  constructor({
    id,
    code,
    title,
    severity = 'P3',
    status = 'TRIAGE',
    technicianId = null,
    customerName,
    location,
    deviceType = 'ROUTER',
    ipAddress = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.validate({ title, severity, status, customerName });

    this.id = id;
    this.code = code;
    this.title = title.trim();
    this.severity = severity;
    this.status = status;
    this.technicianId = technicianId;
    this.customerName = customerName.trim();
    this.location = location;
    this.deviceType = deviceType;
    this.ipAddress = ipAddress;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate({ title, severity, status, customerName }) {
    if (!title || title.trim().length < 5) {
      throw new Error('El título del incidente debe tener al menos 5 caracteres.');
    }
    if (!customerName || customerName.trim().length < 3) {
      throw new Error('El nombre de cliente o sede debe tener al menos 3 caracteres.');
    }
    if (!Incident.SEVERITIES.includes(severity)) {
      throw new Error(`Severidad inválida: ${severity}. Permitidas: ${Incident.SEVERITIES.join(', ')}`);
    }
    if (!Incident.STATUSES.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Permitidos: ${Incident.STATUSES.join(', ')}`);
    }
  }

  getSlaHours() {
    return Incident.SLA_HOURS[this.severity] || 24;
  }

  assignTechnician(technicianId) {
    if (!technicianId) throw new Error('ID de técnico requerido para asignación.');
    this.technicianId = technicianId;
    if (this.status === 'TRIAGE') {
      this.status = 'DIAGNOSING';
    }
    this.updatedAt = new Date().toISOString();
  }

  resolve() {
    if (this.status === 'RESOLVED') {
      throw new Error('El incidente ya se encuentra resuelto.');
    }
    this.status = 'RESOLVED';
    this.updatedAt = new Date().toISOString();
  }

  escalate() {
    if (this.status === 'RESOLVED') {
      throw new Error('No se puede escalar un incidente que ya fue resuelto.');
    }
    this.status = 'ESCALATED';
    this.updatedAt = new Date().toISOString();
  }
}
