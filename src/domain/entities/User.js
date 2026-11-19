/**
 * Entidad de Dominio: Usuario Operativo (RBAC)
 * Roles: tecnico, mesa_ayuda, coordinador, admin
 */
export class User {
  static ROLES = ['tecnico', 'mesa_ayuda', 'coordinador', 'admin'];

  constructor({
    id,
    email,
    passwordHash,
    fullName,
    role = 'tecnico',
    isActive = true,
    createdAt = new Date().toISOString()
  }) {
    if (!email || !email.includes('@')) throw new Error('Email corporativo inválido.');
    if (!fullName || fullName.trim().length < 3) throw new Error('Nombre completo requerido.');
    if (!User.ROLES.includes(role)) {
      throw new Error(`Rol no válido: ${role}. Permitidos: ${User.ROLES.join(', ')}`);
    }

    this.id = id;
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.fullName = fullName.trim();
    this.role = role;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  canEscalate() {
    return ['tecnico', 'mesa_ayuda', 'coordinador', 'admin'].includes(this.role);
  }

  canManageUsers() {
    return this.role === 'admin' || this.role === 'coordinador';
  }

  canCloseIncidents() {
    return ['tecnico', 'mesa_ayuda', 'coordinador', 'admin'].includes(this.role);
  }
}
