import { getSoldadosInativos, getSoldadoPorId } from "@/lib/data/soldados";
import { getEscalasPorSoldado } from "@/lib/data/escalas";
import { getAfastamentosPorSoldado } from "@/lib/data/afastamentos";
import { getTrocasPorSoldado } from "@/lib/data/trocas";
import { construirTimeline } from "@/lib/historico/timeline";
import { HistoricoView } from "./historico-view";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const inativos = await getSoldadosInativos();

  const selecionadoId = params.id ?? inativos[0]?.id ?? null;

  const selecionado = selecionadoId
    ? params.id
      ? await getSoldadoPorId(selecionadoId)
      : inativos[0]
    : null;

  let timeline: ReturnType<typeof construirTimeline> = [];
  let totalPretas = 0;
  let totalVermelhas = 0;

  if (selecionado) {
    const [escalas, afastamentos, trocas] = await Promise.all([
      getEscalasPorSoldado(selecionado.id),
      getAfastamentosPorSoldado(selecionado.id),
      getTrocasPorSoldado(selecionado.id),
    ]);
    timeline = construirTimeline(selecionado.id, escalas, afastamentos, trocas);
    totalPretas = escalas.filter((e) => e.tipo_dia === "preta").length;
    totalVermelhas = escalas.filter((e) => e.tipo_dia === "vermelha").length;
  }

  return (
    <HistoricoView
      inativos={inativos}
      selecionado={selecionado}
      timeline={timeline}
      totalPretas={totalPretas}
      totalVermelhas={totalVermelhas}
    />
  );
}
