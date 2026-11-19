import { passwordService, tokenService } from '../../infrastructure/security/authService.js';

export class AuthenticateUserUseCase {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new Error('Email y contraseña son obligatorios.');
    }

    const user = this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    if (!user.isActive) {
      throw new Error('Cuenta de usuario inactiva. Contacte al administrador.');
    }

    const isMatch = await passwordService.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Credenciales inválidas.');
    }

    const token = tokenService.generateToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    };
  }
}
