import { subDays, formatISO } from "date-fns";
import { getSoldadosAtivos } from "@/lib/data/soldados";
import { getTodasTrocas } from "@/lib/data/trocas";
import { getEscalasNoPeriodo } from "@/lib/data/escalas";
import { TrocasView } from "./trocas-view";

export const dynamic = "force-dynamic";

export default async function TrocasPage() {
  const inicio = formatISO(subDays(new Date(), 365), { representation: "date" });
  const fim = formatISO(new Date(), { representation: "date" });

  const [soldados, trocas, escalas] = await Promise.all([
    getSoldadosAtivos(),
    getTodasTrocas(),
    getEscalasNoPeriodo(inicio, fim),
  ]);

  return <TrocasView soldados={soldados} trocas={trocas} escalas={escalas} />;
}
