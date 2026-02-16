import { type NextRequest, NextResponse } from "next/server";
import {
  esRutaPublica,
  esRutaProfesional,
  esRutaPaciente,
  rutaParaRol,
} from "@/lib/auth/guards";
import { isValidRole } from "@/lib/auth/roles";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

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
      role = profile?.role ?? null;
    }

    // Rutas públicas: cualquiera puede pasar
    if (esRutaPublica(pathname)) {
      if (role === "profesional") {
        return NextResponse.redirect(new URL("/profesional/dashboard", request.url));
      }
      if (role === "paciente") {
        return NextResponse.redirect(new URL("/paciente/dashboard", request.url));
      }
      return response;
    }

    if (!role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (esRutaProfesional(pathname)) {
      if (role !== "profesional") {
        const redirectPath = isValidRole(role) ? rutaParaRol(role) : "/login";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return response;
    }

    if (esRutaPaciente(pathname)) {
      if (role !== "paciente") {
        const redirectPath = isValidRole(role) ? rutaParaRol(role) : "/login";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return response;
    }

    return NextResponse.redirect(new URL("/login", request.url));
  } catch {
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
