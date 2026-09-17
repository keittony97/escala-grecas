"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tipoDiaDe, parseDateOnly } from "@/lib/escala/engine";
import type { Funcao } from "@/types/database";

function revalidarTudo() {
  revalidatePath("/trocas");
  revalidatePath("/escala");
  revalidatePath("/dashboard");
}

export async function criarTroca(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const soldado_ausente_id = String(formData.get("soldado_ausente_id") ?? "");
  const soldado_substituto_id = String(formData.get("soldado_substituto_id") ?? "");
  const funcao = String(formData.get("funcao") ?? "") as Funcao;
  const data_original = String(formData.get("data_original") ?? "");
  const data_compensacao = String(formData.get("data_compensacao") ?? "").trim() || null;
  const motivo = String(formData.get("motivo") ?? "").trim() || null;

  if (!soldado_ausente_id || !soldado_substituto_id || !funcao || !data_original) {
    return { erro: "Preencha soldado ausente, substituto, função e data original." };
  }
  if (soldado_ausente_id === soldado_substituto_id) {
    return { erro: "O substituto não pode ser o mesmo soldado ausente." };
  }

  const { error } = await supabase.from("trocas_servico").insert({
    soldado_ausente_id,
    soldado_substituto_id,
    funcao,
    data_original,
    data_compensacao,
    motivo,
    status: "pendente",
    registrado_por: user?.id ?? null,
  });

  if (error) return { erro: error.message };

  const { error: errEscala } = await supabase.from("escalas_servico").upsert(
    {
      soldado_id: soldado_substituto_id,
      funcao,
      data: data_original,
      tipo_dia: tipoDiaDe(parseDateOnly(data_original)),
      status: "substituicao",
      observacao: motivo,
    },
    { onConflict: "funcao,data" }
  );
  if (errEscala) return { erro: errEscala.message };

  revalidarTudo();
  return { erro: null };
}

export async function homologarTroca(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trocas_servico")
    .update({ status: "compensado", data_compensacao: new Date().toISOString().slice(0, 10) })
    .eq("id", id);

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}
