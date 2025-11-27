# Docker e‑commerce – Reporte de Desarrollo

## Resumen

- Arquitectura de microservicios con Gateway, `users-service`, `tasks-service`, `notifications-service`.
- Cache con Redis (TTL 60s) y patrón Failover (Cache‑Aside con protección).
- Mensajería asíncrona con RabbitMQ (TopicExchange) y MailHog para correo.
- Observabilidad: `Server-Timing` en respuestas, Actuator + Prometheus + Grafana.
- Debug Mode visual en React: barra tipo DevTools que muestra origen, caché y latencia.
- Circuit Breaker con fallback amigable en Gateway.

## Servicios

- Gateway
  - Proxy HTTP, filtros y fallback 503 controlado.
  - Exposición de métricas para Prometheus.

- Users Service
  - CRUD de usuarios en MongoDB.
  - Cache Redis con TTL `60s` y Failover a DB si Redis cae.
  - Publica evento `user.created` a `tasks-exchange` (RabbitMQ).
  - Headers: `X-Source-Service`, `X-Data-Source`, `X-System-Health`, `Server-Timing`.

- Tasks Service
  - CRUD de tareas en DB.
  - Publica `task.created` y `task.completed` a `tasks-exchange`.
  - Headers con `Server-Timing` y `X-Source-Service`.

- Notifications Service
  - `@RabbitListener` suscripto a `task.created`, `task.completed`, `user.created`.
  - Consulta `users-service` y envía correo vía SMTP a MailHog.

## Mensajería (RabbitMQ)

- Exchange: `tasks-exchange` (topic).
- Queue: `notifications.tasks` con bindings:
  - `task.created`
  - `task.completed`
  - `user.created`

## Observabilidad

- `Server-Timing`: mide la latencia total de cada endpoint.
- Prometheus: scrape a Gateway y servicios.
- Grafana: dashboards para métricas en demo.

## Frontend (React)

- Design System: Slate/Zinc, Inter, espaciado generoso.
- Layout persistente con Sidebar (Usuarios, Tareas, MailHog, Grafana) y barra de arquitectura fija inferior.
- ArchitectureStatus.jsx
  - Muestra `X-Data-Source` (Redis/DB), `X-System-Health` (healthy/degraded), `Server-Timing` (ms).
  - Colores semánticos: verde (cache), azul (DB), ámbar (degradado), rojo (error).
- Optimistic UI
  - Toast educativo al crear tareas: “evento asíncrono a RabbitMQ”.
  - Badge en Usuarios/Tareas indicando fuente de datos.

## Failover Redis → DB

- Patrón Cache‑Aside manual:
  - Lectura protegida con `try/catch` desde caché.
  - Si falla o no existe, consulta DB y re‑intenta escritura en caché si no está degradado.
  - Señaliza salud con `X-System-Health: degraded`.

## Circuit Breaker y Fallback

- Gateway retorna JSON amistoso `503 Usuarios no disponibles` cuando `users-service` está caído.
- Demostración guiada para resiliencia.

## Guion de Demo (≈3 minutos)

1) Rendimiento y Caché
   - Usuarios: primera carga “MONGODB” y latencia real.
   - Segunda carga (<60s): “REDIS CACHE” y latencia baja.

2) Desacoplamiento y Eventos
   - Crear tarea: aparece toast “RabbitMQ…”.
   - Ruta `/monitor`: MailHog muestra correo; Grafana visible.

3) Resiliencia
   - Apagar `users-service` o Redis: barra muestra “FAILOVER (Redis Down)” y la app sigue respondiendo desde DB.

## Cómo Ejecutar

- Requisitos: Docker Desktop, Node 18+, Java 17+, Maven.
- Backend y mensajería (ejemplo):
  - `docker compose up -d rabbitmq mailhog` (más servicios según configuración).
  - Ejecutar servicios Spring Boot o empaquetar con Maven.
- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev` → `http://localhost:5173/`

## Validación

- Tests frontend con Vitest + happy‑dom: 3 pruebas en verde.
- Visualización de métricas en Grafana/Prometheus.

## Endpoints Clave

- `GET /users` → headers de origen/latencia/salud.
- `POST /users` → publica `user.created`.
- `GET /tasks` → `Server-Timing` y fuente.
- `POST /tasks` → publica `task.created`.
- `PATCH /tasks/{id}` → publica `task.completed`.

## Notas

- En demo, usar `/monitor` para MailHog y Grafana.
- La barra de arquitectura sirve de “devtools visual”: confirma origen y latencia sin abrir código.
