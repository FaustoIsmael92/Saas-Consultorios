flowchart TD
    A[Landing Page SSR] --> B{Auth}

    B -- No --> C[Login Registro]
    C --> D{Rol}
    D -- Profesional --> E[Registro Profesional]
    D -- Paciente --> F[Registro Paciente]

    B -- Si --> G{Rol}

    %% PROFESIONAL
    G -- Profesional --> H[Dashboard Profesional]
    E --> H

    H --> I[Configurar Disponibilidad]
    H --> J[Calendario]
    H --> K[Notificaciones]
    H --> L[Historial Chats]
    H --> M[Suscripcion]

    I --> J

    M --> N{Suscripcion Activa}
    N -- Si --> O[Chat Habilitado]
    N -- No --> P[Chat Deshabilitado]

    %% PACIENTE
    G -- Paciente --> Q[Panel Paciente]
    F --> Q

    %% ENLACE PUBLICO
    R[Enlace Publico Profesional] --> S{Paciente Existe}
    S -- No --> F
    S -- Si --> T[Agenda Profesional]

    %% AGENDADO
    T --> U{Metodo}
    U -- Formulario --> V[Formulario Cita]
    U -- Chat --> W[Chat Asistido]

    V --> X[Validar Disponibilidad]
    W --> X

    X -- Disponible --> Y[Crear Cita]
    X -- No --> Z[Mostrar Alternativas]

    Z --> U

    Y --> AA[Guardar Cita]
    AA --> AB[Notificacion]
    AB --> Q
    AB --> H

    %% GESTION CITAS
    Q --> AC[Gestion Cita]
    H --> AC

    AC --> AD{Accion}
    AD -- Editar --> X
    AD -- Cancelar --> AE[Cancelar Cita]
    AE --> AB

    %% CHAT
    W --> AF[Guardar Mensajes]
    AF --> L
