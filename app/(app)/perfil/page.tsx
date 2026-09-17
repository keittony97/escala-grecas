import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPerfilAtual } from "@/lib/data/perfil";
import { PerfilView } from "./perfil-view";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const perfil = await getPerfilAtual();

  if (!user || !perfil) {
    redirect("/login");
  }

  const usuarioAtual = user.email?.split("@")[0] ?? "";

  return <PerfilView perfil={perfil} usuarioAtual={usuarioAtual} />;
}
