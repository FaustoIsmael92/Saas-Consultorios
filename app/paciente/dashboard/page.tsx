import Link from "next/link";

export default function DashboardPacientePage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <p className="text-[var(--foreground)]/80">
        Bienvenido al panel del paciente. Aquí puedes ver tus citas y acceder a
        tu historial. Para agendar una nueva cita, usa el enlace que te haya
        compartido tu profesional (o el chat asistido si está disponible).
      </p>
      <ul className="mt-4 list-inside list-disc text-sm text-[var(--foreground)]/70">
        <li>
          <Link href="/paciente/citas" className="underline">
            Mis citas
          </Link>
          – Ver próximas citas y historial
        </li>
      </ul>
    </div>
  );
}
