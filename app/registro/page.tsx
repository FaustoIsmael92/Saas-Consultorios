"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/auth";

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

    // Perfil, paciente y profesional se crean automáticamente por trigger
    await new Promise((r) => setTimeout(r, 500));

    setLoading(false);
    if (redirect) {
      router.push(redirect);
    } else if (role === "profesional") {
      router.push("/profesional/dashboard");
    } else {
      router.push("/paciente/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Crear cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Registrarme como</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="paciente"
                  checked={role === "paciente"}
                  onChange={() => setRole("paciente")}
                />
                Paciente
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="profesional"
                  checked={role === "profesional"}
                  onChange={() => setRole("profesional")}
                />
                Profesional
              </label>
            </div>
          </div>
          {role === "profesional" && (
            <div>
              <label htmlFor="especialidad" className="mb-1 block text-sm font-medium">
                Especialidad (opcional)
              </label>
              <input
                id="especialidad"
                type="text"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Medicina general"
                className="w-full rounded border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/30"
              />
            </div>
          )}
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
            {loading ? "Creando cuenta…" : "Registrarme"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--foreground)]/70">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="underline hover:no-underline"
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
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          Cargando…
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
