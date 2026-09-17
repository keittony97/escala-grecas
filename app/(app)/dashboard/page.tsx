import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, formatISO } from "date-fns";
import { getTodosSoldados, getSoldadosAtivos } from "@/lib/data/soldados";
import { getEscalasNoPeriodo } from "@/lib/data/escalas";
import { getAfastamentosNoPeriodo, getAfastamentosVigentesEFuturos } from "@/lib/data/afastamentos";
import { getTrocasNoPeriodo } from "@/lib/data/trocas";
import { DashboardView } from "./dashboard-view";
import type { Funcao } from "@/types/database";

export const dynamic = "force-dynamic";

function calcularIntervalo(preset: string | undefined, inicioParam?: string, fimParam?: string) {
  if (inicioParam && fimParam) {
    return { inicio: inicioParam, fim: fimParam };
  }
  const hoje = new Date();
  let inicio: Date;
  let fim: Date;
  switch (preset) {
    case "semana":
      inicio = startOfWeek(hoje, { weekStartsOn: 1 });
      fim = endOfWeek(hoje, { weekStartsOn: 1 });
      break;
    case "ano":
      inicio = startOfYear(hoje);
      fim = endOfYear(hoje);
      break;
    case "mes":
    default:
      inicio = startOfMonth(hoje);
      fim = endOfMonth(hoje);
      break;
  }
  return {
    inicio: formatISO(inicio, { representation: "date" }),
    fim: formatISO(fim, { representation: "date" }),
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const preset = params.preset ?? "mes";
  const { inicio, fim } = calcularIntervalo(preset, params.inicio, params.fim);

  const [todosSoldados, soldadosAtivos, escalas, afastamentos, trocas, afastamentosAtuais] = await Promise.all([
    getTodosSoldados(),
    getSoldadosAtivos(),
    getEscalasNoPeriodo(inicio, fim),
    getAfastamentosNoPeriodo(inicio, fim),
    getTrocasNoPeriodo(inicio, fim),
    getAfastamentosVigentesEFuturos(),
  ]);

  const soldadosPorId = new Map(todosSoldados.map((s) => [s.id, s]));

  const rankingPorFuncao: Record<Funcao, { soldado: (typeof todosSoldados)[number]; total: number }[]> = {
    piscineiro: [],
    permanencia: [],
  };

  for (const funcao of ["piscineiro", "permanencia"] as Funcao[]) {
    const contagem = new Map<string, number>();
    for (const e of escalas) {
      if (e.funcao !== funcao) continue;
      contagem.set(e.soldado_id, (contagem.get(e.soldado_id) ?? 0) + 1);
    }
    rankingPorFuncao[funcao] = [...contagem.entries()]
      .map(([soldadoId, total]) => ({ soldado: soldadosPorId.get(soldadoId)!, total }))
      .filter((r) => r.soldado)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  // Req #25: ranking de soldados por QUANTIDADE de atestados/afastamentos no período
  // (não pela duração) — agrupa por soldado, mantendo o total de dias como métrica auxiliar.
  const afastamentosPorSoldado = new Map<
    string,
    { soldado: (typeof todosSoldados)[number]; quantidade: number; totalDias: number }
  >();
  for (const a of afastamentos) {
    const soldado = soldadosPorId.get(a.soldado_id);
    if (!soldado) continue;
    const inicioMs = new Date(a.data_inicio).getTime();
    const fimMs = new Date(a.data_fim).getTime();
    const dias = Math.round((fimMs - inicioMs) / 86400000) + 1;
    const atual = afastamentosPorSoldado.get(soldado.id) ?? { soldado, quantidade: 0, totalDias: 0 };
    atual.quantidade += 1;
    atual.totalDias += dias;
    afastamentosPorSoldado.set(soldado.id, atual);
  }
  const rankingAfastamentos = [...afastamentosPorSoldado.values()]
    .sort((a, b) => b.quantidade - a.quantidade || b.totalDias - a.totalDias)
    .slice(0, 8);

  const totalPretas = escalas.filter((e) => e.tipo_dia === "preta").length;
  const totalVermelhas = escalas.filter((e) => e.tipo_dia === "vermelha").length;

  const hoje = formatISO(new Date(), { representation: "date" });
  const afastadosHojeIds = new Set(
    afastamentosAtuais.filter((a) => a.data_inicio <= hoje && hoje <= a.data_fim).map((a) => a.soldado_id)
  );
  const prontidao =
    soldadosAtivos.length > 0
      ? ((soldadosAtivos.length - afastadosHojeIds.size) / soldadosAtivos.length) * 100
      : 100;

  return (
    <DashboardView
      preset={preset}
      inicio={inicio}
      fim={fim}
      totalTurnos={escalas.length}
      totalPretas={totalPretas}
      totalVermelhas={totalVermelhas}
      prontidao={prontidao}
      totalTrocas={trocas.length}
      rankingPorFuncao={rankingPorFuncao}
      rankingAfastamentos={rankingAfastamentos}
    />
  );
}
