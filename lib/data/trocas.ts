import { createClient } from "@/lib/supabase/server";
import type { Funcao, StatusTroca } from "@/types/database";

export interface Troca {
  id: string;
  data_original: string;
  soldado_ausente_id: string;
  soldado_substituto_id: string;
  funcao: Funcao;
  motivo: string | null;
  data_compensacao: string | null;
  status: StatusTroca;
  registrado_por: string | null;
  criado_em: string;
}

export async function getTodasTrocas(): Promise<Troca[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trocas_servico")
    .select("*")
    .order("criado_em", { ascending: false });
  return (data as Troca[]) ?? [];
}

export async function getTrocasNoPeriodo(dataInicio: string, dataFim: string): Promise<Troca[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trocas_servico")
    .select("*")
    .gte("data_original", dataInicio)
    .lte("data_original", dataFim)
    .order("data_original", { ascending: false });
  return (data as Troca[]) ?? [];
}

export async function getTrocasPorSoldado(soldadoId: string): Promise<Troca[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trocas_servico")
    .select("*")
    .or(`soldado_ausente_id.eq.${soldadoId},soldado_substituto_id.eq.${soldadoId}`)
    .order("data_original", { ascending: false });
  return (data as Troca[]) ?? [];
}
