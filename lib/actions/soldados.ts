"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Funcao } from "@/types/database";

function revalidarTudo() {
  revalidatePath("/soldados");
  revalidatePath("/escala");
  revalidatePath("/historico");
  revalidatePath("/dashboard");
}

export async function criarSoldado(formData: FormData) {
  const supabase = await createClient();

  const nome_guerra = String(formData.get("nome_guerra") ?? "").trim();
  const nome_completo = String(formData.get("nome_completo") ?? "").trim() || null;
  const funcao = String(formData.get("funcao") ?? "") as Funcao;
  const data_entrada = String(formData.get("data_entrada") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!nome_guerra || !funcao || !data_entrada) {
    return { erro: "Preencha nome de guerra, função e data de entrada." };
  }

  const { error } = await supabase.from("soldados").insert({
    nome_guerra,
    nome_completo,
    funcao,
    data_entrada,
    observacao,
  });

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}

export async function atualizarSoldado(id: string, formData: FormData) {
  const supabase = await createClient();

  const nome_guerra = String(formData.get("nome_guerra") ?? "").trim();
  const nome_completo = String(formData.get("nome_completo") ?? "").trim() || null;
  const funcao = String(formData.get("funcao") ?? "") as Funcao;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  const { error } = await supabase
    .from("soldados")
    .update({ nome_guerra, nome_completo, funcao, observacao })
    .eq("id", id);

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}

export async function inativarSoldado(id: string, dataSaida: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("soldados")
    .update({ ativo: false, data_saida: dataSaida })
    .eq("id", id);

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}

export async function reativarSoldado(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("soldados")
    .update({ ativo: true, data_saida: null })
    .eq("id", id);

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}
