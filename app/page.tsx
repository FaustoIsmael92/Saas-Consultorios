import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4">
      <h1 className="text-center text-4xl font-semibold text-zinc-100">
        SaaS Consultorio — Citas para profesionales de la salud
      </h1>
      <p className="max-w-md text-center text-zinc-400">
        Gestiona tu agenda y citas. Regístrate como profesional o como paciente.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-xl border border-slate-600 px-4 py-2 text-zinc-100 transition hover:bg-slate-800"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-500 hover:opacity-90"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
