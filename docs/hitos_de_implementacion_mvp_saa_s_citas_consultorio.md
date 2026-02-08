# Hitos de Implementación del MVP

Este documento describe los **hitos del proyecto** para el desarrollo del MVP del SaaS de gestión de citas para profesionales de la salud. Su objetivo es alinear al equipo de desarrollo en **qué se construye, en qué orden y cuándo un hito se considera terminado**.

El enfoque prioriza:
- Velocidad de entrega
- Validación real del producto
- Evitar sobre‑ingeniería
- Uso de Next.js + Supabase (Supabase‑first)

---

## HITO 1 — Autenticación y roles

### Objetivo
Establecer la base de seguridad y control de acceso del sistema.

### Alcance
- Configuración de Supabase Auth
- Registro e inicio de sesión
- Creación de perfil de usuario extendido
- Definición de roles: **profesional** y **paciente**
- Protección de rutas por rol
- Layouts separados por tipo de usuario

### Criterio de finalización
- Un profesional puede registrarse e iniciar sesión
- Un paciente puede registrarse e iniciar sesión
- Cada rol solo puede acceder a su área correspondiente

---

## HITO 2 — Agenda núcleo (disponibilidad y citas)

### Objetivo
Construir el corazón funcional del producto: la agenda.

### Alcance
- Tabla de disponibilidad del profesional
- Tabla de bloqueos de agenda
- Tabla de citas
- Estados de la cita (ej. programada, cancelada)
- Validación de no‑overbooking en backend
- CRUD completo de citas
- Vista básica de calendario (día / semana / mes)
- Configuración de horarios del profesional

### Criterio de finalización
- No se pueden crear citas fuera de disponibilidad
- No se pueden crear dos citas en el mismo horario
- El profesional puede ver y gestionar su agenda real

---

## HITO 3 — Enlace público del profesional

### Objetivo
Permitir que los pacientes agenden citas desde un enlace directo.

### Alcance
- Generación de slug único por profesional
- Ruta pública `/[slug-profesional]`
- Visualización de disponibilidad pública
- Registro de paciente desde el enlace
- Formulario de creación de cita
- Validación de disponibilidad en tiempo real

### Criterio de finalización
- Un paciente externo puede entrar al enlace
- Puede registrarse
- Puede crear una cita válida sin intervención del profesional

---

## HITO 4 — Chat asistido

### Objetivo
Implementar el feature diferenciador del producto.

### Alcance
- Tabla de chats
- Tabla de mensajes
- Tabla de suscripciones
- Verificación de suscripción activa
- Interfaz básica de chat
- Sugerencia de horarios disponibles
- Creación automática de citas desde el chat
- Persistencia del historial de chat

### Criterio de finalización
- El paciente puede agendar una cita usando solo el chat
- El chat crea citas reales en la agenda
- El historial de chat es visible

---

## HITO 5 — Suscripción y control de acceso

### Objetivo
Habilitar la monetización del producto.

### Alcance
- Gestión de estado de suscripción (activo / inactivo)
- Activación manual de suscripción
- Restricción del chat si no hay suscripción activa
- UI clara del estado de suscripción para el profesional
- Validaciones de acceso en frontend y backend

### Criterio de finalización
- Profesional sin suscripción no puede usar el chat
- Profesional con suscripción activa sí puede usarlo

---

## HITO 6 — Notificaciones internas y métricas

### Objetivo
Medir el uso real del MVP y validar el modelo de negocio.

### Alcance
- Tabla de notificaciones internas
- Visualización de notificaciones en el panel
- Registro de eventos clave:
  - Cita creada por formulario
  - Cita creada por chat
  - Activación de suscripción
- Vista básica de métricas internas

### Criterio de finalización
- Se pueden identificar los principales eventos del sistema
- Se puede medir uso del chat vs formulario
- Se puede medir adopción de la suscripción

---

## Regla general para el equipo

- No se inicia un hito sin cerrar el anterior
- Un hito se considera cerrado solo si es **usable por un usuario real**
- La UI no necesita ser perfecta, debe ser funcional
- Cualquier funcionalidad fuera de estos hitos **no pertenece al MVP**

Este documento es la referencia principal para la implementación del MVP.

