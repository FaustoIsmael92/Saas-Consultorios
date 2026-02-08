# Hito 2 — Agenda Núcleo (Disponibilidad y Citas)

## Objetivo del hito

Construir el núcleo funcional del producto: la agenda. Este hito permite a los profesionales definir su disponibilidad y gestionar citas reales sin errores de horario ni overbooking.

Al finalizar este hito, el sistema debe ser capaz de **crear, validar, mostrar y cancelar citas reales**, garantizando consistencia entre disponibilidad, bloqueos y agenda.

---

## Tareas del hito

- Crear tabla de disponibilidad del profesional
- Crear tabla de bloqueos de agenda (días u horarios no disponibles)
- Crear tabla de citas
- Definir estados de cita (ej. programada, cancelada)
- Implementar validación de no-overbooking en backend
- Implementar políticas RLS para citas y disponibilidad
- CRUD de disponibilidad del profesional
- CRUD de citas (crear, ver, cancelar)
- Implementar cálculo de slots disponibles
- Crear vista básica de calendario (día / semana / mes)
- Mostrar citas en el calendario del profesional

---

## Requerimientos técnicos

- Base de datos en Supabase con RLS habilitado
- Tablas relacionadas por profesional_id y fecha
- Índices por profesional y rango de fechas
- Validaciones críticas ejecutadas en Supabase (no solo frontend)
- Uso del cliente oficial de Supabase para lecturas y escrituras
- Cálculo de slots en frontend con revalidación al crear la cita
- Manejo de estados explícitos para las citas
- Next.js como frontend principal

---

## Requerimientos funcionales

- El profesional puede configurar su disponibilidad por día y horario
- El profesional puede bloquear días u horarios específicos
- El sistema solo permite crear citas dentro de la disponibilidad
- El sistema impide crear dos citas en el mismo horario
- El profesional puede ver todas sus citas en un calendario
- El profesional puede cancelar citas existentes
- El paciente solo puede ver sus propias citas
- Los cambios en disponibilidad afectan citas futuras

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- No es posible crear citas fuera de la disponibilidad definida
- No es posible crear dos citas en el mismo slot
- Todas las validaciones críticas se ejecutan en backend
- El profesional puede configurar, modificar y ver su agenda
- Las citas aparecen correctamente en la vista de calendario
- Un paciente solo puede acceder a sus propias citas
- Las políticas RLS previenen accesos indebidos
- El sistema mantiene consistencia entre disponibilidad, bloqueos y citas

---

## Notas importantes para el equipo

- Este hito **no incluye** chat ni suscripciones
- La UI puede ser simple, incluso sin diseño final
- La prioridad es la lógica correcta de agenda, no el diseño visual
- Si la agenda falla, el resto del producto pierde valor

Este hito es crítico y habilita todos los siguientes.

