"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? undefined;

  /** Solo permite rutas internas: empieza por "/" y no por "//" ni contiene ":" (protocolo). */
  const redirect =
    rawRedirect &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.includes(":")
      ? rawRedirect
      : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    setLoading(false);
    if (profile?.role === "profesional") {
      router.push(redirect && redirect.startsWith("/profesional") ? redirect : "/profesional/dashboard");
    } else if (profile?.role === "paciente") {
      router.push(redirect && redirect.startsWith("/paciente") ? redirect : "/paciente/dashboard");
    } else {
      router.push(redirect || "/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--foreground)] py-2 text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--foreground)]/70">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="underline hover:no-underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
