"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tipoDiaDe, parseDateOnly } from "@/lib/escala/engine";
import type { Funcao } from "@/types/database";

function revalidarTudo() {
  revalidatePath("/escala");
  revalidatePath("/trocas");
  revalidatePath("/dashboard");
  revalidatePath("/historico");
}

/**
 * Organização manual da escala: o administrador define diretamente quem
 * cobre um dia de serviço, sobrepondo o rodízio automático. Fica registrado
 * em escalas_servico (status "troca") e passa a valer em toda a aplicação —
 * escala geral, dashboard e histórico — até ser removido.
 */
export async function definirEscalaManual(funcao: Funcao, data: string, soldadoId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("escalas_servico").upsert(
    {
      soldado_id: soldadoId,
      funcao,
      data,
      tipo_dia: tipoDiaDe(parseDateOnly(data)),
      status: "troca",
      observacao: "Ajuste manual pelo administrador",
    },
    { onConflict: "funcao,data" }
  );

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}

/** Remove o ajuste manual do dia, voltando a valer o rodízio automático. */
export async function removerEscalaManual(funcao: Funcao, data: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("escalas_servico")
    .delete()
    .eq("funcao", funcao)
    .eq("data", data)
    .eq("status", "troca");

  if (error) return { erro: error.message };

  revalidarTudo();
  return { erro: null };
}
