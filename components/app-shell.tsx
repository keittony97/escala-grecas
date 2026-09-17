"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import type { Role } from "@/types/database";

const TITULOS: Record<string, string> = {
  "/escala": "Escala",
  "/soldados": "Efetivo",
  "/afastamentos": "Afastamentos",
  "/trocas": "Trocas",
  "/historico": "Histórico",
  "/dashboard": "Painel",
};

function tituloDaRota(pathname: string): string {
  const chave = Object.keys(TITULOS).find((p) => pathname.startsWith(p));
  return chave ? TITULOS[chave] : "Escala GRECAS";
}

export function AppShell({
  role,
  nomeGuerra,
  fotoUrl,
  children,
}: {
  role: Role;
  nomeGuerra?: string | null;
  fotoUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar titulo={tituloDaRota(pathname ?? "")} nomeGuerra={nomeGuerra} fotoUrl={fotoUrl} />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface flex-grow">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  );
}
