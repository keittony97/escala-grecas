"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TipoAfastamento } from "@/types/database";

export async function criarAfastamento(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const soldado_id = String(formData.get("soldado_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoAfastamento;
  const data_inicio = String(formData.get("data_inicio") ?? "");
  const data_fim = String(formData.get("data_fim") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!soldado_id || !tipo || !data_inicio || !data_fim) {
    return { erro: "Preencha militar, tipo e período do afastamento." };
  }
  if (data_fim < data_inicio) {
    return { erro: "A data de término não pode ser anterior à data de início." };
  }

  const { error } = await supabase.from("afastamentos").insert({
    soldado_id,
    tipo,
    data_inicio,
    data_fim,
    observacao,
    registrado_por: user?.id ?? null,
  });

  if (error) return { erro: error.message };

  revalidatePath("/afastamentos");
  revalidatePath("/escala");
  revalidatePath("/dashboard");
  return { erro: null };
}
