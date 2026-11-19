/**
 * Puertos de Salida (Hexagonal Architecture)
 * Contratos abstractos que deben ser implementados por adaptadores de persistencia / infraestructura.
 */

export class IncidentRepositoryPort {
  async save(incident) { throw new Error('Método save() no implementado.'); }
  async findById(id) { throw new Error('Método findById() no implementado.'); }
  async findByCode(code) { throw new Error('Método findByCode() no implementado.'); }
  async findAll(filters) { throw new Error('Método findAll() no implementado.'); }
  async update(incident) { throw new Error('Método update() no implementado.'); }
}

export class DiagnosticRepositoryPort {
  async save(diagnostic) { throw new Error('Método save() no implementado.'); }
  async findByIncidentId(incidentId) { throw new Error('Método findByIncidentId() no implementado.'); }
  async findAll(limit) { throw new Error('Método findAll() no implementado.'); }
}

export class EscalationRepositoryPort {
  async save(escalation) { throw new Error('Método save() no implementado.'); }
  async findById(id) { throw new Error('Método findById() no implementado.'); }
  async findAll(filters) { throw new Error('Método findAll() no implementado.'); }
  async update(escalation) { throw new Error('Método update() no implementado.'); }
}

export class SkillRepositoryPort {
  async findByCode(code) { throw new Error('Método findByCode() no implementado.'); }
  async findAll() { throw new Error('Método findAll() no implementado.'); }
  async save(skill) { throw new Error('Método save() no implementado.'); }
}

export class UserRepositoryPort {
  async findById(id) { throw new Error('Método findById() no implementado.'); }
  async findByEmail(email) { throw new Error('Método findByEmail() no implementado.'); }
  async save(user) { throw new Error('Método save() no implementado.'); }
  async findAll() { throw new Error('Método findAll() no implementado.'); }
}

export class QueueServicePort {
  async enqueue(type, payload) { throw new Error('Método enqueue() no implementado.'); }
  async processNext() { throw new Error('Método processNext() no implementado.'); }
  async getStatus() { throw new Error('Método getStatus() no implementado.'); }
  async replayDeadLetter(jobId) { throw new Error('Método replayDeadLetter() no implementado.'); }
}
