"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { formatarDataBR, abreviacaoPatente } from "@/lib/utils";
import { criarTroca, homologarTroca } from "@/lib/actions/trocas";
import { sugerirSubstitutos } from "@/lib/escala/folgas";
import type { Soldado } from "@/types";
import type { Troca } from "@/lib/data/trocas";
import type { EscalaServico } from "@/lib/data/escalas";

export function TrocasView({
  soldados,
  trocas,
  escalas,
}: {
  soldados: Soldado[];
  trocas: Troca[];
  escalas: EscalaServico[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [ausenteId, setAusenteId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [homologando, setHomologando] = useState<string | null>(null);

  const soldadosPorId = useMemo(() => new Map(soldados.map((s) => [s.id, s])), [soldados]);

  const ausente = ausenteId ? soldadosPorId.get(ausenteId) ?? null : null;
  const sugestoes = useMemo(() => {
    if (!ausente) return [];
    const daFuncao = soldados.filter((s) => s.funcao === ausente.funcao);
    return sugerirSubstitutos(daFuncao, ausente.id, escalas);
  }, [ausente, soldados, escalas]);

  const pendentes = trocas.filter((t) => t.status === "pendente");
  const compensadas = trocas.filter((t) => t.status === "compensado");

  async function handleSubmit(formData: FormData) {
    setErro(null);
    if (ausente) formData.set("funcao", ausente.funcao);
    startTransition(async () => {
      const res = await criarTroca(formData);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setAberto(false);
      setAusenteId("");
      router.refresh();
    });
  }

  function handleHomologar(id: string) {
    setHomologando(id);
    startTransition(async () => {
      await homologarTroca(id);
      setHomologando(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col w-full">
      <div className="bg-surface-container-high px-gutter py-space-sm flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider truncate">
              Painel de Comando // S-1
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface uppercase truncate">
              Módulo Permutas Operacionais
            </span>
          </div>
        </div>
      </div>

      <div className="px-gutter pt-space-md flex flex-col gap-space-md pb-12">
        <div className="grid grid-cols-2 gap-space-sm">
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col shadow-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Permutas Ativas</span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">
                {String(pendentes.length).padStart(2, "0")}
              </span>
              <span className="font-label-sm text-label-sm text-secondary uppercase">Pendente</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col shadow-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Compensadas</span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                {String(compensadas.length).padStart(2, "0")}
              </span>
              <span className="font-label-sm text-label-sm text-primary uppercase">Quitadas</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="w-full bg-primary text-on-primary py-3 px-space-md rounded shadow-sm flex items-center justify-center gap-space-xs transition-transform active:scale-[0.98]"
        >
          <Icon name={aberto ? "close" : "add_circle"} className="text-[20px]" />
          <span className="font-label-lg text-label-lg uppercase tracking-wider">
            {aberto ? "Fechar Formulário" : "+ Registrar Troca"}
          </span>
        </button>

        {aberto && (
          <form
            action={handleSubmit}
            className="flex flex-col bg-surface-container-lowest p-space-md rounded-xl shadow-md space-y-space-md"
          >
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Soldado Ausente (Solicitante)
              </label>
              <select
                name="soldado_ausente_id"
                required
                value={ausenteId}
                onChange={(e) => setAusenteId(e.target.value)}
                className="w-full bg-surface-container-low rounded px-space-sm py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {soldados.map((s) => (
                  <option key={s.id} value={s.id}>
                    {abreviacaoPatente(s.patente)}. {s.nome_guerra} ({s.funcao === "piscineiro" ? "Piscineiro" : "Permanência"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Soldado Substituto (Assume o Posto)
              </label>
              <select
                name="soldado_substituto_id"
                required
                disabled={!ausente}
                className="w-full bg-surface-container-low rounded px-space-sm py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="" disabled>
                  {ausente ? "Selecione..." : "Escolha o soldado ausente primeiro"}
                </option>
                {sugestoes.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {abreviacaoPatente(s.patente)}. {s.nome_guerra} {idx === 0 ? "— maior folga acumulada (sugerido)" : ""}
                  </option>
                ))}
              </select>
              {sugestoes.length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <Icon name="info" className="text-[14px]" />
                  Sugestão baseada em quem está com mais dias de folga acumulados.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Data Original da Escala
              </label>
              <input
                name="data_original"
                type="date"
                required
                className="w-full bg-surface-container-low rounded px-space-sm py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Compensação / Retribuição (opcional)
              </label>
              <input
                name="data_compensacao"
                type="date"
                className="w-full bg-surface-container-low rounded px-space-sm py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Motivo
              </label>
              <input
                name="motivo"
                type="text"
                placeholder="Ex: Atestado médico de última hora"
                className="w-full bg-surface-container-low rounded px-space-sm py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-space-sm bg-primary-container text-on-primary font-label-lg text-label-lg uppercase py-3 rounded shadow-sm flex items-center justify-center gap-space-xs active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              <Icon name="save" className="text-[20px]" />
              <span>Salvar Permuta de Serviço</span>
            </button>
          </form>
        )}

        <div className="flex items-center justify-between pt-space-xs">
          <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
            Relação de Permutas
          </span>
        </div>

        {trocas.map((t) => {
          const ausenteSoldado = soldadosPorId.get(t.soldado_ausente_id);
          const substitutoSoldado = soldadosPorId.get(t.soldado_substituto_id);
          const pendente = t.status === "pendente";
          return (
            <div
              key={t.id}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col gap-space-sm"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${pendente ? "bg-tertiary" : "bg-primary-container"}`} />
              <div className="flex items-start justify-between gap-space-xs pl-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm bg-inverse-surface text-inverse-on-surface px-1.5 py-0.5 rounded uppercase">
                      {t.funcao === "piscineiro" ? "Piscineiro" : "Permanência"}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {formatarDataBR(t.data_original)}
                    </span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface uppercase mt-1">
                    {ausenteSoldado ? `${abreviacaoPatente(ausenteSoldado.patente)}. ` : ""}
                    {ausenteSoldado?.nome_guerra ?? "?"} ➔{" "}
                    {substitutoSoldado ? `${abreviacaoPatente(substitutoSoldado.patente)}. ` : ""}
                    {substitutoSoldado?.nome_guerra ?? "?"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 font-label-sm text-label-sm rounded uppercase font-bold flex items-center gap-1 shadow-xs ${
                    pendente
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-primary text-on-primary"
                  }`}
                >
                  <Icon name={pendente ? "schedule" : "task_alt"} className="text-[14px]" />
                  {pendente ? "Pendente" : "Compensado"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-space-xs bg-surface-container-low p-space-sm rounded-lg pl-2">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Serviço Original
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {formatarDataBR(t.data_original)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Compensação
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {t.data_compensacao ? formatarDataBR(t.data_compensacao) : "Não definida"}
                  </span>
                </div>
              </div>

              {t.motivo && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t.motivo}</p>
              )}

              {pendente && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleHomologar(t.id)}
                    disabled={homologando === t.id}
                    className="bg-secondary text-on-secondary hover:bg-secondary/90 px-space-sm py-1.5 rounded font-label-sm text-label-sm uppercase flex items-center gap-1 shadow-xs transition-colors active:scale-95 disabled:opacity-60"
                  >
                    <Icon name="how_to_reg" className="text-[16px]" />
                    {homologando === t.id ? "Validando..." : "Homologar Troca"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {trocas.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
            Nenhuma troca registrada.
          </p>
        )}
      </div>
    </div>
  );
}
