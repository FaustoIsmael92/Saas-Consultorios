import Link from "next/link";

export default function DashboardPacientePage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Dashboard</h1>
      <p className="text-zinc-400">
        Bienvenido al panel del paciente. Aquí puedes ver tus citas y acceder a
        tu historial. Para agendar una nueva cita, usa el enlace que te haya
        compartido tu profesional (o el chat asistido si está disponible).
      </p>
      <ul className="mt-4 list-inside list-disc text-sm text-zinc-500">
        <li>
          <Link href="/paciente/citas" className="text-blue-500 hover:text-blue-400 hover:underline">
            Mis citas
          </Link>
          {" "}– Ver próximas citas y historial
        </li>
      </ul>
    </div>
  );
}
