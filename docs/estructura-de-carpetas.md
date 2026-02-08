src/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing (SSR)
│   ├── globals.css
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── registro/
│   │   └── page.tsx
│   │
│   ├── logout/
│   │   └── route.ts
│   │
│   ├── (public)/
│   │   └── [slug-profesional]/
│   │       └── page.tsx
│   │
│   ├── (profesional)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── disponibilidad/
│   │   │   └── page.tsx
│   │   ├── calendario/
│   │   │   └── page.tsx
│   │   ├── chats/
│   │   │   └── page.tsx
│   │   ├── notificaciones/
│   │   │   └── page.tsx
│   │   └── suscripcion/
│   │       └── page.tsx
│   │
│   ├── (paciente)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── citas/
│   │   │   └── page.tsx
│   │   └── agendar/
│   │       ├── page.tsx
│   │       ├── formulario/
│   │       │   └── page.tsx
│   │       └── chat/
│   │           └── page.tsx
│   │
│   └── api/
│       └── health/
│           └── route.ts
│
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── button.types.ts
│   │   ├── Input/
│   │   ├── Label/
│   │   └── Loader/
│   │
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── DatePicker/
│   │   └── TimeSlot/
│   │
│   ├── organisms/
│   │   ├── LoginForm/
│   │   ├── AgendaCalendar/
│   │   ├── ChatWindow/
│   │   └── AppointmentForm/
│   │
│   ├── templates/
│   │   ├── ProfesionalLayout/
│   │   └── PacienteLayout/
│   │
│   └── index.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   │
│   ├── auth/
│   │   ├── guards.ts
│   │   └── roles.ts
│   │
│   ├── agenda/
│   │   ├── availability.ts
│   │   └── slots.ts
│   │
│   ├── chat/
│   │   └── chatService.ts
│   │
│   ├── metrics/
│   │   └── events.ts
│   │
│   └── utils/
│       ├── dates.ts
│       ├── strings.ts
│       └── constants.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useRole.ts
│   ├── useAgenda.ts
│   └── useChat.ts
│
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── types/
│   ├── auth.ts
│   ├── agenda.ts
│   ├── chat.ts
│   └── common.ts
│
├── styles/
│   └── theme.css
│
└── middleware.ts
