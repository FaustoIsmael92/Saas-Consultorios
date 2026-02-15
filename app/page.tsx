import Link from "next/link";
import { LandingFooter } from "@/components/LandingFooter";

const features = [
  {
    title: "Agenda inteligente",
    description: "Gestiona tu disponibilidad y bloquea horarios. Tus pacientes eligen el turno que les queda bien.",
    icon: "📅",
    delay: "0ms",
  },
  {
    title: "Citas sin fricción",
    description: "Confirmación, recordatorios y reprogramación desde un solo lugar. Menos inasistencias.",
    icon: "✅",
    delay: "100ms",
  },
  {
    title: "Todo en un dashboard",
    description: "Métricas, chats y enlace público en una sola pantalla. Enfócate en lo que importa.",
    icon: "📊",
    delay: "200ms",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-100">
      {/* Hero: alto + gradientes circulares animados */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4">
        {/* Orbes de gradiente animados */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute -left-[20%] top-[15%] h-[min(80vw,420px)] w-[min(80vw,420px)] rounded-full bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 opacity-80 blur-3xl animate-blob-1"
          />
          <div
            className="absolute -right-[15%] top-[35%] h-[min(70vw,380px)] w-[min(70vw,380px)] rounded-full bg-gradient-to-bl from-cyan-500/35 to-blue-600/25 opacity-80 blur-3xl animate-blob-2"
          />
          <div
            className="absolute bottom-[20%] left-[10%] h-[min(60vw,320px)] w-[min(60vw,320px)] rounded-full bg-gradient-to-tr from-amber-500/25 to-orange-600/20 opacity-70 blur-3xl animate-blob-3"
          />
          <div
            className="absolute -left-[10%] bottom-[10%] h-[min(50vw,280px)] w-[min(50vw,280px)] rounded-full bg-gradient-to-tl from-emerald-500/30 to-teal-600/25 opacity-70 blur-3xl animate-blob-4"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Citas para profesionales{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              de la salud
            </span>
          </h1>
          <p className="max-w-xl text-lg text-zinc-400 sm:text-xl">
            Gestiona tu agenda, reduce inasistencias y ofrece una experiencia clara a tus pacientes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registro"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-medium text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-zinc-600 bg-zinc-900/60 px-6 py-3.5 font-medium text-zinc-100 backdrop-blur-sm transition hover:border-zinc-500 hover:bg-zinc-800/60"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features con toque WOW */}
      <section className="relative border-t border-zinc-800/80 bg-zinc-950/80 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-zinc-400">
            Herramientas pensadas para que tu consultorio funcione mejor y tus pacientes reserven sin vueltas.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900/80 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.35)]"
                style={{
                  animation: "fade-up-in 0.6s ease-out forwards",
                  animationDelay: feature.delay,
                  opacity: 0,
                }}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/80 text-2xl ring-1 ring-zinc-700/50 transition group-hover:scale-110 group-hover:ring-violet-500/30">
                    {feature.icon}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
