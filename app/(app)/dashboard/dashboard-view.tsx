"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { abreviacaoPatente } from "@/lib/utils";
import type { Soldado } from "@/types";
import type { Funcao } from "@/types/database";

export function DashboardView({
  preset,
  inicio,
  fim,
  totalTurnos,
  totalPretas,
  totalVermelhas,
  prontidao,
  totalTrocas,
  rankingPorFuncao,
  rankingAfastamentos,
}: {
  preset: string;
  inicio: string;
  fim: string;
  totalTurnos: number;
  totalPretas: number;
  totalVermelhas: number;
  prontidao: number;
  totalTrocas: number;
  rankingPorFuncao: Record<Funcao, { soldado: Soldado; total: number }[]>;
  rankingAfastamentos: { soldado: Soldado; quantidade: number; totalDias: number }[];
}) {
  const router = useRouter();

  function handleData(campo: "inicio" | "fim", valor: string) {
    const params = new URLSearchParams({
      inicio: campo === "inicio" ? valor : inicio,
      fim: campo === "fim" ? valor : fim,
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-col w-full px-margin py-space-md space-y-space-lg pb-12">
      <div className="flex flex-col space-y-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="terminal" className="text-primary text-[24px]" />
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase tracking-wide">
            Painel de Comando
          </h2>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Indicadores operacionais e efetivo do 6º BEC
        </p>
      </div>

      <section className="flex flex-col bg-surface-container-low rounded-lg p-space-md shadow-sm space-y-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
            <Icon name="calendar_today" className="text-secondary text-[18px]" />
            Janela Temporal
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Data Inicial</label>
            <div className="flex items-center bg-surface-container-lowest rounded px-space-sm py-2 shadow-sm">
              <input
                type="date"
                defaultValue={inicio}
                onChange={(e) => handleData("inicio", e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Data Final</label>
            <div className="flex items-center bg-surface-container-lowest rounded px-space-sm py-2 shadow-sm">
              <input
                type="date"
                defaultValue={fim}
                onChange={(e) => handleData("fim", e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
          {(["semana", "mes", "ano"] as const).map((p) => (
            <Link
              key={p}
              href={`/dashboard?preset=${p}`}
              className={`py-2 px-1 text-center font-label-sm text-label-sm uppercase rounded transition-colors active:scale-95 ${
                preset === p
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {p === "semana" ? "Esta Semana" : p === "mes" ? "Este Mês" : "Este Ano"}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between px-0.5">
          <span className="font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">
            Métricas Operacionais Chave
          </span>
        </div>
        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary">
                <Icon name="assignment_turned_in" className="text-[20px]" />
              </div>
              <span className="font-label-md text-label-md text-on-surface uppercase">
                Total de Serviços no Período
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs py-space-xs">
            <span className="font-display-mobile text-display-mobile text-primary tracking-tight">
              {totalTurnos}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
              Turnos Totais
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
            <div className="flex items-center justify-between bg-inverse-surface text-inverse-on-surface px-space-sm py-2 rounded">
              <span className="font-label-sm text-label-sm uppercase truncate">Dia Preto</span>
              <span className="font-headline-sm text-headline-sm font-bold">{totalPretas}</span>
            </div>
            <div className="flex items-center justify-between bg-tertiary text-on-tertiary px-space-sm py-2 rounded">
              <span className="font-label-sm text-label-sm uppercase truncate">Dia Vermelho</span>
              <span className="font-headline-sm text-headline-sm font-bold">{totalVermelhas}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm justify-between space-y-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase truncate">
                Prontidão
              </span>
              <Icon name="verified" className="text-primary text-[18px]" />
            </div>
            <div>
              <div className="font-display-mobile text-display-mobile text-primary-container leading-none">
                {prontidao.toFixed(1)}%
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
                Efetivo disponível hoje
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: `${prontidao}%` }} />
            </div>
          </div>
          <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm justify-between space-y-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase truncate">
                Trocas
              </span>
              <Icon name="sync_alt" className="text-secondary text-[18px]" />
            </div>
            <div>
              <div className="font-display-mobile text-display-mobile text-secondary leading-none">
                {String(totalTrocas).padStart(2, "0")}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">
                Permutas no período
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-space-md">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-space-xs">
            <Icon name="leaderboard" className="text-secondary text-[20px]" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase">
              Escalonamento &amp; Rankings
            </h3>
          </div>
        </div>

        {(["piscineiro", "permanencia"] as Funcao[]).map((funcao) => {
          const ranking = rankingPorFuncao[funcao];
          const max = ranking[0]?.total ?? 1;
          return (
            <div
              key={funcao}
              className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm space-y-space-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name={funcao === "piscineiro" ? "pool" : "shield"} className="text-primary text-[20px]" />
                  <h4 className="font-label-lg text-label-lg text-on-surface uppercase">
                    Mais Cumpridos - {funcao === "piscineiro" ? "Piscineiro" : "Permanência"}
                  </h4>
                </div>
              </div>
              <div className="flex flex-col space-y-space-sm">
                {ranking.map((r, idx) => (
                  <div key={r.soldado.id} className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center font-body-sm text-body-sm">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-secondary text-surface rounded-full flex items-center justify-center font-label-sm text-label-sm">
                          {idx + 1}
                        </span>
                        {abreviacaoPatente(r.soldado.patente)}. {r.soldado.nome_guerra}
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        {r.total} turnos
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${(r.total / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {ranking.length === 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-sm">
                    Sem serviços registrados no período.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="medical_services" className="text-tertiary text-[20px]" />
              <h4 className="font-label-lg text-label-lg text-on-surface uppercase">
                Ranking de Afastamentos por Efetivo
              </h4>
            </div>
          </div>
          <div className="flex flex-col space-y-space-sm">
            {rankingAfastamentos.map((r, idx) => {
              const max = rankingAfastamentos[0]?.quantidade ?? 1;
              return (
                <div key={r.soldado.id} className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center font-body-sm text-body-sm">
                    <span className="font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center font-label-sm text-label-sm">
                        {idx + 1}
                      </span>
                      {abreviacaoPatente(r.soldado.patente)}. {r.soldado.nome_guerra}
                    </span>
                    <span className="font-label-md text-label-md text-tertiary font-bold">
                      {r.quantidade} {r.quantidade === 1 ? "ocorrência" : "ocorrências"} • {r.totalDias}{" "}
                      dias
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full transition-all duration-500"
                      style={{ width: `${(r.quantidade / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {rankingAfastamentos.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-sm">
                Sem afastamentos no período.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="font-label-sm text-label-sm text-center text-on-surface-variant uppercase tracking-widest">
        6º BEC • GRECAS • Boa Vista - RR
      </p>
    </div>
  );
}
