# FieldOps & Support — Banco de Skills Modulares y Plataforma de Triaje

> Estandarización del triaje de fallas técnicas de red y dispositivos, generación automatizada de bitácoras operativas y escalamiento de incidentes hacia niveles superiores (P1–P4).

Este proyecto implementa íntegramente la especificación técnica contenida en [`SKILLS.md`](file:///c:/Users/cabar/Downloads/programa/SKILLS.md), estructurado en **4 fases de ingeniería de software** y bajo una **arquitectura hexagonal pura** con persistencia en SQLite, workers de resiliencia (DLQ), validación de contratos con Zod y un frontend web accesible (WCAG 2.2).

---

## 📚 Documentación y Manuales Oficiales del Sistema

El proyecto cuenta con 3 manuales exhaustivos diseñados para cada perfil de la organización:

1. 📖 **[Manual de Usuario](docs/MANUAL_USUARIO.md):** Guía paso a paso para Técnicos en Campo, HelpDesk L1/L2 y Coordinadores. Incluye el uso del asistente de triaje, la redacción obligatoria de 4 secciones, matrices anti-rebote de escalamiento y protocolo de comunicación asertiva.
2. 🏛️ **[Manual Técnico de Arquitectura](docs/MANUAL_TECNICO.md):** Especificación profunda de la Arquitectura Hexagonal, modelo de datos relacional SQLite con WAL, diccionario de tablas, índices anti-latencia N+1, subsistema de colas resilientes (DLQ), estándares de seguridad OWASP ASVS y catálogo exhaustivo de la API REST.
3. 🚀 **[Manual de Despliegue y Operación](docs/MANUAL_DESPLIEGUE.md):** Procedimientos de puesta en producción en servidores Bare-Metal/VPS (PM2, Reverse Proxy Nginx con SSL/TLS), despliegue contenerizado con Docker y Docker Compose, políticas de respaldo atómico en caliente para SQLite y troubleshooting operativo.

---

## 🎯 Propósito y Alcance

- **Para quién es:** Técnicos de soporte en campo, analistas de mesa de ayuda (HelpDesk L1/L2) y coordinadores operativos.
- **Qué problema resuelve:** Reduce los tiempos de diagnóstico en sitio, elimina la ambigüedad en los reportes técnicos y previene el rebote de incidentes mediante validación obligatoria de evidencias mínimas.
- **Formato obligatorio de reporte:** Estructura de 4 secciones normativas:
  $$\text{Síntoma} \longrightarrow \text{Pruebas realizadas} \longrightarrow \text{Causa raíz probable} \longrightarrow \text{Acción aplicada}$$

---

## 🏗️ Arquitectura Hexagonal del Sistema

El software separa estrictamente el dominio de cualquier framework o infraestructura externa:

```
src/
├── domain/                  # LÓGICA PURA DE NEGOCIO (Sin dependencias externas)
│   ├── entities/            # Incident, Diagnostic, Escalation, Skill, User
│   └── ports/               # RepositoriesPorts, QueueServicePort
├── application/             # CASOS DE USO Y ORQUESTACIÓN
│   └── usecases/            # CreateIncident, RunDiagnostic, Escalate, Auth
├── infrastructure/          # ADAPTADORES DE INFRAESTRUCTURA
│   ├── database/            # SQLite con WAL, migraciones versionadas y seeds
│   ├── repositories/        # SqliteIncidentRepo, SqliteDiagnosticRepo, etc.
│   ├── queue/               # ResilientJobQueue con Dead Letter Queue (DLQ)
│   ├── security/            # BCrypt (ASVS) y JWT Auth
│   └── logging/             # Logger estructurado con Correlation IDs y redacción PII
├── interfaces/              # ADAPTADORES DE ENTRADA (HTTP Y WEB)
│   └── http/                # Express 5, Middlewares, Schemas Zod y Rutas REST
├── skills_bank/             # BANCO MODULAR DE SKILLS (JSON autocontenidos)
│   ├── SKILL-NET-01...      # Conectividad física e IP local
│   ├── SKILL-NET-02...      # Latencia, jitter y pérdida de paquetes
│   ├── SKILL-NET-03...      # Resolución DNS
│   ├── SKILL-NET-04...      # MTU, proxies y configuración local
│   ├── SKILL-OPS-01...      # Bitácora estandarizada de cierre
│   ├── SKILL-ESC-01...      # Matriz de escalamiento P1-P4
│   └── SKILL-COM-01...      # Protocolo de comunicación con usuario
└── public/                  # FRONTEND WEB ACCESIBLE Y RESPONSIVE
    ├── index.html           # SPA semántica (WCAG 2.2)
    ├── css/styles.css       # Estilos accesibles sin dependencias externas
    └── js/                  # Cliente API reactivo y árbol de decisión interactivo
```

---

## 🚀 Fases de Desarrollo Implementadas

### Fase 1: Arquitectura y Modelo de Datos
- **Entidades de dominio puras:** Validación de invariantes de negocio para incidentes, diagnósticos y escalamientos.
- **Modelo Relacional SQLite normalizado:** Claves primarias y foráneas explícitas (`PRAGMA foreign_keys = ON`), modo `WAL`.
- **Migraciones versionadas y reversibles:** Sistema de migraciones con tabla `schema_migrations` (`001_initial_schema`, `002_performance_indexes_and_queues`).
- **Eliminación de N+1:** Índices compuestos en `(status, severity)`, `technician_id`, `incident_id` y `correlation_id`.
- **Banco modular de 7 skills de red:** JSONs autocontenidos con árboles de decisión y comandos verificables (`ipconfig`, `ping`, `tracert`, `nslookup`).

### Fase 2: Backend, APIs, Colas y Seguridad
- **Autenticación y RBAC (OWASP ASVS):** Roles operativos (`tecnico`, `mesa_ayuda`, `coordinador`, `admin`), contraseñas con bcrypt (10 rondas), tokens JWT.
- **Validación con Zod:** Esquemas alineados servidor-cliente para prevenir inyecciones y datos inválidos.
- **Cola resiliente y Dead-Letter Queue (DLQ):** Worker duradero con reintentos automáticos (máx 3), backoff y endpoint de replay controlado.
- **Trazabilidad y Observabilidad:** Middleware de `x-correlation-id` en cada petición y logging estructurado en JSON con redacción de credenciales y PII.

### Fase 3: Frontend Web Accesible y Banco Interactivo
- **Diseño responsive y accesible (WCAG 2.2):** Funciona desde 320px hasta 1440px, soporte de navegación por teclado y alto contraste.
- **Asistente de Triaje en Vivo:** Árbol de decisión interactivo paso a paso con preguntas guiadas Sí/No.
- **Generador de Bitácoras de Cierre:** Redacción guiada de las 4 secciones obligatorias, visor de acta en texto plano (para ITSM corporativo) y exportación a JSON.
- **Consola de Escalamiento Anti-Rebote:** Validación en tiempo real de al menos 2 evidencias técnicas cuantitativas (ping, ipconfig, tracert).
- **Guía de Comunicación (SKILL-COM-01):** Traductor de jerga técnica para usuarios finales y validación de cierre compartido.

### Fase 4: Calidad, Pruebas Automatizadas y DevOps
- **Pruebas unitarias de dominio sin base de datos:** Ejecución rápida sobre entidades e invariantes de negocio.
- **Pruebas de integración E2E:** Flujo completo de autenticación, creación de incidente, diagnóstico, bitácora y escalamiento.
- **Contenedorización Docker:** `Dockerfile` multi-stage optimizado con Node 24 alpine y `docker-compose.yml` para despliegue con volumen persistente.

---

## 📋 Requisitos Previos

- **Node.js:** Versión 22.5+ o v24+ (incluye módulo nativo `node:sqlite`).
- **NPM:** Versión 10+.

---

## ⚙️ Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Aplicar migraciones y sembrar base de datos inicial (Seed):**
   ```bash
   npm run seed
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

4. **Abrir en el navegador:**
   Visita [http://localhost:3000](http://localhost:3000)

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto utiliza el test runner nativo de Node.js (`node:test` y `node:assert`):

```bash
# Ejecutar toda la suite de pruebas (Unitarias + Integración)
npm test

# Ejecutar únicamente pruebas unitarias de dominio
npm run test:unit

# Ejecutar únicamente pruebas de integración
npm run test:integration
```

---

## 👥 Usuarios y Credenciales Demostrativas

La base de datos inicial incluye los siguientes perfiles (Contraseña universal: `FieldOps2026!`):

| Rol | Correo Electrónico | Nombre | Propósito |
| :--- | :--- | :--- | :--- |
| **Técnico en Campo** | `tecnico1@fieldops.local` | Andrés Morales | Triaje en sitio, ejecución de checklists y actas |
| **HelpDesk L1** | `mesa1@fieldops.local` | Laura Gómez | Recepción y creación de incidentes |
| **Coordinador** | `coordinador@fieldops.local` | Carlos Mendoza | Gestión de incidentes y monitor de DLQ |
| **Administrador** | `admin@fieldops.local` | Administrador General | Acceso total y replay de tareas |

*(En la interfaz web puedes alternar entre ellos con un solo clic en el botón **Cambiar Rol**).*

---

## 🐳 Despliegue con Docker

```bash
# Construir y levantar contenedor
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Detener contenedor
docker compose down
```

---

## 🛡️ Variables de Entorno

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `3000` |
| `DB_PATH` | Ruta del archivo de base de datos SQLite | `./fieldops.sqlite` |
| `JWT_SECRET` | Clave secreta para firma de tokens de sesión | `fieldops-secret-key-2026-production-ready` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | `development` |
