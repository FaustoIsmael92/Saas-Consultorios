import Link from "next/link";
import { EnlacePublicoCard } from "./EnlacePublicoCard";

export default function DashboardProfesionalPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <p className="text-[var(--foreground)]/80">
        Bienvenido al panel del profesional. Gestiona tu disponibilidad, bloqueos
        y citas desde el menú.
      </p>
      <EnlacePublicoCard className="my-6" />
      <ul className="mt-4 list-inside list-disc text-sm text-[var(--foreground)]/70">
        <li>
          <Link href="/profesional/disponibilidad" className="underline">
            Disponibilidad
          </Link>
          – Configura tus horarios y bloqueos
        </li>
        <li>
          <Link href="/profesional/calendario" className="underline">
            Calendario
          </Link>
          – Visualiza y crea citas
        </li>
      </ul>
    </div>
  );
}
