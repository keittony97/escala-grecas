import { getSoldadosAtivos } from "@/lib/data/soldados";
import { SoldadosView } from "./soldados-view";

export const dynamic = "force-dynamic";

export default async function SoldadosPage() {
  const soldados = await getSoldadosAtivos();

  return <SoldadosView soldadosIniciais={soldados} />;
}
