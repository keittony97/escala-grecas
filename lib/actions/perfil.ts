"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailSinteticoDeUsuario, normalizarUsuario } from "@/lib/utils";

export async function atualizarMinhaSenha(senhaAtual: string, novaSenha: string) {
  if (novaSenha.length < 6) {
    return { erro: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { erro: "Sessão inválida. Entre novamente." };
  }

  const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  });
  if (erroSenhaAtual) {
    return { erro: "Senha atual incorreta." };
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { erro: error.message };

  return { erro: null };
}

export async function atualizarMeuLogin(novoUsuario: string, senhaAtual: string) {
  const usuario = normalizarUsuario(novoUsuario);
  if (!usuario) {
    return { erro: "Informe um nome de usuário válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { erro: "Sessão inválida. Entre novamente." };
  }

  const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  });
  if (erroSenhaAtual) {
    return { erro: "Senha atual incorreta." };
  }

  const novoEmail = emailSinteticoDeUsuario(usuario);
  if (novoEmail === user.email) {
    return { erro: null, usuario };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email: novoEmail,
    email_confirm: true,
  });

  if (error) {
    if (error.code === "email_exists") {
      return { erro: `Já existe um usuário "${usuario}". Escolha outro nome.` };
    }
    return { erro: error.message };
  }

  revalidatePath("/", "layout");
  return { erro: null, usuario };
}

export async function atualizarMinhaFoto(fotoUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { erro: "Sessão inválida. Entre novamente." };
  }

  const { error } = await supabase.from("perfis").update({ foto_url: fotoUrl }).eq("id", user.id);
  if (error) return { erro: error.message };

  revalidatePath("/", "layout");
  return { erro: null };
}
