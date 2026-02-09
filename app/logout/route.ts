import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

async function signOutAndRedirect(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, { status: 302 });
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request);
}
