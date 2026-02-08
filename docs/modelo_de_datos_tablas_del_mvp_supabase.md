# Modelo de datos del MVP

Este documento describe **todas las tablas del MVP**, sus campos, tipos de datos y consideraciones técnicas. Todas las tablas incluyen **soft delete** mediante el campo `deleted_at`.

---

## 1. profesionales

Representa al profesional de la salud.

- `id` UUID (PK)
- `user_id` UUID (FK → auth.users.id)
- `nombre` TEXT
- `especialidad` TEXT
- `slug` TEXT (único, usado en el enlace público)
- `telefono` TEXT (opcional)
- `activo` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE (soft delete)

---

## 2. pacientes

Representa a los pacientes registrados.

- `id` UUID (PK)
- `user_id` UUID (FK → auth.users.id)
- `nombre` TEXT
- `telefono` TEXT (opcional)
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 3. disponibilidad

Configuración base de horarios del profesional.

- `id` UUID (PK)
- `profesional_id` UUID (FK → profesionales.id)
- `dia_semana` SMALLINT (0–6)
- `hora_inicio` TIME
- `hora_fin` TIME
- `duracion_cita_min` INTEGER
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 4. bloqueos_agenda

Días u horarios bloqueados manualmente.

- `id` UUID (PK)
- `profesional_id` UUID (FK → profesionales.id)
- `fecha_inicio` TIMESTAMP WITH TIME ZONE
- `fecha_fin` TIMESTAMP WITH TIME ZONE
- `motivo` TEXT (opcional)
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 5. citas

Entidad central del sistema.

- `id` UUID (PK)
- `profesional_id` UUID (FK → profesionales.id)
- `paciente_id` UUID (FK → pacientes.id)
- `inicio` TIMESTAMP WITH TIME ZONE
- `fin` TIMESTAMP WITH TIME ZONE
- `estado` TEXT (programada | cancelada | completada)
- `origen` TEXT (formulario | chat)
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 6. chats

Conversaciones entre paciente y profesional.

- `id` UUID (PK)
- `profesional_id` UUID (FK → profesionales.id)
- `paciente_id` UUID (FK → pacientes.id)
- `activo` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 7. mensajes_chat

Mensajes individuales del chat.

- `id` UUID (PK)
- `chat_id` UUID (FK → chats.id)
- `emisor` TEXT (paciente | sistema | profesional)
- `mensaje` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 8. suscripciones

Control del estado de pago del profesional.

- `id` UUID (PK)
- `profesional_id` UUID (FK → profesionales.id)
- `estado` TEXT (activa | inactiva)
- `plan` TEXT (mensual | anual)
- `fecha_inicio` DATE
- `fecha_fin` DATE
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## 9. notificaciones

Notificaciones internas del sistema.

- `id` UUID (PK)
- `user_id` UUID (FK → auth.users.id)
- `tipo` TEXT
- `contenido` TEXT
- `leida` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP WITH TIME ZONE
- `deleted_at` TIMESTAMP WITH TIME ZONE

---

## Notas generales

- Todas las consultas deben filtrar `deleted_at IS NULL`.
- El soft delete permite:
  - Recuperación de datos
  - Auditoría básica
  - Futuro compliance
- La seguridad se refuerza con RLS por rol y relación.

