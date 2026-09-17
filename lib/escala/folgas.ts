import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Soldado } from "@/types";
import type { EscalaServico } from "@/lib/data/escalas";

/**
 * Estimativa de dias de folga acumulados por soldado: dias corridos ativos
 * desde a entrada menos dias de serviço já tirados (vermelha conta 2, por
 * cobrir sábado+domingo). Usada apenas como heurística de sugestão de
 * substituto — quem tem mais folga acumulada é quem "deve" menos serviço.
 */
export function calcularFolgasAcumuladas(
  soldados: Soldado[],
  escalas: EscalaServico[],
  ate: Date = new Date()
): Map<string, number> {
  const servicosPorSoldado = new Map<string, number>();
  for (const e of escalas) {
    const atual = servicosPorSoldado.get(e.soldado_id) ?? 0;
    servicosPorSoldado.set(e.soldado_id, atual + (e.tipo_dia === "vermelha" ? 2 : 1));
  }

  const resultado = new Map<string, number>();
  for (const s of soldados) {
    const diasAtivo = Math.max(0, differenceInCalendarDays(ate, parseISO(s.data_entrada)) + 1);
    const servicos = servicosPorSoldado.get(s.id) ?? 0;
    resultado.set(s.id, diasAtivo - servicos);
  }
  return resultado;
}

/** Ordena os candidatos (ativos, excluindo o ausente) do maior para o menor acúmulo de folga. */
export function sugerirSubstitutos(
  soldadosAtivos: Soldado[],
  soldadoAusenteId: string,
  escalas: EscalaServico[]
): Soldado[] {
  const candidatos = soldadosAtivos.filter((s) => s.id !== soldadoAusenteId);
  const folgas = calcularFolgasAcumuladas(candidatos, escalas);
  return [...candidatos].sort((a, b) => (folgas.get(b.id) ?? 0) - (folgas.get(a.id) ?? 0));
}
