# Hito 5 — Suscripción y Control de Acceso

## Objetivo del hito

Implementar el sistema de **suscripción del profesional** y el control de acceso a funcionalidades premium, principalmente el chat asistido.

Este hito valida la **disposición de pago** de los profesionales y conecta directamente la funcionalidad diferencial del producto con el modelo de negocio.

---

## Tareas del hito

- Crear tabla de suscripciones
- Definir estados de suscripción (activa / inactiva)
- Relacionar suscripción con el profesional
- Implementar activación manual de suscripción
- Implementar desactivación de suscripción
- Verificar estado de suscripción en cada acceso al chat
- Bloquear acceso al chat cuando la suscripción está inactiva
- Mostrar estado de suscripción en el panel del profesional
- Manejar cambios de estado en tiempo real (si aplica)

---

## Requerimientos técnicos

- Tabla de suscripciones como fuente única de verdad
- Relación 1:1 entre profesional y suscripción
- Políticas RLS que permitan:
  - Al profesional leer solo su propia suscripción
  - Impedir modificaciones no autorizadas
- Validación de suscripción tanto en frontend como en backend
- Uso del cliente oficial de Supabase para consultas
- Separación clara entre lógica de suscripción y lógica de chat
- Manejo consistente de estados (no hardcodear flags en frontend)

---

## Requerimientos funcionales

- El sistema debe permitir activar y desactivar una suscripción
- El profesional debe poder ver claramente su estado de suscripción
- El chat asistido solo debe estar disponible con suscripción activa
- Al desactivar la suscripción, el chat debe bloquearse inmediatamente
- El profesional no pierde citas ni chats previos al desactivar
- Los pacientes no pagan ni gestionan suscripciones

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- Existe una suscripción asociada a cada profesional
- El estado activo / inactivo se guarda correctamente
- El chat está completamente bloqueado sin suscripción activa
- El chat funciona normalmente con suscripción activa
- El estado de suscripción es visible y entendible para el profesional
- No es posible acceder al chat mediante hacks de frontend
- El backend impide el acceso no autorizado al chat

---

## Notas importantes para el equipo

- Este hito **no incluye** pagos automatizados
- La activación puede ser manual (admin o flag interno)
- La lógica debe ser simple y explícita
- Este hito es crítico para validar el modelo de negocio

Este hito conecta directamente producto y monetización.

