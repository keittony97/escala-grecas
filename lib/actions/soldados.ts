"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailSinteticoDeUsuario, PATENTES } from "@/lib/utils";
import type { Funcao } from "@/types/database";

function patenteValida(valor: string): boolean {
  return PATENTES.some((p) => p.value === valor);
}

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
  const patente = String(formData.get("patente") ?? "soldado");
  const funcao = String(formData.get("funcao") ?? "") as Funcao;
  const data_entrada = String(formData.get("data_entrada") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!nome_guerra || !funcao || !data_entrada) {
    return { erro: "Preencha nome de guerra, função e data de entrada." };
  }
  if (!patenteValida(patente)) {
    return { erro: "Selecione uma patente válida." };
  }

  const { error } = await supabase.from("soldados").insert({
    nome_guerra,
    nome_completo,
    patente,
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
  const patente = String(formData.get("patente") ?? "soldado");
  const funcao = String(formData.get("funcao") ?? "") as Funcao;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  if (!patenteValida(patente)) {
    return { erro: "Selecione uma patente válida." };
  }

  const { data: soldadoAtual, error: erroSoldadoAtual } = await supabase
    .from("soldados")
    .select("nome_guerra, perfil_id")
    .eq("id", id)
    .single();

  if (erroSoldadoAtual || !soldadoAtual) {
    return { erro: "Soldado não encontrado." };
  }

  // O login do soldado (quando ele tem acesso ao sistema) é derivado do
  // Nome de Guerra. Só o administrador chega a esta ação, então alterar o
  // Nome de Guerra aqui também deve atualizar o login correspondente.
  if (soldadoAtual.perfil_id && nome_guerra && nome_guerra !== soldadoAtual.nome_guerra) {
    const admin = createAdminClient();
    const novoEmail = emailSinteticoDeUsuario(nome_guerra);

    const { error: erroLogin } = await admin.auth.admin.updateUserById(soldadoAtual.perfil_id, {
      email: novoEmail,
      email_confirm: true,
    });

    if (erroLogin) {
      if (erroLogin.code === "email_exists") {
        return { erro: `Já existe um usuário com o login gerado a partir de "${nome_guerra}". Escolha outro nome de guerra.` };
      }
      return { erro: erroLogin.message };
    }

    const { error: erroPerfil } = await admin
      .from("perfis")
      .update({ nome_guerra, nome_completo: nome_completo ?? nome_guerra })
      .eq("id", soldadoAtual.perfil_id);

    if (erroPerfil) return { erro: erroPerfil.message };
  }

  const { error } = await supabase
    .from("soldados")
    .update({ nome_guerra, nome_completo, patente, funcao, observacao })
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
