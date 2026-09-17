"use client";

import { useState } from "react";
import Link from "next/link";
import { addWeeks, addMonths, subWeeks, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Icon } from "@/components/icon";
import { BadgeTipoDia } from "@/components/badge-tipo-dia";
import { AdminContactCard } from "@/components/admin-contact-card";
import { iniciais, formatarDataBR, nomeDiaSemana } from "@/lib/utils";
import { calcularEscaladoDoDia } from "@/lib/escala/engine";
import type { Soldado } from "@/types";
import type { Funcao, TipoDia } from "@/types/database";

export type SoldadoComDias = Soldado & { diasEscalados: { data: string; tipoDia: TipoDia }[] };

const FUNCAO_META: Record<Funcao, { titulo: string; sub: string; icon: string }> = {
  piscineiro: {
    titulo: "Piscineiro",
    sub: "Segurança e Manutenção da Piscina",
    icon: "pool",
  },
  permanencia: {
    titulo: "Permanência",
    sub: "Controle de Portaria, Guarda e Acesso",
    icon: "door_front",
  },
};

export function EscalaView({
  view,
  inicioISO,
  fimISO,
  porFuncao,
  hoje,
  meuSoldadoId,
  totalEscalados,
  trocasNoPeriodo,
}: {
  view: "semana" | "mes";
  inicioISO: string;
  fimISO: string;
  porFuncao: Record<Funcao, SoldadoComDias[]>;
  hoje: Record<Funcao, ReturnType<typeof calcularEscaladoDoDia>>;
  meuSoldadoId: string | null;
  totalEscalados: number;
  trocasNoPeriodo: number;
}) {
  const [apenasMinha, setApenasMinha] = useState(false);

  const inicio = new Date(inicioISO + "T00:00:00");
  const hojeData = new Date();

  const anterior =
    view === "semana"
      ? subWeeks(inicio, 1).toISOString().slice(0, 10)
      : subMonths(inicio, 1).toISOString().slice(0, 10);
  const proximo =
    view === "semana"
      ? addWeeks(inicio, 1).toISOString().slice(0, 10)
      : addMonths(inicio, 1).toISOString().slice(0, 10);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full bg-surface-container px-margin py-space-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
              Operação Ativa • 6º BEC
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
              GRECAS
            </span>
            <p className="font-headline-sm text-headline-sm text-on-surface uppercase">
              Hoje: {nomeDiaSemana(hojeData)}, {format(hojeData, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-margin flex flex-col gap-space-lg">
        {/* View switcher + filtro */}
        <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm">
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-highest rounded-lg">
            <Link
              href="/escala?view=semana"
              className={`py-2 text-center rounded font-label-md text-label-md uppercase transition-all flex items-center justify-center gap-1.5 ${
                view === "semana"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name="calendar_view_week" className="text-[18px]" />
              Semanal
            </Link>
            <Link
              href="/escala?view=mes"
              className={`py-2 text-center rounded font-label-md text-label-md uppercase transition-all flex items-center justify-center gap-1.5 ${
                view === "mes"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name="calendar_view_month" className="text-[18px]" />
              Mensal
            </Link>
          </div>

          <div className="flex items-center justify-between px-1">
            <Link
              href={`/escala?view=${view}&start=${anterior}`}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase"
            >
              <Icon name="chevron_left" className="text-[18px]" />
              Anterior
            </Link>
            <span className="font-label-sm text-label-sm text-on-surface uppercase">
              {formatarDataBR(inicioISO)} a {formatarDataBR(fimISO)}
            </span>
            <Link
              href={`/escala?view=${view}&start=${proximo}`}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase"
            >
              Próximo
              <Icon name="chevron_right" className="text-[18px]" />
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <Icon name="person_pin" className="text-[18px]" />
              </div>
              <div>
                <p className="font-label-md text-label-md uppercase text-on-surface">
                  Apenas Minha Escala
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Filtrar dias do militar logado
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={apenasMinha}
                disabled={!meuSoldadoId}
                onChange={(e) => setApenasMinha(e.target.checked)}
              />
              <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
              <Icon name="info" className="text-[16px]" />
              Legenda Regulamentar
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-1">
            <div className="flex items-center gap-space-sm p-2 rounded bg-surface-container-highest">
              <BadgeTipoDia tipo="preta" />
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm text-on-surface uppercase font-bold">Dia Útil</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Segunda a Sexta-feira
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm p-2 rounded bg-surface-container-highest">
              <BadgeTipoDia tipo="vermelha" />
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm text-[#A83232] uppercase font-bold">
                  Fim de Semana
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Sábado e Domingo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner do dia */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container to-primary text-on-primary p-space-md shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm tracking-widest text-primary-fixed uppercase font-bold">
                Serviço de Hoje
              </span>
              <h2 className="font-headline-md text-headline-md uppercase mt-0.5">
                {format(hojeData, "d MMM", { locale: ptBR })} • {nomeDiaSemana(hojeData)}
              </h2>
            </div>
            <BadgeTipoDia tipo={hoje.piscineiro.tipoDia} className="bg-surface-container-lowest text-on-surface" />
          </div>
          <div className="mt-space-md pt-space-sm bg-primary/40 rounded-lg p-space-xs flex items-center justify-around text-center">
            <div>
              <span className="font-label-sm text-label-sm text-primary-fixed block uppercase">Piscina</span>
              <span className="font-label-md text-label-md text-on-primary">
                {hoje.piscineiro.soldado?.nome_guerra ?? "Sem escala"}
              </span>
            </div>
            <div className="w-px h-6 bg-primary-fixed/30" />
            <div>
              <span className="font-label-sm text-label-sm text-primary-fixed block uppercase">Portaria</span>
              <span className="font-label-md text-label-md text-on-primary">
                {hoje.permanencia.soldado?.nome_guerra ?? "Sem escala"}
              </span>
            </div>
          </div>
        </div>

        {/* Seções por função */}
        <div className="flex flex-col gap-space-lg">
          {(["piscineiro", "permanencia"] as Funcao[]).map((funcao) => {
            const meta = FUNCAO_META[funcao];
            const soldados = porFuncao[funcao].filter(
              (s) => !apenasMinha || s.id === meuSoldadoId
            );
            return (
              <section key={funcao} className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-7 h-7 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center">
                      <Icon name={meta.icon} className="text-[18px]" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
                        {meta.titulo}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{meta.sub}</p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface px-2 py-0.5 rounded uppercase">
                    {porFuncao[funcao].length} Militares
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  {soldados.length === 0 && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
                      Nenhum soldado ativo nesta função.
                    </p>
                  )}
                  {soldados.map((soldado) => {
                    const isSelf = soldado.id === meuSoldadoId;
                    return (
                      <article
                        key={soldado.id}
                        className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-space-sm min-w-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md flex-shrink-0 ${
                                isSelf
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-highest text-on-surface-variant"
                              }`}
                            >
                              {iniciais(soldado.nome_guerra)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-label-md text-label-md uppercase text-on-surface font-bold truncate">
                                  Sd. {soldado.nome_guerra}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded uppercase font-semibold">
                                    Você
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-space-xs pt-1">
                          {soldado.diasEscalados.length === 0 && (
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Folga no período
                            </span>
                          )}
                          {soldado.diasEscalados.map((d) => (
                            <div
                              key={d.data}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high"
                            >
                              <Icon name="calendar_today" className="text-[16px] text-on-surface" />
                              <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                                {formatarDataBR(d.data)}
                              </span>
                              <BadgeTipoDia tipo={d.tipoDia} />
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
              <Icon name="verified" className="text-[18px]" />
              <span className="font-label-sm text-label-sm uppercase font-semibold">Total Escalados</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">
              {String(totalEscalados).padStart(2, "0")} HOMENS
            </span>
          </div>
          <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary mb-1">
              <Icon name="swap_horizontal_circle" className="text-[18px]" />
              <span className="font-label-sm text-label-sm uppercase font-semibold">Trocas no Período</span>
            </div>
            <span className="font-headline-md text-headline-md text-secondary">
              {String(trocasNoPeriodo).padStart(2, "0")} REGISTROS
            </span>
          </div>
        </div>

        <AdminContactCard />

        <div className="text-center py-space-xs">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            6º Batalhão de Engenharia de Construção • Boa Vista - RR
          </p>
        </div>
      </div>
    </div>
  );
}
