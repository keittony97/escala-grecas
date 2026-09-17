"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { iniciais } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { Icon } from "@/components/icon";

export function TopBar({
  titulo,
  nomeGuerra,
  fotoUrl,
}: {
  titulo: string;
  nomeGuerra?: string | null;
  fotoUrl?: string | null;
}) {
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- garante releitura do cookie de sessão no servidor
    window.location.href = "/login";
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <Image
            src="/brand/brasao-grecas.png"
            alt="Brasão Escala GRECAS"
            width={32}
            height={32}
            className="h-8 w-8 object-contain flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase truncate">
              6º BEC - GRECAS
            </span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface uppercase truncate">
              {titulo}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-space-xs flex-shrink-0">
          <span className="px-space-xs py-0.5 bg-primary text-on-primary font-label-sm text-label-sm rounded uppercase">
            RR
          </span>
          <Link
            href="/perfil"
            className="w-9 h-9 flex items-center justify-center"
            aria-label="Meu perfil"
            title={nomeGuerra ?? "Meu perfil"}
          >
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto vem de storage externo (Supabase), sem domínio fixo para next/image
              <img
                src={fotoUrl}
                alt={nomeGuerra ?? "Perfil"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                {iniciais(nomeGuerra ?? "??")}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleSair}
            disabled={saindo}
            aria-label="Sair do sistema"
            title="Sair"
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
