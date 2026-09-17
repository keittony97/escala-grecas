import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getPerfilAtual } from "@/lib/data/perfil";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getPerfilAtual();

  if (!perfil) {
    redirect("/login");
  }

  return (
    <AppShell role={perfil.role} nomeGuerra={perfil.nome_guerra} fotoUrl={perfil.foto_url}>
      {children}
    </AppShell>
  );
}
