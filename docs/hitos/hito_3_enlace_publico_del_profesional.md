# Hito 3 — Enlace Público del Profesional

## Objetivo del hito

Permitir que los pacientes agenden citas de manera autónoma mediante un **enlace público único por profesional**, sin necesidad de buscador ni intervención manual.

Este hito habilita el principal canal de adquisición y uso real del MVP, validando que los profesionales compartan su enlace y que los pacientes completen el flujo de agendado sin fricción.

---

## Tareas del hito

- Validar y asegurar unicidad del slug del profesional
- Crear ruta pública `/[slug-profesional]`
- Resolver profesional a partir del slug
- Mostrar información básica del profesional (nombre, especialidad si aplica)
- Consultar y mostrar disponibilidad pública
- Implementar registro de paciente desde el enlace
- Implementar formulario de creación de cita
- Validar disponibilidad en tiempo real al crear la cita
- Manejar estados de confirmación y error

---

## Requerimientos técnicos

- Uso de rutas dinámicas en Next.js
- Acceso controlado a datos públicos desde Supabase
- Políticas RLS que permitan:
  - Lectura pública de disponibilidad asociada al slug
  - Escritura de citas solo para pacientes autenticados
- Validaciones críticas ejecutadas en backend
- Uso del cliente oficial de Supabase para consultas públicas y privadas
- Protección contra acceso a datos sensibles del profesional

---

## Requerimientos funcionales

- Cada profesional debe tener un enlace público único
- Un paciente puede acceder al enlace sin estar autenticado
- El sistema debe permitir al paciente registrarse desde el enlace
- El formulario solo muestra horarios realmente disponibles
- El sistema impide crear citas inválidas u ocupadas
- El paciente recibe confirmación visual de la cita creada
- El profesional ve inmediatamente la cita en su agenda

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- El enlace público funciona correctamente para cualquier profesional
- El slug identifica de forma única al profesional
- Un paciente externo puede completar el flujo completo:
  - entrar al enlace
  - registrarse
  - crear una cita válida
- No se exponen datos privados del profesional
- Las citas creadas desde el enlace respetan todas las reglas de agenda
- El profesional ve reflejada la cita en su calendario

---

## Notas importantes para el equipo

- Este hito **no incluye** chat asistido
- No debe existir buscador de profesionales
- La UI debe ser simple y clara para pacientes no técnicos
- Este flujo debe poder usarse desde móvil sin fricción

Este hito valida el uso real del producto por pacientes.

