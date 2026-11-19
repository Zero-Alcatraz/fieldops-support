# syntax=docker/dockerfile:1
FROM node:24-alpine AS base

WORKDIR /app

# Instalar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente y assets
COPY src/ ./src/
COPY public/ ./public/
COPY SKILLS.md ./

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/fieldops.sqlite

# Crear directorio de datos persistentes
RUN mkdir -p /app/data && chown -R node:node /app

# Ejecutar como usuario sin privilegios
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/interfaces/http/server.js"]
