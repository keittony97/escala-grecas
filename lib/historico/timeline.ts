import type { EscalaServico } from "@/lib/data/escalas";
import type { Afastamento } from "@/lib/data/afastamentos";
import type { Troca } from "@/lib/data/trocas";

export interface EventoTimeline {
  data: string;
  titulo: string;
  tag: string;
  icon: string;
  corClasses: string;
  detalhe: string;
}

const TIPO_AFASTAMENTO_LABEL: Record<string, string> = {
  ferias: "Férias",
  atestado: "Atestado Médico",
  licenca: "Licença Especial",
  curso: "Curso Externo",
  dispensa: "Dispensa",
};

export function construirTimeline(
  soldadoId: string,
  escalas: EscalaServico[],
  afastamentos: Afastamento[],
  trocas: Troca[]
): EventoTimeline[] {
  const eventos: EventoTimeline[] = [];

  for (const e of escalas) {
    eventos.push({
      data: e.data,
      titulo: "Serviço Cumprido",
      tag: e.tipo_dia === "preta" ? "Dia Preto" : "Dia Vermelho",
      icon: e.tipo_dia === "preta" ? "verified" : "shield",
      corClasses:
        e.tipo_dia === "preta"
          ? "bg-inverse-surface text-inverse-on-surface"
          : "bg-tertiary text-on-tertiary",
      detalhe: e.observacao ?? (e.status === "substituicao" ? "Assumiu por substituição" : "Guarnição de serviço"),
    });
  }

  for (const a of afastamentos) {
    eventos.push({
      data: a.data_inicio,
      titulo: `Afastamento • ${TIPO_AFASTAMENTO_LABEL[a.tipo] ?? a.tipo}`,
      tag: "Regulamentar",
      icon: "beach_access",
      corClasses: "bg-secondary-container text-on-secondary-container",
      detalhe: a.observacao ?? `${a.data_inicio} a ${a.data_fim}`,
    });
  }

  for (const t of trocas) {
    const souAusente = t.soldado_ausente_id === soldadoId;
    eventos.push({
      data: t.data_original,
      titulo: souAusente ? "Troca solicitada" : "Assumiu troca de colega",
      tag: t.status === "compensado" ? "Compensada" : "Pendente",
      icon: "swap_horiz",
      corClasses:
        t.status === "compensado"
          ? "bg-primary text-on-primary"
          : "bg-secondary-container text-on-secondary-container",
      detalhe: t.motivo ?? "Sem observação registrada",
    });
  }

  return eventos.sort((a, b) => (a.data < b.data ? 1 : -1));
}
