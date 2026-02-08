# Hito 4 — Chat Asistido

## Objetivo del hito

Implementar el **chat asistido para la gestión de citas**, que permite a los pacientes agendar sin usar formularios, a través de una conversación guiada basada en la disponibilidad real del profesional.

Este hito introduce el **principal diferenciador del producto** y la funcionalidad premium que justifica la suscripción.

---

## Tareas del hito

- Crear tabla de chats
- Crear tabla de mensajes
- Relacionar chats entre paciente y profesional
- Persistir historial completo de mensajes
- Verificar estado de suscripción activa del profesional
- Bloquear acceso al chat si no hay suscripción
- Implementar interfaz básica de chat
- Implementar flujo conversacional guiado para agendar citas
- Consultar disponibilidad real desde la agenda
- Sugerir horarios disponibles dentro del chat
- Crear cita automáticamente desde el chat
- Manejar confirmaciones y errores dentro del chat

---

## Requerimientos técnicos

- Tablas de chats y mensajes con relación a profesional y paciente
- Tabla de suscripciones como fuente de verdad para el acceso al chat
- Políticas RLS que permitan:
  - Al profesional ver solo sus chats
  - Al paciente ver solo sus propios chats
- Validación de suscripción tanto en frontend como en backend
- Uso del cliente oficial de Supabase para persistencia en tiempo real
- Validación de disponibilidad al momento de crear la cita
- Separación clara entre lógica de chat y lógica de agenda

---

## Requerimientos funcionales

- El chat solo debe estar disponible para profesionales con suscripción activa
- El paciente puede iniciar una conversación desde el enlace público
- El chat debe guiar al paciente paso a paso para agendar
- El sistema solo sugiere horarios realmente disponibles
- El paciente puede confirmar un horario dentro del chat
- Al confirmar, la cita se crea automáticamente en la agenda
- El historial del chat queda disponible para profesional y paciente

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- El chat está completamente bloqueado sin suscripción activa
- Un paciente puede agendar una cita usando solo el chat
- Las citas creadas por chat cumplen todas las reglas de agenda
- El historial de chat se guarda y se muestra correctamente
- El profesional puede consultar conversaciones pasadas
- No es posible usar el chat para fines distintos a gestión de citas

---

## Notas importantes para el equipo

- El chat **no es un asistente médico**, solo gestiona citas
- No se debe permitir contenido libre fuera del flujo definido
- La UI puede ser simple; la prioridad es el flujo correcto
- Este hito depende completamente del Hito 2 y Hito 3

Este hito valida el valor diferencial y la disposición de pago del producto.

