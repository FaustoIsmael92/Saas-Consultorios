import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background)] px-4">
      <h1 className="text-4xl font-medium text-[var(--foreground)]">
        SaaS Consultorio — Citas para profesionales de la salud
      </h1>
      <p className="max-w-md text-center text-[var(--foreground)]/80">
        Gestiona tu agenda y citas. Regístrate como profesional o como paciente.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded border border-[var(--foreground)]/30 bg-transparent px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--foreground)]/10"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="rounded bg-[var(--foreground)] px-4 py-2 text-[var(--background)] transition hover:opacity-90"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
