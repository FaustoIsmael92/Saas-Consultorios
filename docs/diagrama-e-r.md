erDiagram
    auth_users {
        uuid id PK
        text email
    }

    profesionales {
        uuid id PK
        uuid user_id FK
        text nombre
        text especialidad
        text slug
        boolean activo
        timestamp deleted_at
    }

    pacientes {
        uuid id PK
        uuid user_id FK
        text nombre
        timestamp deleted_at
    }

    disponibilidad {
        uuid id PK
        uuid profesional_id FK
        smallint dia_semana
        time hora_inicio
        time hora_fin
        int duracion_cita_min
        timestamp deleted_at
    }

    bloqueos_agenda {
        uuid id PK
        uuid profesional_id FK
        timestamp fecha_inicio
        timestamp fecha_fin
        timestamp deleted_at
    }

    citas {
        uuid id PK
        uuid profesional_id FK
        uuid paciente_id FK
        timestamp inicio
        timestamp fin
        text estado
        text origen
        timestamp deleted_at
    }

    chats {
        uuid id PK
        uuid profesional_id FK
        uuid paciente_id FK
        boolean activo
        timestamp deleted_at
    }

    mensajes_chat {
        uuid id PK
        uuid chat_id FK
        text emisor
        text mensaje
        timestamp deleted_at
    }

    suscripciones {
        uuid id PK
        uuid profesional_id FK
        text estado
        date fecha_inicio
        date fecha_fin
        timestamp deleted_at
    }

    notificaciones {
        uuid id PK
        uuid user_id FK
        text tipo
        boolean leida
        timestamp deleted_at
    }

    auth_users ||--|| profesionales : tiene
    auth_users ||--|| pacientes : tiene

    profesionales ||--o{ disponibilidad : define
    profesionales ||--o{ bloqueos_agenda : tiene
    profesionales ||--o{ citas : recibe
    pacientes ||--o{ citas : agenda

    profesionales ||--o{ chats : participa
    pacientes ||--o{ chats : participa
    chats ||--o{ mensajes_chat : contiene

    profesionales ||--o{ suscripciones : tiene
    auth_users ||--o{ notificaciones : recibe
