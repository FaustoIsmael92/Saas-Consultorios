flowchart TD
    A["/"] --> B["/login"]
    A --> C["/registro"]

    B --> D{rol}
    C --> D

    D -- profesional --> E["/profesional/dashboard"]
    E --> F["/profesional/disponibilidad"]
    E --> G["/profesional/calendario"]
    E --> H["/profesional/chats"]
    E --> I["/profesional/notificaciones"]
    E --> J["/profesional/suscripcion"]

    D -- paciente --> K["/paciente/dashboard"]
    K --> L["/paciente/citas"]

    M["/{slug-profesional}"] --> N{auth}
    N -- no --> C
    N -- si --> O["/paciente/agendar"]

    O --> P["/paciente/agendar/formulario"]
    O --> Q["/paciente/agendar/chat"]

    P --> L
    Q --> L

    L --> R["/paciente/citas/editar"]
    L --> S["/paciente/citas/cancelar"]

    E --> T["/logout"]
    K --> T

