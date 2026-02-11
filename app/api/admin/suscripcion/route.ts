import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ESTADOS = ["activa", "inactiva"] as const;

/**
 * PATCH /api/admin/suscripcion
 * Activa o desactiva la suscripción de un profesional.
 * Requiere header x-admin-key igual a ADMIN_SECRET (o SUPABASE_SERVICE_ROLE_KEY como fallback).
 * Body: { profesionalId: string, estado: "activa" | "inactiva" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const adminKey =
      request.headers.get("x-admin-key") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const secret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || adminKey !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { profesionalId, estado } = body as { profesionalId?: string; estado?: string };

    if (!profesionalId || typeof profesionalId !== "string") {
      return NextResponse.json(
        { error: "Falta profesionalId" },
        { status: 400 }
      );
    }
    if (!estado || !ESTADOS.includes(estado as (typeof ESTADOS)[number])) {
      return NextResponse.json(
        { error: "estado debe ser 'activa' o 'inactiva'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("suscripciones")
      .update({
        estado: estado as "activa" | "inactiva",
        updated_at: new Date().toISOString(),
      })
      .eq("profesional_id", profesionalId)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "No se encontró suscripción para ese profesional" },
        { status: 404 }
      );
    }

    return NextResponse.json({ suscripcion: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
