# Manual de Despliegue, Operación y Mantenimiento: FieldOps & Support
## Guía de Puesta en Producción, Dockerización, Respaldos y Monitoreo

---

## 🖥️ 1. Requisitos del Sistema y Dimensionamiento

### Requisitos Mínimos de Hardware
- **Procesador (CPU):** 1 núcleo virtual (vCPU) a 2.0 GHz o superior.
- **Memoria RAM:** 1 GB mínimo (2 GB recomendados para concurrencia alta).
- **Almacenamiento en Disco:** 10 GB de espacio libre (SSD/NVMe recomendado para el modo WAL de SQLite).
- **Red:** Conexión de red estándar con salida a Internet (para sincronización y dependencias iniciales).

### Requisitos de Software
- **Sistema Operativo:** Linux (Ubuntu 22.04 LTS+, Debian 12+, RHEL 9+) o Windows Server 2022 / Windows 11.
- **Node.js:** Versión 22.5.0+ o versión 24+ LTS (requerido por el módulo nativo `node:sqlite`).
- **NPM:** Versión 10+ o superior.
- **Docker & Docker Compose:** (Opcional si se despliega en contenedores) Docker 24+ con Compose v2+.

---

## ⚙️ 2. Variables de Entorno del Sistema

Crea un archivo `.env` en la raíz del proyecto para producción:

```env
# Puerto HTTP en el que escuchará la aplicación
PORT=3000

# Entorno de ejecución (development | production)
NODE_ENV=production

# Ruta persistente del archivo de base de datos SQLite
DB_PATH=./fieldops.sqlite

# Clave secreta criptográfica para la firma de tokens JWT (OWASP ASVS)
JWT_SECRET=c5f789d3a12b4e6098c4d2e1f9801a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f

# Tiempo de expiración de las sesiones JWT
JWT_EXPIRES_IN=8h
```

---

## 🚀 3. Despliegue en Servidor Físico o VPS (Bare-Metal)

### Paso 1: Clonar y Preparar el Código
```bash
# Navegar al directorio de aplicaciones
cd /var/www

# Clonar o copiar el repositorio del proyecto
git clone <URL_REPOSITORIO> programa
cd programa

# Instalar dependencias estrictas de producción
npm ci --only=production
```

### Paso 2: Ejecutar Migraciones y Datos Iniciales
```bash
# Aplicar esquema de base de datos SQLite y cargar banco de skills
npm run seed
```

### Paso 3: Configurar Daemon con PM2 (Arranque Automático 24/7)
Para garantizar que la aplicación se reinicie automáticamente ante fallos o reinicios del servidor, se recomienda **PM2**:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start src/interfaces/http/server.js --name "fieldops-platform"

# Guardar la lista de procesos activos
pm2 save

# Configurar el script de inicio en el arranque del sistema operativo
pm2 startup
```

### Paso 4: Configurar Reverse Proxy con Nginx y SSL (HTTPS)
Crea el archivo de configuración en `/etc/nginx/sites-available/fieldops`:

```nginx
server {
    listen 80;
    server_name fieldops.tuempresa.com;

    # Redirección automática a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fieldops.tuempresa.com;

    # Certificados SSL (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/fieldops.tuempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fieldops.tuempresa.com/privkey.pem;

    # Optimización de compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts para procesamiento de triaje y diagnósticos
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Habilitar el sitio y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/fieldops /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 4. Despliegue con Contenedores Docker

El proyecto incluye un [`Dockerfile`](file:///c:/Users/cabar/Downloads/programa/Dockerfile) multi-stage basado en Node 24 Alpine y un archivo [`docker-compose.yml`](file:///c:/Users/cabar/Downloads/programa/docker-compose.yml).

### Características de Seguridad del Contenedor
- **Multi-Stage Build:** Imagen ultraliviana (~180 MB) libre de herramientas de compilación innecesarias.
- **Usuario no-root:** Ejecuta bajo el usuario `node` (UID 1000) para prevenir escaladas de privilegios.
- **Healthcheck Nativo:** Monitor automático cada 30 segundos contra `/api/health`.

### Despliegue en 1 Comando
```bash
# Levantar el contenedor en segundo plano con volumen persistente
docker compose up -d --build
```

### Comandos de Operación Docker
```bash
# Ver el estado del contenedor y su healthcheck
docker compose ps

# Monitorear logs estructurados en tiempo real
docker compose logs -f fieldops-platform

# Detener el servicio preservando la base de datos
docker compose down

# Reiniciar el contenedor
docker compose restart
```

---

## 💾 5. Estrategia de Respaldos y Disaster Recovery (DRP)

Dado que SQLite opera en modo WAL (`fieldops.sqlite`, `fieldops.sqlite-wal`, `fieldops.sqlite-shm`), nunca debe copiarse el archivo con `cp` directamente mientras el servidor esté en ejecución.

### Respaldo en Caliente (Hot Backup Online)
Ejecuta el comando seguro de backup que garantiza consistencia atómica:
```bash
# Crear directorio de backups
mkdir -p /var/backups/fieldops

# Respaldo atómico en caliente
sqlite3 ./fieldops.sqlite ".backup '/var/backups/fieldops/fieldops_$(date +%Y%m%d_%H%M%S).sqlite'"
```

### Script de Backup Automático Diario (`crontab`)
Edita las tareas programadas con `crontab -e`:
```bash
# Respaldar la base de datos todos los días a las 02:00 AM y rotar backups > 30 días
0 2 * * * sqlite3 /var/www/programa/fieldops.sqlite ".backup '/var/backups/fieldops/fieldops_$(date +\%F).sqlite'" && find /var/backups/fieldops/ -type f -mtime +30 -delete
```

### Procedimiento de Restauración ante Desastres
En caso de pérdida o corrupción de datos:
1. Detener la aplicación:
   ```bash
   pm2 stop fieldops-platform   # O docker compose down
   ```
2. Reemplazar el archivo de base de datos con el respaldo:
   ```bash
   # Eliminar temporales WAL si existieran
   rm -f ./fieldops.sqlite-wal ./fieldops.sqlite-shm
   # Restaurar respaldo
   cp /var/backups/fieldops/fieldops_YYYY-MM-DD.sqlite ./fieldops.sqlite
   ```
3. Iniciar la aplicación:
   ```bash
   pm2 start fieldops-platform   # O docker compose up -d
   ```

---

## 🔍 6. Monitoreo, Métricas y Solución de Problemas (Troubleshooting)

### Endpoint de Health Check
La plataforma expone el endpoint `/api/health`:
```bash
curl -i http://localhost:3000/api/health
```
**Respuesta esperada (HTTP 200 OK):**
```json
{
  "status": "UP",
  "service": "FieldOps & Support Platform",
  "version": "1.0.0",
  "timestamp": "2026-11-19T19:05:00.000Z"
}
```

### Problemas Frecuentes y Solución

| Síntoma | Causa Raíz Probable | Acción Correctiva Inmediata |
| :--- | :--- | :--- |
| `Error: listen EADDRINUSE :::3000` | El puerto 3000 está ocupado por otra instancia o proceso. | Cambiar el puerto en `.env` (`PORT=3001`) o finalizar el proceso anterior con `netstat -ano` y `taskkill /PID <PID> /F` (Windows) o `kill -9 $(lsof -t -i:3000)` (Linux). |
| `TypeError: Cannot read properties of undefined` en SQLite | Versión de Node.js anterior a 22.5 que no soporta `node:sqlite`. | Actualizar el runtime a Node.js v22.5.0+ o v24 LTS con `nvm install 24 && nvm use 24`. |
| Error `SQLITE_BUSY: database is locked` | Múltiples procesos intentando escribir concurrentemente sin WAL. | Asegurarse de que el directorio tenga permisos de escritura (`chmod 755 .`) para que SQLite pueda crear los archivos auxiliares `-wal` y `-shm`. |
| `Dead Letter Queue (DLQ)` aumentando | Errores recurrentes en el procesamiento asíncrono de bitácoras. | Ir a la pestaña **Monitor de Cola**, revisar el campo `last_error` del trabajo y presionar **"Replay"** tras corregir la causa externa. |
