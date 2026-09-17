"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailSinteticoDeUsuario, normalizarUsuario } from "@/lib/utils";

export async function criarAcessoSoldado(soldadoId: string, senha: string) {
  if (senha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data: soldado, error: erroSoldado } = await supabase
    .from("soldados")
    .select("*")
    .eq("id", soldadoId)
    .single();

  if (erroSoldado || !soldado) {
    return { erro: "Soldado não encontrado." };
  }
  if (soldado.perfil_id) {
    return { erro: "Este soldado já possui acesso ao sistema." };
  }

  const usuario = normalizarUsuario(soldado.nome_guerra);
  if (!usuario) {
    return { erro: "Nome de guerra inválido para gerar um usuário de login." };
  }
  const email = emailSinteticoDeUsuario(soldado.nome_guerra);

  const admin = createAdminClient();
  const { data: novoUsuario, error: erroCriacao } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome_completo: soldado.nome_completo ?? soldado.nome_guerra,
      nome_guerra: soldado.nome_guerra,
    },
  });

  if (erroCriacao || !novoUsuario.user) {
    if (erroCriacao?.code === "email_exists") {
      return {
        erro: `Já existe um usuário "${usuario}". Tente um nome de guerra diferente ou peça para um administrador redefinir a senha existente.`,
      };
    }
    return { erro: erroCriacao?.message ?? "Falha ao criar o usuário." };
  }

  const { error: erroPerfil } = await admin.from("perfis").insert({
    id: novoUsuario.user.id,
    nome_completo: soldado.nome_completo ?? soldado.nome_guerra,
    nome_guerra: soldado.nome_guerra,
    role: "comum",
  });

  if (erroPerfil) {
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return { erro: erroPerfil.message };
  }

  const { error: erroVinculo } = await admin
    .from("soldados")
    .update({ perfil_id: novoUsuario.user.id })
    .eq("id", soldadoId);

  if (erroVinculo) {
    return { erro: erroVinculo.message };
  }

  revalidatePath("/soldados");
  revalidatePath("/escala");
  return { erro: null, usuario };
}

export async function redefinirSenhaSoldado(soldadoId: string, novaSenha: string) {
  if (novaSenha.length < 6) {
    return { erro: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data: soldado, error: erroSoldado } = await supabase
    .from("soldados")
    .select("perfil_id")
    .eq("id", soldadoId)
    .single();

  if (erroSoldado || !soldado?.perfil_id) {
    return { erro: "Este soldado ainda não possui acesso ao sistema." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(soldado.perfil_id, {
    password: novaSenha,
  });

  if (error) return { erro: error.message };

  return { erro: null };
}
