"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Icon } from "@/components/icon";
import { BottomSheet } from "@/components/bottom-sheet";
import { BadgeTipoDia } from "@/components/badge-tipo-dia";
import { abreviacaoPatente, cn } from "@/lib/utils";
import {
  getAtivosNaData,
  calcularEscaladoDoDia,
  tipoDiaDe,
  type AfastamentoPeriodo,
  type OverrideEscala,
} from "@/lib/escala/engine";
import { definirEscalaManual, removerEscalaManual } from "@/lib/actions/escalas";
import type { Soldado } from "@/types";
import type { Funcao } from "@/types/database";

const FUNCAO_LABEL: Record<Funcao, string> = {
  piscineiro: "Piscineiro",
  permanencia: "Permanência",
};

export function EscalaManualModal({
  open,
  onClose,
  todosSoldados,
  afastamentos,
  overridesManuais,
}: {
  open: boolean;
  onClose: () => void;
  todosSoldados: Soldado[];
  afastamentos: AfastamentoPeriodo[];
  overridesManuais: OverrideEscala[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [funcao, setFuncao] = useState<Funcao>("piscineiro");
  const [mes, setMes] = useState(() => startOfMonth(new Date()));
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const overridesPorData = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const o of overridesManuais) {
      if (o.funcao === funcao) mapa.set(o.data, o.soldado_id);
    }
    return mapa;
  }, [overridesManuais, funcao]);

  const soldadosPorId = useMemo(() => new Map(todosSoldados.map((s) => [s.id, s])), [todosSoldados]);

  const diasGrade = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
    const fim = endOfWeek(endOfMonth(mes), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mes]);

  function escaladoDoDia(date: Date) {
    const iso = format(date, "yyyy-MM-dd");
    const { soldado, tipoDia } = calcularEscaladoDoDia(todosSoldados, afastamentos, funcao, date);
    const overrideId = overridesPorData.get(iso);
    const escalado = overrideId ? (soldadosPorId.get(overrideId) ?? null) : soldado;
    return { iso, tipoDia, soldado: escalado, manual: Boolean(overrideId) };
  }

  const diaIso = diaSelecionado;
  const diaSelecionadoData = diaIso ? new Date(diaIso + "T00:00:00") : null;
  const ativosDoDia = diaSelecionadoData
    ? getAtivosNaData(todosSoldados, afastamentos, funcao, diaSelecionadoData)
    : [];
  const overrideAtual = diaIso ? overridesPorData.get(diaIso) : undefined;

  function handleAtribuir(soldadoId: string) {
    if (!diaIso) return;
    setErro(null);
    startTransition(async () => {
      const res = await definirEscalaManual(funcao, diaIso, soldadoId);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setDiaSelecionado(null);
      router.refresh();
    });
  }

  function handleRestaurar() {
    if (!diaIso) return;
    setErro(null);
    startTransition(async () => {
      const res = await removerEscalaManual(funcao, diaIso);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setDiaSelecionado(null);
      router.refresh();
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-gutter bg-inverse-surface/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-xl p-gutter shadow-2xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">
              <Icon name="edit_calendar" className="text-[20px]" />
            </div>
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">
              Organizar Escala Manualmente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
            aria-label="Fechar"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-highest rounded-lg">
          {(["piscineiro", "permanencia"] as Funcao[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFuncao(f)}
              className={cn(
                "py-2 text-center rounded font-label-md text-label-md uppercase transition-all",
                funcao === f
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {FUNCAO_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setMes((m) => subMonths(m, 1))}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase"
          >
            <Icon name="chevron_left" className="text-[18px]" />
            Anterior
          </button>
          <span className="font-label-md text-label-md text-on-surface uppercase">
            {format(mes, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button
            type="button"
            onClick={() => setMes((m) => addMonths(m, 1))}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase"
          >
            Próximo
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <span key={i} className="font-label-sm text-label-sm text-on-surface-variant uppercase py-1">
              {d}
            </span>
          ))}
          {diasGrade.map((dia) => {
            const { iso, tipoDia, soldado, manual } = escaladoDoDia(dia);
            const foraDoMes = !isSameMonth(dia, mes);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDiaSelecionado(iso)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg p-1.5 min-h-[58px] border transition-colors",
                  foraDoMes
                    ? "opacity-35 border-transparent"
                    : "border-surface-container-high hover:border-primary",
                  isToday(dia) ? "ring-2 ring-primary" : "",
                  manual ? "bg-secondary-container/40" : "bg-surface-container-low"
                )}
              >
                <span className="font-label-sm text-label-sm text-on-surface font-bold">{format(dia, "d")}</span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    tipoDia === "preta" ? "bg-dia-preta" : "bg-dia-vermelha"
                  )}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate w-full text-center leading-tight">
                  {soldado ? soldado.nome_guerra : "—"}
                </span>
                {manual && <Icon name="edit" className="text-[11px] text-secondary" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <span className="w-2.5 h-2.5 rounded bg-secondary-container/70" />
          <span className="font-body-sm text-body-sm">Dias com ajuste manual</span>
        </div>
      </div>

      <BottomSheet
        open={!!diaSelecionado}
        onClose={() => setDiaSelecionado(null)}
        title={diaSelecionadoData ? format(diaSelecionadoData, "d 'de' MMMM", { locale: ptBR }) : ""}
        icon="today"
      >
        {diaSelecionadoData && (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                {FUNCAO_LABEL[funcao]}
              </span>
              <BadgeTipoDia tipo={tipoDiaDe(diaSelecionadoData)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
                Atribuir Soldado
              </label>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {ativosDoDia.length === 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant p-space-sm text-center">
                    Nenhum soldado ativo nesta função na data selecionada.
                  </p>
                )}
                {ativosDoDia.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={pending}
                    onClick={() => handleAtribuir(s.id)}
                    className={cn(
                      "flex items-center justify-between w-full p-3 rounded-lg text-left transition-colors disabled:opacity-60",
                      overrideAtual === s.id
                        ? "bg-primary-container text-on-primary-container"
                        : "hover:bg-surface-container-low"
                    )}
                  >
                    <span className="font-label-md text-label-md uppercase">
                      {abreviacaoPatente(s.patente)}. {s.nome_guerra}
                    </span>
                    {overrideAtual === s.id && <Icon name="check_circle" className="text-[18px]" />}
                  </button>
                ))}
              </div>
            </div>

            {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}

            {overrideAtual && (
              <button
                type="button"
                disabled={pending}
                onClick={handleRestaurar}
                className="w-full py-2.5 bg-surface-container text-on-surface font-label-md text-label-md uppercase rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Icon name="restart_alt" className="text-[18px]" />
                Restaurar Rodízio Automático
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
