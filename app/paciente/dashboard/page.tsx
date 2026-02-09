import Link from "next/link";

export default function DashboardPacientePage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <p className="text-[var(--foreground)]/80">
        Bienvenido al panel del paciente. Aquí verás tus citas y podrás agendar
        (próximos hitos).
      </p>
      <ul className="mt-4 list-inside list-disc text-sm text-[var(--foreground)]/70">
        <li>
          <Link href="/paciente/dashboard" className="underline">
            Inicio
          </Link>
        </li>
      </ul>
    </div>
  );
}
