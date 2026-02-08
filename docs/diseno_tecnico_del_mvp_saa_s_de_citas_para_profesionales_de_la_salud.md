# Diseño técnico del MVP

## 1. Objetivo del documento

Este documento define el **diseño técnico del MVP** del SaaS de gestión de citas para profesionales de la salud. Su propósito es servir como guía clara y práctica para el desarrollo, asegurando alineación con los objetivos de validación del MVP, evitando sobre‑ingeniería y priorizando velocidad de entrega, seguridad básica y escalabilidad controlada.

El diseño se basa en las siguientes tecnologías y principios:
- **Frontend:** Next.js
- **Backend y base de datos:** Supabase
- **Arquitectura simple, directa y orientada a MVP**

---

## 2. Principios técnicos clave

### 2.1 Acceso a datos (Supabase‑first)

- **Plan A:** consultas directas a Supabase desde el frontend.
- Se utilizará el cliente oficial de Supabase para:
  - Autenticación
  - Lecturas y escrituras a base de datos
  - Suscripciones en tiempo real (si aplica)
- **API Routes de Next.js solo se usarán cuando sea estrictamente necesario**, por ejemplo:
  - Ocultar API keys sensibles
  - Integraciones externas futuras
  - Lógica que no deba ejecutarse en el cliente

Este enfoque reduce complejidad, acelera el desarrollo y aprovecha las capacidades nativas de Supabase (RLS, Auth).

---

### 2.2 Renderizado y estrategia SSR / CSR

- **Landing Page**:
  - Renderizado **Server Side**
  - Optimizada para SEO y carga inicial
- **Resto de la aplicación**:
  - No es obligatorio Server Side Rendering
  - Se permite Client Side Rendering o Server Components según conveniencia
  - La prioridad es **velocidad de desarrollo y experiencia de usuario**, no SEO

Esta decisión es coherente con un MVP enfocado en usuarios autenticados.

---

### 2.3 Atomic Design como estándar obligatorio

- Se adopta **Atomic Design como principio estructural obligatorio**.
- Los componentes deben ser **lo más atómicos posibles**.

Jerarquía esperada:
- **Átomos**: botones, inputs, labels, badges, loaders
- **Moléculas**: campos de formulario, tarjetas simples, items de lista
- **Organismos**: formularios completos, calendarios, listas de citas
- **Templates**: estructura de páginas por rol
- **Pages**: páginas finales

Beneficios buscados:
- Alta reutilización
- Fácil mantenimiento
- Escalabilidad futura del diseño

---

## 3. Arquitectura general del sistema

### 3.1 Vista general

Arquitectura cliente‑centrada:

- Next.js maneja:
  - UI
  - Navegación
  - Lógica básica de negocio
- Supabase provee:
  - Autenticación
  - Base de datos
  - Seguridad (RLS)

No existe un backend tradicional separado.

---

### 3.2 Flujo general

1. Usuario interactúa con la UI (Next.js)
2. Next.js consulta directamente a Supabase
3. Supabase valida permisos vía RLS
4. Respuesta directa al frontend

---

## 4. Modelo de datos (alto nivel)

El modelo de datos debe soportar agenda, citas y chat sin overbooking.

Entidades principales:
- Usuarios (auth.users)
- Profesionales
- Pacientes
- Disponibilidad
- Bloqueos de agenda
- Citas
- Chats
- Mensajes
- Suscripciones
- Notificaciones internas

Principios del modelo:
- Relaciones claras por ID
- Índices por profesional y fecha
- Estados explícitos (cita, suscripción, chat)

---

## 5. Autenticación y roles

### 5.1 Autenticación

- Implementada con **Supabase Auth**
- Registro y login simples

### 5.2 Roles

- Profesional
- Paciente

El rol se define mediante:
- Metadata del usuario
- O tabla relacionada (preferido para escalabilidad)

---

## 6. Reglas de negocio

Las reglas del MVP deben cumplirse tanto en UI como en backend:

- No overbooking
- Validación automática de disponibilidad
- Chat asistido solo con suscripción activa
- Acceso exclusivo mediante enlace directo

Validaciones críticas siempre deben ejecutarse en Supabase (RLS o lógica de inserción).

---

## 7. Diseño del sistema de agenda

### 7.1 Disponibilidad

- Configurable por el profesional
- Basada en:
  - Días de la semana
  - Horarios
  - Duración de cita

### 7.2 Cálculo de slots

- Se calculan dinámicamente en frontend
- Se validan nuevamente al crear la cita

### 7.3 Vistas

- Día
- Semana
- Mes

---

## 8. Diseño técnico del chat asistido

### 8.1 Alcance

- Exclusivamente gestión de citas
- No incluye contenido médico

### 8.2 Flujo básico

1. Paciente inicia chat
2. Sistema sugiere horarios disponibles
3. Paciente confirma
4. Cita se crea automáticamente

### 8.3 Persistencia

- Historial completo por paciente y profesional

---

## 9. Seguridad y Row Level Security (RLS)

La seguridad se basa principalmente en RLS:

- Profesionales:
  - Solo ven sus citas y chats
- Pacientes:
  - Solo ven sus propias citas

No existe superadmin.

---

## 10. Estructura del frontend

Rutas principales:
- / (landing)
- /login
- /registro
- /profesional/*
- /paciente/*
- /[slug-profesional]

Layouts separados por rol.

---

## 11. Métricas técnicas del MVP

Eventos a registrar:
- Cita creada por formulario
- Cita creada por chat
- Activación de suscripción
- Uso del chat

Estas métricas son clave para validar el modelo de negocio.

---

## 12. Alcances técnicos explícitos

Fuera del MVP:
- Emails y SMS
- Buscador de profesionales
- Facturación automática
- Multilenguaje
- Integraciones externas

---

## 13. Conclusión

Este diseño técnico prioriza simplicidad, velocidad y claridad. Está alineado con los objetivos del MVP: validar si los profesionales están dispuestos a pagar por una agenda con chat asistido, minimizando riesgos técnicos y manteniendo una base sólida para iteraciones futuras.

