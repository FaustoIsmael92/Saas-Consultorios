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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--foreground)]/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/profesional/dashboard" className="font-medium">
            Panel profesional
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/profesional/disponibilidad"
              className="text-sm underline hover:no-underline"
            >
              Disponibilidad
            </Link>
            <Link
              href="/profesional/calendario"
              className="text-sm underline hover:no-underline"
            >
              Calendario
            </Link>
            <span className="text-sm text-[var(--foreground)]/70">
              {profile?.full_name ?? "Profesional"}
            </span>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="text-sm underline hover:no-underline"
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
