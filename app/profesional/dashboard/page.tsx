import Link from "next/link";
import { EnlacePublicoCard } from "./EnlacePublicoCard";
import { EstadoSuscripcionCard } from "./EstadoSuscripcionCard";
import { NotificacionesCard } from "./NotificacionesCard";

export default function DashboardProfesionalPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-zinc-100">Dashboard</h1>
      <p className="text-zinc-400">
        Bienvenido al panel del profesional. Gestiona tu disponibilidad, bloqueos
        y citas desde el menú.
      </p>
      <NotificacionesCard className="my-6" />
      <EstadoSuscripcionCard className="my-6" />
      <EnlacePublicoCard className="my-6" />
      <ul className="mt-4 list-inside list-disc text-sm text-zinc-500">
        <li>
          <Link href="/profesional/disponibilidad" className="text-blue-500 hover:text-blue-400 hover:underline">
            Disponibilidad
          </Link>
          {" "}– Configura tus horarios y bloqueos
        </li>
        <li>
          <Link href="/profesional/calendario" className="text-blue-500 hover:text-blue-400 hover:underline">
            Calendario
          </Link>
          {" "}– Visualiza y crea citas
        </li>
        <li>
          <Link href="/profesional/metricas" className="text-blue-500 hover:text-blue-400 hover:underline">
            Métricas
          </Link>
          {" "}– Citas por formulario/chat y uso
        </li>
      </ul>
    </div>
  );
}
