"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { formatarDataBR, iniciais, abreviacaoPatente } from "@/lib/utils";
import { criarAfastamento } from "@/lib/actions/afastamentos";
import type { Soldado } from "@/types";
import type { Afastamento } from "@/lib/data/afastamentos";
import type { TipoAfastamento } from "@/types/database";

const TIPO_META: Record<TipoAfastamento, { label: string; icon: string; cor: string }> = {
  ferias: { label: "Férias", icon: "beach_access", cor: "bg-primary text-on-primary" },
  atestado: { label: "Atestado Médico", icon: "medical_services", cor: "bg-secondary-container text-on-secondary-container" },
  licenca: { label: "Licença Especial", icon: "description", cor: "bg-inverse-surface text-inverse-on-surface" },
  curso: { label: "Curso Externo", icon: "school", cor: "bg-primary-container text-on-primary-container" },
  dispensa: { label: "Dispensa (Recompensa)", icon: "military_tech", cor: "bg-tertiary text-on-tertiary" },
};

export function AfastamentosView({
  soldados,
  afastamentos,
}: {
  soldados: Soldado[];
  afastamentos: Afastamento[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoAfastamento>("atestado");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hoje = new Date().toISOString().slice(0, 10);
  const vigentes = afastamentos.filter((a) => a.data_inicio <= hoje && hoje <= a.data_fim);
  const soldadosPorId = new Map(soldados.map((s) => [s.id, s]));

  async function handleSubmit(formData: FormData) {
    setErro(null);
    formData.set("tipo", tipo);
    startTransition(async () => {
      const res = await criarAfastamento(formData);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setAberto(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col w-full px-gutter space-y-space-md pb-12">
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Painel de Comando
            </span>
          </div>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface tracking-tight">
              Registro de Afastamentos
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Gerenciamento dinâmico de disponibilidade de tropa
            </p>
          </div>
          <div className="flex flex-col items-end bg-surface-container rounded-lg px-2.5 py-1 text-right">
            <span className="font-headline-md text-headline-md text-primary leading-none">
              {String(vigentes.length).padStart(2, "0")}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Ausentes
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-space-md rounded-xl font-label-lg text-label-lg uppercase tracking-wider shadow-md flex items-center justify-center gap-space-xs transition-all active:scale-[0.98]"
      >
        <Icon name={aberto ? "close" : "add_circle"} className="text-[20px]" />
        <span>{aberto ? "Fechar Formulário" : "Registrar Afastamento"}</span>
      </button>

      {aberto && (
        <form
          action={handleSubmit}
          className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-md space-y-space-md"
        >
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Icon name="shield_person" className="text-[14px]" /> Militar do Efetivo
            </label>
            <select
              name="soldado_id"
              required
              defaultValue=""
              className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option disabled value="">
                Selecione a praça ou graduado...
              </option>
              {soldados.map((s) => (
                <option key={s.id} value={s.id}>
                  {abreviacaoPatente(s.patente)}. {s.nome_guerra} ({s.funcao === "piscineiro" ? "Piscineiro" : "Permanência"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Icon name="category" className="text-[14px]" /> Modalidade de Dispensa
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(Object.keys(TIPO_META) as TipoAfastamento[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`py-2 px-2 rounded-lg font-label-sm text-label-sm uppercase text-center transition-all ${
                    tipo === t
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {TIPO_META[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Data Início
              </label>
              <input
                name="data_inicio"
                type="date"
                required
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Data Término
              </label>
              <input
                name="data_fim"
                type="date"
                required
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Icon name="description" className="text-[14px]" /> Doc. Referência / Observações
            </label>
            <textarea
              name="observacao"
              rows={2}
              placeholder="Ex: DIEx Nº 124-S1/6º BEC ou Atestado Médico HGuBV..."
              className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-on-surface-variant/60"
            />
          </div>

          {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary py-3 px-space-md rounded-xl font-label-lg text-label-lg uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <Icon name="sync" className="text-[20px]" />
            <span>Confirmar e Atualizar Rodízio</span>
          </button>
        </form>
      )}

      <div className="bg-surface-container rounded-xl p-space-md flex gap-space-sm items-start">
        <Icon name="cached" className="text-secondary text-[22px] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col space-y-0.5">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
            Automação de Escala Ativa
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
            Afastamentos removem automaticamente o militar do rodízio de dias pretos/vermelhos
            durante o período homologado.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-space-sm pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
            Afastamentos Registrados
          </h3>
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            Vigentes ({vigentes.length})
          </span>
        </div>

        {afastamentos.map((a) => {
          const soldado = soldadosPorId.get(a.soldado_id);
          const meta = TIPO_META[a.tipo];
          return (
            <div
              key={a.id}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col space-y-2"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface font-headline-sm text-headline-sm">
                    {iniciais(soldado?.nome_guerra ?? "??")}
                  </div>
                  <div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {soldado ? `${abreviacaoPatente(soldado.patente)}. ` : ""}
                      {soldado?.nome_guerra ?? "Ex-militar"}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold ${meta.cor}`}
                >
                  <Icon name={meta.icon} className="text-[14px]" />
                  <span>{meta.label}</span>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg px-2.5 py-1.5 flex items-center justify-between text-on-surface font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5">
                  <Icon name="calendar_today" className="text-[16px] text-on-surface-variant" />
                  <span>
                    {formatarDataBR(a.data_inicio)} a {formatarDataBR(a.data_fim)}
                  </span>
                </div>
              </div>
              {a.observacao && (
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm pt-0.5">
                  <Icon name="assignment" className="text-[15px] text-secondary flex-shrink-0" />
                  <span className="truncate">{a.observacao}</span>
                </div>
              )}
            </div>
          );
        })}
        {afastamentos.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
            Nenhum afastamento registrado.
          </p>
        )}
      </div>
    </div>
  );
}
