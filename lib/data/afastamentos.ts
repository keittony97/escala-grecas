import { createClient } from "@/lib/supabase/server";
import type { AfastamentoPeriodo } from "@/lib/escala/engine";
import type { TipoAfastamento } from "@/types/database";

export interface Afastamento extends AfastamentoPeriodo {
  id: string;
  tipo: TipoAfastamento;
  observacao: string | null;
  criado_em: string;
}

export async function getAfastamentosVigentesEFuturos(): Promise<Afastamento[]> {
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("afastamentos")
    .select("*")
    .gte("data_fim", hoje)
    .order("data_inicio", { ascending: true });
  return (data as Afastamento[]) ?? [];
}

export async function getAfastamentosNoPeriodo(dataInicio: string, dataFim: string): Promise<Afastamento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("afastamentos")
    .select("*")
    .lte("data_inicio", dataFim)
    .gte("data_fim", dataInicio)
    .order("data_inicio", { ascending: false });
  return (data as Afastamento[]) ?? [];
}

export async function getTodosAfastamentos(): Promise<Afastamento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("afastamentos")
    .select("*")
    .order("data_inicio", { ascending: false });
  return (data as Afastamento[]) ?? [];
}

export async function getAfastamentosPorSoldado(soldadoId: string): Promise<Afastamento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("afastamentos")
    .select("*")
    .eq("soldado_id", soldadoId)
    .order("data_inicio", { ascending: false });
  return (data as Afastamento[]) ?? [];
}
