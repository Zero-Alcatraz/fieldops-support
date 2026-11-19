# Especificación técnica: FieldOps & Support

> Proveer un banco de skills modulares que estandarice el triaje de fallas técnicas de red y dispositivos, la redacción de bitácoras operativas y el escalamiento de incidentes hacia niveles superiores. El propósito es reducir los tiempos de diagnóstico y eliminar la ambigüedad en los reportes de campo y mesa de ayuda.

**Alcance**

Módulos de skills para listas de chequeo de diagnóstico paso a paso (conectividad, latencia, pérdida de paquetes, configuración local), generación estructurada de actas/bitácoras de cierre de visita y plantillas de escalamiento técnico con evidencia mínima requerida.

Guías rápidas de comunicación clara con el usuario final durante la atención.

No es un sistema de tickets (ITSM) ni reemplaza plataformas corporativas de gestión de órdenes de trabajo.

No ejecuta comandos remotos ni accede directamente a equipos de red o servidores.

No cubre mantenimiento eléctrico de alta tensión ni diseño de infraestructura de red troncal.

**Contexto general**

Audiencia: Técnicos de soporte en campo, agentes de mesa de ayuda (help desk nivel 1 y 2) y coordinadores de operaciones.

Stack y formato: Skills documentadas en Markdown estructurado con árboles de decisión, plantillas de reporte en formato JSON/texto plano y comandos de referencia de diagnóstico de red (ping, tracert, nslookup, revisión de logs).

Convenciones: Clasificación estándar de severidad (P1–P4), estructura obligatoria de reporte (Síntoma – Causa raíz probable – Pruebas realizadas – Acción aplicada) y nomenclatura uniforme de incidentes.

Restricciones: Cada skill debe ser independiente, concisa y aplicable sin conexión a bases de datos externas; priorizar pasos verificables antes de sugerir cambios de hardware o escalamientos.

Idioma de salida: Español técnico claro, conservando en inglés los términos estándar de redes y protocolos (ej. timeout, packet loss, gateway, DNS).

_Generado con SkillNeitor 1.2.0 · 2026-11-19 · 23 ítems · 14 categorías_

## Índice

1. [Producto y descubrimiento](#producto-y-descubrimiento)
2. [UX/UI y accesibilidad](#ux-ui-y-accesibilidad)
3. [Arquitectura y patrones](#arquitectura-y-patrones)
4. [Frontend web](#frontend-web)
5. [Backend y APIs](#backend-y-apis)
6. [Datos y persistencia](#datos-y-persistencia)
7. [Seguridad y privacidad](#seguridad-y-privacidad)
8. [DevOps y observabilidad](#devops-y-observabilidad)
9. [Calidad y pruebas](#calidad-y-pruebas)
10. [Rendimiento y escalabilidad](#rendimiento-y-escalabilidad)
11. [Documentación y mantenimiento](#documentacion-y-mantenimiento)
12. [Móvil y escritorio](#movil-y-escritorio)
13. [Integraciones y tiempo real](#integraciones-y-tiempo-real)
14. [Analítica y negocio](#analitica-y-negocio)

---

# Producto y descubrimiento

_Problema, alcance, usuarios, métricas y priorización._

## Definición del problema y propuesta de valor

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Producto

### Cómo usarlo

Esta skill de producto te ayuda a antes de elegir tecnología, dejar explícito qué problema resuelve el producto, para quién y por qué merece existir. Úsala como guía: Describir el problema en una frase verificable, sin nombrar la solución. Identificar usuario primario, usuario secundario y contexto de uso. Comprueba el resultado con: Existe un documento de una página con problema, usuarios y valor.

### Propósito

Antes de elegir tecnología, dejar explícito qué problema resuelve el producto, para quién y por qué merece existir.

### Lineamientos

- Describir el problema en una frase verificable, sin nombrar la solución.
- Identificar usuario primario, usuario secundario y contexto de uso.
- Documentar alternativas actuales y el coste de no resolverlo.
- Definir una propuesta de valor que pueda contrastarse con evidencia.

### Criterios de aceptación

- [ ] Existe un documento de una página con problema, usuarios y valor.
- [ ] El equipo puede explicar el problema sin mencionar la implementación.
- [ ] Hay al menos una hipótesis falsable y una métrica asociada.

### Antipatrones

- Empezar por el stack o por una lista de pantallas.
- Confundir funcionalidades con problemas de usuario.

### Referencias

- Working Backwards (Amazon)
- Continuous Discovery Habits

## Gestión de requisitos y alcance

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Producto

### Cómo usarlo

Esta skill de producto te ayuda a gestionar cambios de alcance con visibilidad de impacto, decisión explícita y trazabilidad. Úsala como guía: Mantener un registro de requisitos con estado y dueño. Valorar cada cambio por impacto en tiempo, riesgo y calidad. Comprueba el resultado con: Todo cambio relevante tiene decisión registrada.

### Propósito

Gestionar cambios de alcance con visibilidad de impacto, decisión explícita y trazabilidad.

### Lineamientos

- Mantener un registro de requisitos con estado y dueño.
- Valorar cada cambio por impacto en tiempo, riesgo y calidad.
- Separar alcance comprometido de ideas futuras.
- Comunicar decisiones y congelaciones de alcance.

### Criterios de aceptación

- [ ] Todo cambio relevante tiene decisión registrada.
- [ ] El alcance vigente es visible para todo el equipo.
- [ ] Los recortes no se hacen silenciosamente.

### Antipatrones

- Aceptar cambios sin ajustar tiempo o alcance.
- Documentar requisitos en conversaciones privadas.

### Referencias

- Scope creep management
- PRINCE2 principles

# UX/UI y accesibilidad

_Experiencia, sistema de diseño, responsive y WCAG._

## Arquitectura de información y navegación

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** UX/UI, Accesibilidad

### Cómo usarlo

Esta skill de UX/UI te ayuda a organizar contenidos y acciones según las tareas del usuario, con rutas predecibles y poca carga cognitiva. Úsala como guía: Agrupar por tareas, no por organigrama interno. Limitar profundidad de navegación y mantener migas cuando aporten. Comprueba el resultado con: El usuario encuentra las tareas principales en dos pasos o menos.

### Propósito

Organizar contenidos y acciones según las tareas del usuario, con rutas predecibles y poca carga cognitiva.

### Lineamientos

- Agrupar por tareas, no por organigrama interno.
- Limitar profundidad de navegación y mantener migas cuando aporten.
- Hacer visible el estado activo y la ubicación actual.
- Validar etiquetas con pruebas de árbol o card sorting.

### Criterios de aceptación

- [ ] El usuario encuentra las tareas principales en dos pasos o menos.
- [ ] La navegación funciona con historial y enlaces profundos.
- [ ] Las etiquetas son comprensibles sin jerga interna.

### Antipatrones

- Menús gigantes sin jerarquía.
- Cambiar la ubicación de acciones entre pantallas.

### Referencias

- Information Architecture (Rosenfeld)
- Nielsen Norman Group

## Diseño responsive y adaptativo

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** UX/UI, Accesibilidad

### Cómo usarlo

Esta skill de UX/UI te ayuda a adaptar la interfaz a tamaños y capacidades reales sin degradar jerarquía ni accesibilidad. Úsala como guía: Diseñar por contenido y tareas, no por dispositivos concretos. Definir breakpoints y comportamientos esperados. Comprueba el resultado con: La app es usable a 320 px, 768 px, 1024 px y zoom 200 %.

### Propósito

Adaptar la interfaz a tamaños y capacidades reales sin degradar jerarquía ni accesibilidad.

### Lineamientos

- Diseñar por contenido y tareas, no por dispositivos concretos.
- Definir breakpoints y comportamientos esperados.
- Evitar scroll horizontal no intencional y tablas inutilizables.
- Probar zoom, orientación y tamaños intermedios.

### Criterios de aceptación

- [ ] La app es usable a 320 px, 768 px, 1024 px y zoom 200 %.
- [ ] Las tablas ofrecen patrón alternativo en móvil.
- [ ] La navegación principal sigue disponible.

### Antipatrones

- Ocultar funciones esenciales en móvil.
- Diseñar solo para el portátil del desarrollador.

### Referencias

- Responsive Web Design
- Container queries

# Arquitectura y patrones

_Estilos arquitectónicos, límites, APIs y decisiones estructurales._

## Arquitectura hexagonal

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Arquitectura, APIs

### Cómo usarlo

Esta skill de arquitectura te ayuda a aislar el dominio de frameworks y detalles mediante puertos y adaptadores intercambiables. Úsala como guía: El dominio no importa framework, base de datos ni HTTP. Definir puertos de entrada y salida explícitos. Comprueba el resultado con: Las pruebas de dominio corren sin base de datos.

### Propósito

Aislar el dominio de frameworks y detalles mediante puertos y adaptadores intercambiables.

### Lineamientos

- El dominio no importa framework, base de datos ni HTTP.
- Definir puertos de entrada y salida explícitos.
- Implementar adaptadores para UI, persistencia y terceros.
- Probar el dominio sin infraestructura.

### Criterios de aceptación

- [ ] Las pruebas de dominio corren sin base de datos.
- [ ] Cambiar un adaptador no requiere tocar reglas de negocio.
- [ ] Los contratos de puerto están documentados.

### Antipatrones

- Anotar el dominio con detalles del framework.
- Llamar servicios externos desde entidades.

### Referencias

- Alistair Cockburn: Hexagonal Architecture

# Frontend web

_Rendering, estado, componentes, PWA e internacionalización._

## Componentes semánticos y accesibles

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Web, JavaScript

### Cómo usarlo

Esta skill de frontend te ayuda a encapsular ui con html semántico, teclado y atributos accesibles desde el propio componente. Úsala como guía: Preferir elementos nativos antes que roles ARIA. Gestionar foco, estados y anuncios en componentes interactivos. Comprueba el resultado con: No hay divs con onClick sin alternativa de teclado.

### Propósito

Encapsular UI con HTML semántico, teclado y atributos accesibles desde el propio componente.

### Lineamientos

- Preferir elementos nativos antes que roles ARIA.
- Gestionar foco, estados y anuncios en componentes interactivos.
- Exponer props claras y evitar efectos ocultos.
- Probar cada componente con teclado y lector.

### Criterios de aceptación

- [ ] No hay divs con onClick sin alternativa de teclado.
- [ ] Los componentes tienen estados hover, focus, disabled y error.
- [ ] Los tests cubren navegación por teclado.

### Antipatrones

- Reinventar select o modal sin accesibilidad.
- Props booleanas contradictorias.

### Referencias

- WAI-ARIA Authoring Practices
- Inclusive Components

## Formularios y validación frontend

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Web, JavaScript

### Cómo usarlo

Esta skill de frontend te ayuda a implementar formularios con validación consistente, accesible y alineada con el servidor. Úsala como guía: Esquema de validación compartido o replicado explícitamente. Errores por campo y error global. Comprueba el resultado con: El servidor vuelve a validar todo.

### Propósito

Implementar formularios con validación consistente, accesible y alineada con el servidor.

### Lineamientos

- Esquema de validación compartido o replicado explícitamente.
- Errores por campo y error global.
- Estados submitting, success y error.
- Evitar doble envío e hidratar valores iniciales.

### Criterios de aceptación

- [ ] El servidor vuelve a validar todo.
- [ ] Los errores son accesibles y enfocables.
- [ ] El formulario no pierde datos al fallar.

### Antipatrones

- Confiar solo en validación cliente.
- Deshabilitar el botón sin explicar por qué.

### Referencias

- HTML constraint validation
- Zod

# Backend y APIs

_Contratos, autenticación, idempotencia, colas y errores._

## Autenticación y autorización

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Backend, APIs

### Cómo usarlo

Esta skill de backend te ayuda a separar identidad de permisos y aplicar autorización en servidor para cada recurso. Úsala como guía: Sesiones seguras, rotación y expiración. RBAC/ABAC con comprobaciones en servidor. Comprueba el resultado con: Cada endpoint valida autenticación y autorización.

### Propósito

Separar identidad de permisos y aplicar autorización en servidor para cada recurso.

### Lineamientos

- Sesiones seguras, rotación y expiración.
- RBAC/ABAC con comprobaciones en servidor.
- No confiar en roles enviados por el cliente.
- Auditar accesos sensibles y revocaciones.

### Criterios de aceptación

- [ ] Cada endpoint valida autenticación y autorización.
- [ ] Hay pruebas de acceso denegado por rol.
- [ ] Los tokens no se guardan en lugares inseguros.

### Antipatrones

- Ocultar botones como control de acceso.
- IDs predecibles sin autorización por recurso.

### Referencias

- OWASP Authentication Cheat Sheet
- OAuth 2.1

## Colas y procesamiento asíncrono

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Backend, APIs

### Cómo usarlo

Esta skill de backend te ayuda a mover trabajo lento o frágil a workers con reintentos, visibilidad y dead-letter queue. Úsala como guía: Definir contratos de mensaje y versionado. Idempotencia en cada consumidor. Comprueba el resultado con: Un mensaje fallido no se pierde silenciosamente.

### Propósito

Mover trabajo lento o frágil a workers con reintentos, visibilidad y dead-letter queue.

### Lineamientos

- Definir contratos de mensaje y versionado.
- Idempotencia en cada consumidor.
- Backoff, límite de reintentos y DLQ.
- Métricas de profundidad y antigüedad de cola.

### Criterios de aceptación

- [ ] Un mensaje fallido no se pierde silenciosamente.
- [ ] Los workers son escalables y observables.
- [ ] Existe replay controlado.

### Antipatrones

- Procesar pagos dentro de la petición HTTP.
- Colas sin DLQ ni alertas.

### Referencias

- Enterprise Integration Patterns
- BullMQ

## Errores, logging y trazabilidad

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Backend, APIs

### Cómo usarlo

Esta skill de backend te ayuda a producir errores accionables y correlacionar logs, métricas y trazas sin filtrar datos sensibles. Úsala como guía: Códigos de error estables y mensajes para usuario. Correlation ID por petición y propagación entre servicios. Comprueba el resultado con: Cada error tiene traza y contexto.

### Propósito

Producir errores accionables y correlacionar logs, métricas y trazas sin filtrar datos sensibles.

### Lineamientos

- Códigos de error estables y mensajes para usuario.
- Correlation ID por petición y propagación entre servicios.
- Logs estructurados con niveles y sampling.
- No registrar secretos ni datos personales.

### Criterios de aceptación

- [ ] Cada error tiene traza y contexto.
- [ ] Los logs permiten reconstruir una petición.
- [ ] Los datos sensibles se redactan.

### Antipatrones

- Loggear objetos completos con tokens.
- Stack traces al usuario final.

### Referencias

- OpenTelemetry
- Google SRE Book

# Datos y persistencia

_Modelado, migraciones, transacciones, búsqueda y backups._

## Migraciones de base de datos

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** SQL, SQLite

### Cómo usarlo

Esta skill de datos te ayuda a evolucionar el esquema con migraciones versionadas, reversibles cuando sea posible y probadas. Úsala como guía: Cada migración tiene versión, autor y propósito. Probar en copia de datos reales anonimizados. Comprueba el resultado con: Una base vacía y una existente migran al mismo esquema.

### Propósito

Evolucionar el esquema con migraciones versionadas, reversibles cuando sea posible y probadas.

### Lineamientos

- Cada migración tiene versión, autor y propósito.
- Probar en copia de datos reales anonimizados.
- Separar cambios compatibles de ruptura.
- Planificar rollback o migración compensatoria.

### Criterios de aceptación

- [ ] Una base vacía y una existente migran al mismo esquema.
- [ ] El tiempo de migración está medido.
- [ ] La app tolera versiones adyacentes durante despliegue.

### Antipatrones

- Editar migraciones ya aplicadas.
- Migraciones sin backup.

### Referencias

- Zero-downtime migrations
- Flyway

## Modelo relacional y normalización

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** SQL, SQLite

### Cómo usarlo

Esta skill de datos te ayuda a modelar entidades, relaciones y restricciones que representen el dominio y protejan la integridad. Úsala como guía: Claves primarias estables y foráneas explícitas. Normalizar hasta que duela; desnormalizar con motivo. Comprueba el resultado con: La base impide estados inválidos.

### Propósito

Modelar entidades, relaciones y restricciones que representen el dominio y protejan la integridad.

### Lineamientos

- Claves primarias estables y foráneas explícitas.
- Normalizar hasta que duela; desnormalizar con motivo.
- Restricciones NOT NULL, UNIQUE y CHECK.
- Documentar el modelo y sus invariantes.

### Criterios de aceptación

- [ ] La base impide estados inválidos.
- [ ] Las consultas críticas tienen índice.
- [ ] El modelo se entiende sin preguntar al autor.

### Antipatrones

- Guardar arrays en columnas de texto sin necesidad.
- Sin claves foráneas por pereza.

### Ejemplo

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### Referencias

- SQL Antipatterns
- Use The Index, Luke

## Privacidad y retención de datos

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** SQL, SQLite

### Cómo usarlo

Esta skill de datos te ayuda a minimizar datos, definir retención y permitir exportación y borrado con trazabilidad. Úsala como guía: Recoger solo datos necesarios y con base legal. Definir plazos de retención por tipo. Comprueba el resultado con: Cada campo personal tiene propósito y retención.

### Propósito

Minimizar datos, definir retención y permitir exportación y borrado con trazabilidad.

### Lineamientos

- Recoger solo datos necesarios y con base legal.
- Definir plazos de retención por tipo.
- Implementar exportación y borrado de usuario.
- Anonimizar datos en entornos no productivos.

### Criterios de aceptación

- [ ] Cada campo personal tiene propósito y retención.
- [ ] El borrado se propaga a backups según política.
- [ ] Los logs no conservan PII innecesaria.

### Antipatrones

- Retener todo para siempre.
- Usar datos reales en desarrollo.

### Referencias

- GDPR
- NIST Privacy Framework

# Seguridad y privacidad

_Amenazas, secretos, saneamiento, cifrado y auditoría._

## OWASP ASVS y Top 10

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Seguridad

### Cómo usarlo

Esta skill de seguridad te ayuda a usar estándares verificables para autenticación, sesión, validación, criptografía y errores. Úsala como guía: Elegir nivel ASVS adecuado al riesgo. Mapear controles a pruebas concretas. Comprueba el resultado con: Los controles aplicables están implementados.

### Propósito

Usar estándares verificables para autenticación, sesión, validación, criptografía y errores.

### Lineamientos

- Elegir nivel ASVS adecuado al riesgo.
- Mapear controles a pruebas concretas.
- Revisar Top 10 en cada release.
- Documentar excepciones y riesgo aceptado.

### Criterios de aceptación

- [ ] Los controles aplicables están implementados.
- [ ] Hay pruebas automatizadas de los críticos.
- [ ] Las excepciones tienen dueño y fecha.

### Antipatrones

- Cumplimiento de papel sin pruebas.
- Ignorar errores de configuración.

### Referencias

- OWASP ASVS
- OWASP Top 10

# DevOps y observabilidad

_CI/CD, contenedores, entornos, telemetría y rollback._

## CI/CD y calidad de pipeline

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Docker, CI/CD

### Cómo usarlo

Esta skill de DevOps te ayuda a automatizar build, pruebas, análisis y despliegue con feedback rápido y artefactos reproducibles. Úsala como guía: Pipeline reproducible y versionado. Etapas rápidas primero y fallos visibles. Comprueba el resultado con: Un commit produce un artefacto identificable.

### Propósito

Automatizar build, pruebas, análisis y despliegue con feedback rápido y artefactos reproducibles.

### Lineamientos

- Pipeline reproducible y versionado.
- Etapas rápidas primero y fallos visibles.
- Artefacto inmutable por commit.
- Despliegue automatizado con aprobaciones donde haga falta.

### Criterios de aceptación

- [ ] Un commit produce un artefacto identificable.
- [ ] Las pruebas bloquean merges roto.
- [ ] El despliegue se puede repetir.

### Antipatrones

- Builds manuales desde la máquina local.
- Pipeline sin cache ni paralelismo.

### Referencias

- Continuous Delivery
- DORA metrics

# Calidad y pruebas

_Estrategia de pruebas, contratos, E2E, carga y accesibilidad._

## Pruebas de accesibilidad

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Testing

### Cómo usarlo

Esta skill de calidad te ayuda a combinar análisis automático con pruebas manuales de teclado y lector de pantalla. Úsala como guía: axe o equivalente en CI. Recorrido completo con teclado. Comprueba el resultado con: No hay violaciones críticas de axe.

### Propósito

Combinar análisis automático con pruebas manuales de teclado y lector de pantalla.

### Lineamientos

- axe o equivalente en CI.
- Recorrido completo con teclado.
- Pruebas con zoom y modo de contraste.
- Revisión de formularios y modales.

### Criterios de aceptación

- [ ] No hay violaciones críticas de axe.
- [ ] El foco es visible y lógico.
- [ ] Los errores se anuncian.

### Antipatrones

- Confiar solo en axe.
- Probar accesibilidad al final.

### Referencias

- axe-core
- WCAG 2.2

## Pruebas de carga y rendimiento

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Testing

### Cómo usarlo

Esta skill de calidad te ayuda a medir comportamiento bajo carga realista y definir umbrales de aceptación. Úsala como guía: Modelar usuarios y flujos reales. Definir p95/p99 y tasa de error. Comprueba el resultado con: Los umbrales están definidos y se cumplen.

### Propósito

Medir comportamiento bajo carga realista y definir umbrales de aceptación.

### Lineamientos

- Modelar usuarios y flujos reales.
- Definir p95/p99 y tasa de error.
- Probar rampa, pico y recuperación.
- Correlacionar con métricas del sistema.

### Criterios de aceptación

- [ ] Los umbrales están definidos y se cumplen.
- [ ] Se conoce el punto de saturación.
- [ ] Hay plan de escalado.

### Antipatrones

- Probar solo un endpoint trivial.
- Ignorar errores bajo carga.

### Referencias

- k6
- Locust

# Rendimiento y escalabilidad

_Presupuestos, consultas, caché, CDN y escalado._

## Optimización de consultas y N+1

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Performance, SQL

### Cómo usarlo

Esta skill de rendimiento te ayuda a detectar consultas lentas y patrones n+1 con planes de ejecución e índices correctos. Úsala como guía: Revisar EXPLAIN de consultas críticas. Eliminar N+1 con joins o batch loading. Comprueba el resultado con: No hay N+1 en rutas críticas.

### Propósito

Detectar consultas lentas y patrones N+1 con planes de ejecución e índices correctos.

### Lineamientos

- Revisar EXPLAIN de consultas críticas.
- Eliminar N+1 con joins o batch loading.
- Índices compuestos según filtros y orden.
- Medir antes y después.

### Criterios de aceptación

- [ ] No hay N+1 en rutas críticas.
- [ ] Las consultas lentas tienen índice.
- [ ] El plan no hace full scan en tablas grandes.

### Antipatrones

- Añadir índices a todo.
- Optimizar sin medir.

### Referencias

- Use The Index, Luke
- PostgreSQL EXPLAIN

# Documentación y mantenimiento

_README, ADRs, API, runbooks y manual de usuario._

## README y guía de inicio

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Markdown

### Cómo usarlo

Esta skill de documentación te ayuda a permitir que una persona nueva entienda, instale y ejecute el proyecto sin ayuda informal. Úsala como guía: Qué es, para quién y qué resuelve. Requisitos, instalación y comandos básicos. Comprueba el resultado con: Un nuevo desarrollador arranca siguiendo el README.

### Propósito

Permitir que una persona nueva entienda, instale y ejecute el proyecto sin ayuda informal.

### Lineamientos

- Qué es, para quién y qué resuelve.
- Requisitos, instalación y comandos básicos.
- Configuración, tests y troubleshooting.
- Enlaces a documentación profunda.

### Criterios de aceptación

- [ ] Un nuevo desarrollador arranca siguiendo el README.
- [ ] Los comandos están probados.
- [ ] Las variables de entorno están documentadas.

### Antipatrones

- README desactualizado.
- Suposiciones de conocimiento interno.

### Referencias

- Make a README
- Diátaxis

# Móvil y escritorio

_Apps multiplataforma, shells de escritorio, updates y sync._

## App móvil multiplataforma

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Mobile, React Native, Flutter

### Cómo usarlo

Esta skill de móvil y escritorio te ayuda a elegir y estructurar una app móvil con rendimiento, permisos y experiencia nativa suficiente. Úsala como guía: Evaluar nativo vs multiplataforma por requisitos. Navegación, estado y almacenamiento local. Comprueba el resultado con: La app funciona en versiones mínimas soportadas.

### Propósito

Elegir y estructurar una app móvil con rendimiento, permisos y experiencia nativa suficiente.

### Lineamientos

- Evaluar nativo vs multiplataforma por requisitos.
- Navegación, estado y almacenamiento local.
- Permisos, notificaciones y ciclo de vida.
- Distribución en stores y versionado.

### Criterios de aceptación

- [ ] La app funciona en versiones mínimas soportadas.
- [ ] Los permisos se piden con contexto.
- [ ] El tamaño y arranque están medidos.

### Antipatrones

- Webview disfrazada de app nativa.
- Permisos al primer arranque sin explicación.

### Referencias

- React Native docs
- Flutter architecture

# Integraciones y tiempo real

_WebSockets, SSE, sincronización y terceros._

## Sincronización y conflictos

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Realtime

### Cómo usarlo

Esta skill de tiempo real te ayuda a definir cómo convergen ediciones concurrentes y cómo se informa al usuario. Úsala como guía: Elegir last-write-wins, versiones o CRDT. Guardar autor y timestamp/vector. Comprueba el resultado con: Dos ediciones simultáneas no se pierden silenciosamente.

### Propósito

Definir cómo convergen ediciones concurrentes y cómo se informa al usuario.

### Lineamientos

- Elegir last-write-wins, versiones o CRDT.
- Guardar autor y timestamp/vector.
- Mostrar conflictos y permitir resolver.
- Probar escenarios de concurrencia.

### Criterios de aceptación

- [ ] Dos ediciones simultáneas no se pierden silenciosamente.
- [ ] El usuario puede revisar el conflicto.
- [ ] La convergencia está probada.

### Antipatrones

- Last-write-wins sin aviso.
- Mezclar campos de distintos autores.

### Referencias

- CRDT primer
- Operational transformation

# Analítica y negocio

_Eventos, facturación, experimentación, soporte y legal._

## Legal, términos y licencias

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Analytics

### Cómo usarlo

Esta skill de negocio te ayuda a definir términos, privacidad y licencias de dependencias coherentes con el producto. Úsala como guía: Términos y privacidad versionados. Licencias de terceros y atribuciones. Comprueba el resultado con: Las licencias se revisan en CI.

### Propósito

Definir términos, privacidad y licencias de dependencias coherentes con el producto.

### Lineamientos

- Términos y privacidad versionados.
- Licencias de terceros y atribuciones.
- Límites de responsabilidad y uso aceptable.
- Consentimientos y cookies cuando apliquen.

### Criterios de aceptación

- [ ] Las licencias se revisan en CI.
- [ ] La política coincide con la práctica.
- [ ] Los cambios legales se comunican.

### Antipatrones

- Copiar términos de otra empresa.
- Ignorar licencias copyleft.

### Referencias

- SPDX
- Open Source Licenses

## Soporte y feedback

**Prioridad:** should · **Estado:** aprobado · **Tecnologías:** Analytics

### Cómo usarlo

Esta skill de negocio te ayuda a cerrar el ciclo entre incidencias de usuario y producto con priorización visible. Úsala como guía: Canal único y categorías. Contexto técnico adjunto con consentimiento. Comprueba el resultado con: Cada ticket tiene estado y dueño.

### Propósito

Cerrar el ciclo entre incidencias de usuario y producto con priorización visible.

### Lineamientos

- Canal único y categorías.
- Contexto técnico adjunto con consentimiento.
- SLA y escalado.
- Feedback convertido en decisiones.

### Criterios de aceptación

- [ ] Cada ticket tiene estado y dueño.
- [ ] Los bugs recurrentes se agrupan.
- [ ] El usuario recibe respuesta.

### Antipatrones

- Feedback en redes sin registro.
- Cerrar tickets sin solución.

### Referencias

- ITIL basics
- Support-driven growth
