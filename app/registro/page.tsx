"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/auth";

const inputClass =
  "w-full rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const roleParam = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("paciente");
  const [especialidad, setEspecialidad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//") &&
    !redirectParam.includes(":")
      ? redirectParam
      : undefined;

  useEffect(() => {
    if (roleParam === "paciente") setRole("paciente");
    else if (roleParam === "profesional") setRole("profesional");
  }, [roleParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          role,
          full_name: fullName.trim() || null,
          ...(role === "profesional" && { especialidad: especialidad.trim() || null }),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;
    if (!user) {
      setError("Error al crear el usuario.");
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 500));

    setLoading(false);
    if (redirect) router.push(redirect);
    else if (role === "profesional") router.push("/profesional/dashboard");
    else router.push("/paciente/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-blue-900/20" />
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-xl border border-slate-600/40 bg-slate-800/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <p className="mb-1 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
          Crear cuenta
        </p>
        <h1 className="mb-6 text-center text-xl font-semibold text-zinc-100">Regístrate</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm text-zinc-400">
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-zinc-400">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Registrarme como</label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="radio"
                  name="role"
                  value="paciente"
                  checked={role === "paciente"}
                  onChange={() => setRole("paciente")}
                  className="rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                Paciente
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="radio"
                  name="role"
                  value="profesional"
                  checked={role === "profesional"}
                  onChange={() => setRole("profesional")}
                  className="rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                Profesional
              </label>
            </div>
          </div>
          {role === "profesional" && (
            <div>
              <label htmlFor="especialidad" className="mb-1 block text-sm text-zinc-400">
                Especialidad (opcional)
              </label>
              <input
                id="especialidad"
                type="text"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Medicina general"
                className={inputClass}
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-blue-500 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creando cuenta…" : "Registrarme"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="text-blue-500 hover:text-blue-400 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
          Cargando…
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
