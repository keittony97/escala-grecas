import { redirect } from "next/navigation";
import { getPerfilAtual } from "@/lib/data/perfil";
import { PerfilView } from "./perfil-view";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const perfil = await getPerfilAtual();

  if (!perfil) {
    redirect("/login");
  }

  return <PerfilView perfil={perfil} />;
}
