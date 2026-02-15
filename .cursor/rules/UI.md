# Reglas de UI — OBLIGATORIO

## Stack y modo

- **Siempre Tailwind**: Todas las clases de estilo deben ser de Tailwind. No usar CSS puro en archivos `.css` para la UI (ni `style`, ni `className` con estilos inline que dupliquen Tailwind). Si hace falta un valor que Tailwind no tiene, usar variante arbitraria `[...]` en Tailwind.
- **Modo dark forzado**: La UI debe verse siempre en tema oscuro. No depender de `prefers-color-scheme`; aplicar clases oscuras directamente (fondos oscuros, texto claro). No usar variables CSS tipo `var(--background)` para tema; usar clases Tailwind concretas.

## Paleta de colores (Tailwind)

- **Fondo de página**: `bg-black` o `bg-zinc-950`. Alternativa azul-gris muy oscuro: `bg-[#1A1D2B]`.
- **Fondo de cards/contenedores**: Oscuro y contrastante con la página. Usar `bg-slate-800/95`, `bg-slate-800`, o `bg-[#282C36]`. Permitir transparencia (`/80`, `/95`) para glassmorphism.
- **Fondo de inputs**: Más oscuro que el card. `bg-slate-900/80`, `bg-zinc-900`, o `bg-slate-900`.
- **Texto principal**: `text-zinc-100` o `text-white`.
- **Texto secundario / labels**: `text-zinc-400`.
- **Texto auxiliar / placeholders**: `text-zinc-500`, `placeholder-zinc-500`.
- **Bordes**: `border-slate-600/40`, `border-zinc-700`, `border-slate-600`. Siempre sutiles.
- **Color de acento** (botón primario, links, focus): Un solo acento en toda la app. Usar `blue-500` / `blue-600` (p. ej. `bg-blue-600`, `text-blue-500`, `focus:ring-blue-500`) o, para login, coral: `bg-orange-500`, `bg-rose-500`. No mezclar varios acentos; paleta minimalista.
- **Errores**: `text-red-400` o `text-red-500`.
- **Botón secundario**: `bg-zinc-600` o `bg-zinc-700`. Texto `text-white`.

## Gradientes (solo Tailwind)

- **Fondo tipo bokeh (auth)**: Usar `bg-gradient-to-br` con colores arbitrarios si hace falta. Ejemplo: `bg-gradient-to-br from-orange-900/30 via-transparent to-blue-900/30` en capas, con `blur-3xl` en divs decorativos. Todo con clases Tailwind; no gradientes en CSS puro.
- **Botón primario (opcional)**: `bg-gradient-to-b from-blue-500 to-blue-600` o similar. Preferir una sola clase `bg-*` si no se necesita degradado.
- Cualquier gradiente debe definirse con utilidades Tailwind (`bg-gradient-*`, `from-*`, `via-*`, `to-*`).

## Fondos y contenedores

- Página: fondo con una de las clases de “Fondo de página” anteriores.
- Cards, modales, formularios: `rounded-xl`, borde sutil (`border border-slate-600/40`), sombra `shadow-2xl shadow-black/50`. Si hay glassmorphism: `backdrop-blur-sm` y fondo con opacidad (`/95`).
- No usar `box-shadow` ni `border-radius` en CSS; usar `shadow-*` y `rounded-*` de Tailwind.

## Inputs

- Clases de contenedor/input: `rounded-md`, fondo según “Fondo de inputs”, `border border-slate-600`, texto `text-zinc-100`, `placeholder-zinc-500`.
- Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500` (o el acento elegido). Todo con Tailwind.
- Incluir iconos dentro del campo (usuario/email, candado, ojo) usando componentes o SVG con clases Tailwind (`w-4 h-4 text-zinc-500`). Espaciado con `pl-10` o `pr-10` según posición.

## Botones

- Primario: `bg-blue-600` (o acento elegido), `text-white`, `rounded-xl`, `shadow-lg` opcional. Hover: `hover:opacity-90` o `hover:bg-blue-500`. Disabled: `disabled:opacity-50`.
- Secundario: `bg-zinc-600`, `text-white`, `rounded-xl`. Misma lógica de hover/disabled con Tailwind.

## Tipografía

- Títulos: `text-lg` o `text-xl`, `font-semibold` o `font-bold`, `text-zinc-100` o `text-white`.
- Labels: `text-sm`, `text-zinc-400`.
- Enlaces de acento: `text-blue-500` (o acento), `hover:text-blue-400` o `hover:underline`. Solo clases Tailwind.

## Sombras y efectos

- Usar solo `shadow-sm`, `shadow`, `shadow-lg`, `shadow-xl`, `shadow-2xl` y `shadow-black/20`, `shadow-black/50`. No definir sombras en CSS.
- Blur: `backdrop-blur-sm` o `blur-3xl` en elementos decorativos. Todo con Tailwind.

## Resumen de prohibiciones

- No escribir propiedades de color, gradiente, sombra, borde o tipografía en archivos `.css` para la UI.
- No usar `var(--...)` para tema; usar clases Tailwind oscuras directamente.
- No depender del modo del sistema; la UI es siempre dark por clases aplicadas.
- No mezclar muchos colores; un acento (blue o coral) y escala de grises (zinc/slate).
