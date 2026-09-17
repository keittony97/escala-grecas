import { createClient } from "@/lib/supabase/server";
import type { Funcao, StatusEscala, TipoDia } from "@/types/database";

export interface EscalaServico {
  id: string;
  soldado_id: string;
  funcao: Funcao;
  data: string;
  tipo_dia: TipoDia;
  status: StatusEscala;
  observacao: string | null;
  criado_em: string;
}

export async function getEscalasPorSoldado(soldadoId: string): Promise<EscalaServico[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("escalas_servico")
    .select("*")
    .eq("soldado_id", soldadoId)
    .order("data", { ascending: false });
  return (data as EscalaServico[]) ?? [];
}

export async function getEscalasNoPeriodo(dataInicio: string, dataFim: string): Promise<EscalaServico[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("escalas_servico")
    .select("*")
    .gte("data", dataInicio)
    .lte("data", dataFim)
    .order("data", { ascending: true });
  return (data as EscalaServico[]) ?? [];
}
