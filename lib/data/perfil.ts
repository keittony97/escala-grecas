import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/types";

export async function getPerfilAtual(): Promise<Perfil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("perfis").select("*").eq("id", user.id).single();
  return data as Perfil | null;
}
