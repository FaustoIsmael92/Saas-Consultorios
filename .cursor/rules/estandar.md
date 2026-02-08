# OBLIGATORIO:
-Siempre debes leer la carpeta docs para entender el proyecto con su documentacion.
- La documentacion se debe seguir al pie de la letra.
# Estándar de código

- Usa siempre Tailwind; no escribas CSS en archivos aparte.
- Aplica DRY y buenas prácticas de codigo; evita duplicar lógica o UI.
- Interfaces y types en archivos separados, dentro de una carpeta dedicada al tipado.
- Componentes pequeños: no superar 120 líneas por archivo.
- Un componente por archivo; subcomponentes muy pequeños pueden vivir en el mismo archivo si tiene sentido.
- Nombres claros y consistentes: componentes en PascalCase, funciones/variables en camelCase, constantes en UPPER_SNAKE cuando sea conveniente.
- Un componente una responsabilidad; si hace demasiado, dividir en componentes o hooks.
- Preferir composición y componentes reutilizables; evitar lógica repetida entre páginas.
- Extraer lógica compleja a hooks o utilidades; mantener el JSX simple y legible.
- Tipar props y estado; evitar `any`; usar los types de la carpeta de tipado.
- Funciones puras cuando sea posible; efectos y estado solo donde hagan falta.
- Comentarios solo cuando expliquen el "por qué", no lo obvio.
- Estructura de carpetas predecible: agrupar por feature o por tipo (components, hooks, utils, types).
- Exportaciones nombradas para componentes reutilizables; default solo para páginas o puntos de entrada.
- No mutar estado; crear copias o nuevos objetos al actualizar.
- La UI debe ser minimalista. Nada de agregar muchos colores.
- las migraciones supabase se crean en la carpeta supabase para ejecutarlas con el CLI