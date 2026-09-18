import { startOfWeek, startOfMonth, endOfMonth, addDays, eachDayOfInterval, formatISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getTodosSoldados } from "@/lib/data/soldados";
import { getAfastamentosVigentesEFuturos } from "@/lib/data/afastamentos";
import { getTodasTrocas } from "@/lib/data/trocas";
import { getOverridesManuais } from "@/lib/data/escalas";
import { getPerfilAtual } from "@/lib/data/perfil";
import {
  getAtivosNaData,
  gerarEscalaPeriodo,
  calcularEscaladoDoDia,
  aplicarOverrides,
  parseDateOnly,
  type OverrideEscala,
} from "@/lib/escala/engine";
import { EscalaView, type SoldadoComDias } from "./escala-view";
import type { Funcao } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EscalaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; start?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "mes" ? "mes" : "semana";
  const startParam = params.start ? parseDateOnly(params.start) : new Date();

  const inicio =
    view === "semana"
      ? startOfWeek(startParam, { weekStartsOn: 1 })
      : startOfMonth(startParam);
  const fim = view === "semana" ? addDays(inicio, 6) : endOfMonth(inicio);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [todosSoldados, afastamentos, trocas, perfil, overridesManuais] = await Promise.all([
    getTodosSoldados(),
    getAfastamentosVigentesEFuturos(),
    getTodasTrocas(),
    getPerfilAtual(),
    getOverridesManuais(),
  ]);

  const meuSoldado = todosSoldados.find((s) => s.perfil_id === user?.id) ?? null;
  const soldadosPorId = new Map(todosSoldados.map((s) => [s.id, s]));
  const overrides: OverrideEscala[] = overridesManuais.map((o) => ({
    funcao: o.funcao,
    data: o.data,
    soldado_id: o.soldado_id,
  }));

  const funcoes: Funcao[] = ["piscineiro", "permanencia"];
  const porFuncao: Record<Funcao, SoldadoComDias[]> = { piscineiro: [], permanencia: [] };

  const hojeISO = formatISO(new Date(), { representation: "date" });
  const hojeCalc: Record<Funcao, ReturnType<typeof calcularEscaladoDoDia>> = {
    piscineiro: aplicarOverrides(
      [{ ...calcularEscaladoDoDia(todosSoldados, afastamentos, "piscineiro", new Date()), data: hojeISO }],
      overrides,
      "piscineiro",
      soldadosPorId
    )[0],
    permanencia: aplicarOverrides(
      [{ ...calcularEscaladoDoDia(todosSoldados, afastamentos, "permanencia", new Date()), data: hojeISO }],
      overrides,
      "permanencia",
      soldadosPorId
    )[0],
  };

  const diasDoPeriodo = eachDayOfInterval({ start: inicio, end: fim });

  for (const funcao of funcoes) {
    // União dos ativos em CADA dia do período — não só no primeiro dia — para
    // que um soldado que entrou/saiu no meio da semana/mês ainda apareça no
    // roster com os dias em que de fato esteve ativo.
    const ativosPorId = new Map<string, (typeof todosSoldados)[number]>();
    for (const dia of diasDoPeriodo) {
      for (const s of getAtivosNaData(todosSoldados, afastamentos, funcao, dia)) {
        ativosPorId.set(s.id, s);
      }
    }
    const ativos = [...ativosPorId.values()].sort((a, b) =>
      a.data_entrada < b.data_entrada ? -1 : a.data_entrada > b.data_entrada ? 1 : 0
    );
    const diasCalcBase = gerarEscalaPeriodo(todosSoldados, afastamentos, funcao, inicio, fim);
    const diasCalc = aplicarOverrides(diasCalcBase, overrides, funcao, soldadosPorId);

    porFuncao[funcao] = ativos.map((soldado) => ({
      ...soldado,
      diasEscalados: diasCalc
        .filter((d) => d.soldado?.id === soldado.id)
        .map((d) => ({ data: d.data, tipoDia: d.tipoDia, manual: d.manual ?? false })),
    }));
  }

  const trocasNoPeriodo = trocas.filter((t) => {
    const iso = formatISO(inicio, { representation: "date" });
    const isoFim = formatISO(fim, { representation: "date" });
    return t.data_original >= iso && t.data_original <= isoFim;
  });

  return (
    <EscalaView
      view={view}
      inicioISO={formatISO(inicio, { representation: "date" })}
      fimISO={formatISO(fim, { representation: "date" })}
      porFuncao={porFuncao}
      hoje={hojeCalc}
      meuSoldadoId={meuSoldado?.id ?? null}
      isAdmin={perfil?.role === "admin"}
      totalEscalados={porFuncao.piscineiro.length + porFuncao.permanencia.length}
      trocasNoPeriodo={trocasNoPeriodo.length}
      todosSoldados={todosSoldados}
      afastamentos={afastamentos}
      overridesManuais={overrides}
    />
  );
}
