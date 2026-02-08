# Hito 6 — Notificaciones Internas y Métricas

## Objetivo del hito

Implementar el sistema de **notificaciones internas** y el registro de **métricas clave del MVP**, con el fin de medir el uso real del producto y validar las hipótesis de negocio.

Este hito no busca optimizar la experiencia del usuario, sino **proveer visibilidad clara sobre cómo se está usando el sistema** para tomar decisiones post-MVP.

---

## Tareas del hito

- Crear tabla de notificaciones internas
- Relacionar notificaciones con profesional y/o paciente
- Implementar generación automática de notificaciones por eventos clave
- Mostrar notificaciones en el panel del profesional
- Crear estructura de registro de eventos (event tracking)
- Registrar evento: cita creada por formulario
- Registrar evento: cita creada por chat
- Registrar evento: activación de suscripción
- Registrar evento: cancelación de cita
- Crear vista básica de métricas internas

---

## Requerimientos técnicos

- Tabla de notificaciones internas con estados (leída / no leída)
- Tabla o mecanismo de registro de eventos del sistema
- Uso de Supabase como almacenamiento de eventos
- Políticas RLS que permitan:
  - Al profesional ver solo sus notificaciones
  - Al paciente ver solo las suyas (si aplica)
- Generación de eventos desde backend o lógica controlada
- Separación entre datos operativos (citas) y datos de métricas
- Consultas optimizadas para métricas simples (conteos, agrupaciones)

---

## Requerimientos funcionales

- El profesional debe recibir notificaciones internas relevantes
- Las notificaciones deben reflejar acciones reales del sistema
- El sistema debe registrar cómo se crean las citas (formulario o chat)
- El sistema debe registrar cuándo se activa una suscripción
- Las métricas deben permitir comparar uso del chat vs formulario
- El usuario no necesita configurar nada para que las métricas se registren

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- Las notificaciones internas se crean automáticamente por eventos clave
- El profesional puede ver sus notificaciones en su panel
- Los eventos críticos del MVP se registran correctamente
- Se puede medir cuántas citas se crean por formulario y por chat
- Se puede identificar qué profesionales tienen suscripción activa
- Las métricas son consistentes con los datos reales del sistema

---

## Notas importantes para el equipo

- Este hito **no incluye** dashboards avanzados ni analytics externos
- No se requieren gráficas complejas
- La prioridad es la confiabilidad del dato, no la visualización
- Si un evento no ayuda a tomar una decisión, no debe registrarse

Este hito cierra el MVP y habilita la fase de validación del negocio.