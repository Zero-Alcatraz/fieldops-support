import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fieldops-secret-key-2026-production-ready';
const JWT_EXPIRES_IN = '8h';

export const passwordService = {
  hash: async (plainPassword) => {
    return bcrypt.hash(plainPassword, 10);
  },
  compare: async (plainPassword, hash) => {
    return bcrypt.compare(plainPassword, hash);
  }
};

export const tokenService = {
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
};
