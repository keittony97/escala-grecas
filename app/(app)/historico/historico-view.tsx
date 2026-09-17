"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { formatarDataBR, iniciais } from "@/lib/utils";
import { reativarSoldado } from "@/lib/actions/soldados";
import type { Soldado } from "@/types";
import type { EventoTimeline } from "@/lib/historico/timeline";

export function HistoricoView({
  inativos,
  selecionado,
  timeline,
  totalPretas,
  totalVermelhas,
}: {
  inativos: Soldado[];
  selecionado: Soldado | null;
  timeline: EventoTimeline[];
  totalPretas: number;
  totalVermelhas: number;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [pending, startTransition] = useTransition();

  const total = totalPretas + totalVermelhas;
  const pctPreta = total > 0 ? (totalPretas / total) * 100 : 0;
  const pctVermelha = total > 0 ? (totalVermelhas / total) * 100 : 0;

  const filtrados = inativos.filter((s) =>
    s.nome_guerra.toUpperCase().includes(busca.trim().toUpperCase())
  );

  function handleReativar() {
    if (!selecionado) return;
    if (!confirm(`Confirmar a REATIVAÇÃO de Sd. ${selecionado.nome_guerra} para a escala ativa?`)) {
      return;
    }
    startTransition(async () => {
      await reativarSoldado(selecionado.id);
      router.push("/soldados");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="w-full bg-surface-container-high px-gutter py-space-sm flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <Icon name="admin_panel_settings" className="text-secondary text-sm flex-shrink-0" filled />
          <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase truncate">
            Acesso Restrito: Administrador
          </span>
        </div>
      </div>

      <div className="px-gutter pt-space-lg pb-space-md flex flex-col gap-space-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase tracking-wide">
          Histórico &amp; Inativos
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Militares desmobilizados e registro consolidado de missões e escalas anteriores.
        </p>
      </div>

      <div className="px-gutter mb-space-lg">
        <div className="bg-surface-container-low rounded p-space-sm shadow-sm flex items-center gap-space-sm">
          <Icon name="search" className="text-outline" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="BUSCAR POR NOME DE GUERRA..."
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface uppercase focus:outline-none placeholder:text-outline placeholder:font-label-sm"
          />
        </div>
      </div>

      <div className="px-gutter flex flex-col gap-space-xl">
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <Icon name="person_off" className="text-primary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase">
                Soldados Inativos
              </h3>
            </div>
            <span className="bg-surface-container-highest font-label-sm text-label-sm text-on-surface px-2 py-0.5 rounded">
              {inativos.length} Registros
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {filtrados.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => router.push(`/historico?id=${s.id}`)}
                className={`text-left bg-surface-container-lowest rounded p-space-md shadow-sm transition-all duration-150 flex flex-col gap-space-sm relative overflow-hidden ${
                  selecionado?.id === s.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center flex-shrink-0 font-headline-sm text-headline-sm text-on-surface-variant">
                      {iniciais(s.nome_guerra)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
                        Sd. {s.nome_guerra}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Ex-{s.funcao === "piscineiro" ? "Piscineiro" : "Permanência"}
                      </span>
                    </div>
                  </div>
                  <span className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded uppercase tracking-wider flex-shrink-0 text-center">
                    Inativo
                  </span>
                </div>
                <div className="flex items-center justify-between pt-space-xs bg-surface-container-low px-space-sm py-1.5 rounded">
                  <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                    <Icon name="event_busy" className="text-sm" />
                    <span>
                      Desligamento:{" "}
                      <strong className="text-on-surface">
                        {s.data_saida ? formatarDataBR(s.data_saida) : "—"}
                      </strong>
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {filtrados.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
                Nenhum soldado inativo encontrado.
              </p>
            )}
          </div>
        </section>

        {selecionado && (
          <section className="bg-surface-container-lowest rounded p-space-md shadow-md flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold flex items-center gap-1">
                  <Icon name="military_tech" className="text-base" /> Ficha Individual Consolidada
                </span>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded uppercase font-bold ${
                    selecionado.ativo ? "bg-primary text-on-primary" : "bg-error text-on-error"
                  }`}
                >
                  {selecionado.ativo ? "Ativo" : "Baixado"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                    Sd. {selecionado.nome_guerra}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selecionado.funcao === "piscineiro" ? "Piscineiro" : "Permanência"} • Entrada em{" "}
                    {formatarDataBR(selecionado.data_entrada)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Balanço Total de Escalas Cumpridas
              </span>
              <div className="grid grid-cols-3 gap-space-xs text-center">
                <div className="bg-surface-container rounded p-space-sm flex flex-col items-center justify-center">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                    {total}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                    Total Dias
                  </span>
                </div>
                <div className="bg-inverse-surface rounded p-space-sm flex flex-col items-center justify-center">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-inverse-on-surface font-bold">
                    {totalPretas}
                  </span>
                  <span className="font-label-sm text-label-sm text-inverse-on-surface/80 uppercase mt-1">
                    Dias Pretos
                  </span>
                </div>
                <div className="bg-tertiary rounded p-space-sm flex flex-col items-center justify-center">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-tertiary font-bold">
                    {totalVermelhas}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-tertiary/90 uppercase mt-1">
                    Dias Vermelhos
                  </span>
                </div>
              </div>
              {total > 0 && (
                <div className="w-full bg-surface-variant h-2 rounded overflow-hidden flex mt-1">
                  <div className="bg-inverse-surface h-full" style={{ width: `${pctPreta}%` }} />
                  <div className="bg-tertiary h-full" style={{ width: `${pctVermelha}%` }} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
                  Linha do Tempo &amp; Ocorrências
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {timeline.map((ev, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-low rounded p-space-sm flex items-start gap-space-sm"
                  >
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${ev.corClasses}`}
                    >
                      <Icon name={ev.icon} className="text-base" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-headline-sm text-on-surface uppercase text-sm">
                          {ev.titulo}
                        </span>
                        <span className={`${ev.corClasses} font-label-sm text-label-sm px-1.5 py-0.2 rounded uppercase`}>
                          {ev.tag}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {ev.detalhe}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary mt-1">
                        {formatarDataBR(ev.data)}
                      </span>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
                    Nenhum evento registrado para este militar.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-space-sm pt-space-xs">
              {!selecionado.ativo && (
                <button
                  type="button"
                  onClick={handleReativar}
                  disabled={pending}
                  className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider py-3.5 px-space-md rounded flex items-center justify-center gap-space-sm hover:opacity-95 active:scale-[0.99] transition shadow-md disabled:opacity-60"
                >
                  <Icon name="restart_alt" />
                  <span>Reativar Militar para Escala Ativa</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-surface-container text-on-surface font-headline-sm text-headline-sm uppercase tracking-wider py-3 px-space-md rounded flex items-center justify-center gap-space-sm hover:bg-surface-container-high active:scale-[0.99] transition"
              >
                <Icon name="picture_as_pdf" className="text-secondary" />
                <span>Exportar Ficha Individual (Imprimir)</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
