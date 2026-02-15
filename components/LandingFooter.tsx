"use client";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-black/50 py-6 text-center text-sm text-zinc-500">
      <p>© {new Date().getFullYear()} SaaS Consultorio. Todos los derechos reservados.</p>
    </footer>
  );
}
