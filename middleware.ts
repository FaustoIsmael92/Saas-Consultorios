import { type NextRequest, NextResponse } from "next/server";
import {
  esRutaPublica,
  esRutaEnlacePublico,
  esRutaProfesional,
  esRutaPaciente,
  rutaParaRol,
} from "@/lib/auth/guards";
import { isValidRole } from "@/lib/auth/roles";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error(
      "[middleware] Missing Supabase config: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas."
    );
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Permitir que /logout llegue al route handler (POST hace signOut y redirige)
  if (pathname === "/logout") {
    return response;
  }

  let role: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();
    role = (profile as { role?: string } | null)?.role ?? null;
  }

  // Rutas públicas: cualquiera puede pasar
  if (esRutaPublica(pathname)) {
    // Enlace público del profesional: no redirigir (paciente puede agendar)
    if (esRutaEnlacePublico(pathname)) {
      return response;
    }
    // Otras rutas públicas: si ya está logueado, redirigir al dashboard
    if (role === "profesional") {
      return NextResponse.redirect(new URL("/profesional/dashboard", request.url));
    }
    if (role === "paciente") {
      return NextResponse.redirect(new URL("/paciente/dashboard", request.url));
    }
    return response;
  }

  // Sin sesión: ir a login
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protección por rol: profesional solo en /profesional/*
  if (esRutaProfesional(pathname)) {
    if (role !== "profesional") {
      const redirectUrl = isValidRole(role) ? rutaParaRol(role) : "/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return response;
  }

  // Protección por rol: paciente solo en /paciente/*
  if (esRutaPaciente(pathname)) {
    if (role !== "paciente") {
      const redirectUrl = isValidRole(role) ? rutaParaRol(role) : "/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return response;
  }

  // Cualquier otra ruta no pública sin rol válido → login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
