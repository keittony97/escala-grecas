import { getSoldadosAtivos } from "@/lib/data/soldados";
import { getTodosAfastamentos } from "@/lib/data/afastamentos";
import { AfastamentosView } from "./afastamentos-view";

export const dynamic = "force-dynamic";

export default async function AfastamentosPage() {
  const [soldados, afastamentos] = await Promise.all([
    getSoldadosAtivos(),
    getTodosAfastamentos(),
  ]);

  return <AfastamentosView soldados={soldados} afastamentos={afastamentos} />;
}
