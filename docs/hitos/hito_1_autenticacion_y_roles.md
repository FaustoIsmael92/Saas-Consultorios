# Hito 1 — Autenticación y Roles

## Objetivo del hito

Construir la base de autenticación, control de acceso y separación de roles del sistema. Este hito establece los cimientos de seguridad y organización sobre los cuales se desarrollará todo el MVP.

Al finalizar este hito, el sistema debe poder identificar claramente **quién es el usuario**, **qué rol tiene** y **a qué partes de la aplicación puede acceder**.

---

## Tareas del hito

- Configurar Supabase Auth
- Implementar registro de usuarios
- Implementar inicio de sesión
- Crear tabla de perfil de usuario (extendida de auth.users)
- Definir roles: profesional y paciente
- Asignar rol al momento del registro
- Generar slug único para profesionales
- Implementar protección de rutas por rol en Next.js
- Crear layouts separados para profesional y paciente
- Manejar sesión activa y cierre de sesión

---

## Requerimientos técnicos

- Frontend desarrollado en Next.js
- Backend y base de datos en Supabase
- Uso del cliente oficial de Supabase en el frontend
- Supabase Auth como único sistema de autenticación
- Tabla de perfiles relacionada 1:1 con auth.users
- Row Level Security (RLS) habilitado en la tabla de perfiles
- Políticas RLS que permitan:
  - Al usuario leer y actualizar solo su propio perfil
- Manejo de sesión mediante cookies o helpers oficiales de Supabase
- Estructura de rutas con layouts separados por rol

---

## Requerimientos funcionales

- El sistema debe permitir el registro de profesionales y pacientes
- El sistema debe permitir iniciar y cerrar sesión
- Cada usuario debe tener un rol claramente definido
- Un profesional no puede acceder al panel de paciente
- Un paciente no puede acceder al panel de profesional
- El slug del profesional debe ser único y persistente
- El usuario debe permanecer autenticado al recargar la aplicación

---

## Definition of Done (DoD)

El hito se considera terminado cuando se cumplen todos los puntos siguientes:

- Un profesional puede registrarse, iniciar sesión y acceder a su panel
- Un paciente puede registrarse, iniciar sesión y acceder a su panel
- Las rutas están protegidas correctamente por rol
- Un usuario no puede acceder a información de otro usuario
- El perfil del usuario se guarda correctamente en la base de datos
- El slug del profesional se genera sin duplicados
- El sistema maneja correctamente la sesión activa y el logout
- No existen accesos no autorizados detectables desde el frontend

---

## Notas importantes para el equipo

- Este hito **no incluye** funcionalidades de agenda ni citas
- La UI puede ser simple; la prioridad es seguridad y correcto flujo
- Todas las decisiones deben favorecer simplicidad y velocidad
- Cualquier funcionalidad no relacionada con autenticación queda fuera de este hito

Este hito es obligatorio y bloqueante para todos los siguientes.

