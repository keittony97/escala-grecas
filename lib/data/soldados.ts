import { createClient } from "@/lib/supabase/server";
import type { Soldado } from "@/types";

export async function getSoldadosAtivos(): Promise<Soldado[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("soldados")
    .select("*")
    .eq("ativo", true)
    .order("data_entrada", { ascending: true });
  return (data as Soldado[]) ?? [];
}

export async function getSoldadosInativos(): Promise<Soldado[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("soldados")
    .select("*")
    .eq("ativo", false)
    .order("data_saida", { ascending: false });
  return (data as Soldado[]) ?? [];
}

export async function getSoldadoPorId(id: string): Promise<Soldado | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("soldados").select("*").eq("id", id).single();
  return data as Soldado | null;
}

export async function getTodosSoldados(): Promise<Soldado[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("soldados")
    .select("*")
    .order("data_entrada", { ascending: true });
  return (data as Soldado[]) ?? [];
}
