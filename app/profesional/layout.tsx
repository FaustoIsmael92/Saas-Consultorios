import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LayoutProfesional({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profile?.role !== "profesional") redirect("/paciente/dashboard");

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-slate-600/40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/profesional/dashboard" className="font-medium text-zinc-100">
            Panel profesional
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/profesional/disponibilidad"
              className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
            >
              Disponibilidad
            </Link>
            <Link
              href="/profesional/calendario"
              className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
            >
              Calendario
            </Link>
            <Link
              href="/profesional/chats"
              className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
            >
              Chats
            </Link>
            <Link
              href="/profesional/metricas"
              className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
            >
              Métricas
            </Link>
            <span className="text-sm text-zinc-400">
              {profile?.full_name ?? "Profesional"}
            </span>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-zinc-300 hover:underline"
              >
                Cerrar sesión
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
