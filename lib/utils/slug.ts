/**
 * Genera un slug único a partir del nombre.
 * Formato: nombre-normalizado + sufijo alfanumérico corto para unicidad.
 */
export function normalizarParaSlug(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "usuario";
}

export function generarSufijoCorto(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generarSlugCandidato(nombre: string): string {
  const base = normalizarParaSlug(nombre);
  return `${base}-${generarSufijoCorto()}`;
}
