import { startOfWeek, differenceInCalendarWeeks, getDay, parseISO, formatISO } from "date-fns";
import type { Funcao, TipoDia } from "@/types/database";
import type { Soldado } from "@/types";

/**
 * Motor de rodízio da Escala GRECAS.
 *
 * Dia PRETO (seg-sex): rotação semanal por deslocamento. Cada semana tem um
 * "offset" (índice da semana mod N) e os 5 slots de dia útil (seg..sex) são
 * preenchidos com soldiers[(offset + posicaoNaSemana) mod N]. Com N=5 isso
 * reproduz exatamente o caso descrito no enunciado (1 dia preto por semana,
 * por pessoa, girando qual dia da semana cada um pega). Com N<5, alguém
 * necessariamente pega mais de um dia preto na mesma semana (distribuído de
 * forma rotativa). Com N>5, alguns soldados ficam de folga a semana toda.
 *
 * Dia VERMELHO (sáb+dom): rotação direta 1-para-1 por final de semana —
 * cada fim de semana pertence a soldiers[semanaIndex mod N], garantindo que
 * cada soldado tire 1 fim de semana a cada N semanas.
 */

// Segunda-feira de referência (âncora fixa e arbitrária, anterior a qualquer
// soldado real do sistema) usada apenas para numerar semanas de forma estável.
const EPOCH_MONDAY = new Date(Date.UTC(2020, 0, 6));

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getWeekIndex(date: Date): number {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return differenceInCalendarWeeks(monday, EPOCH_MONDAY, { weekStartsOn: 1 });
}

/** posição do dia útil na semana: segunda=0 ... sexta=4; retorna -1 se for fim de semana */
export function getPosicaoDiaUtil(date: Date): number {
  const dow = getDay(date); // domingo=0 ... sábado=6
  if (dow === 0 || dow === 6) return -1;
  return dow - 1;
}

export function isFimDeSemana(date: Date): boolean {
  const dow = getDay(date);
  return dow === 0 || dow === 6;
}

export function ordenarSoldadosParaRodizio(soldados: Soldado[]): Soldado[] {
  return [...soldados].sort((a, b) => {
    if (a.data_entrada !== b.data_entrada) {
      return a.data_entrada < b.data_entrada ? -1 : 1;
    }
    return a.id < b.id ? -1 : 1;
  });
}

/** Soldado escalado num dia PRETO (seg-sex), dado a lista de ativos já ordenada. */
export function calcularSoldadoDiaPreto(
  soldadosAtivosOrdenados: Soldado[],
  date: Date
): Soldado | null {
  const n = soldadosAtivosOrdenados.length;
  if (n === 0) return null;
  const posicao = getPosicaoDiaUtil(date);
  if (posicao === -1) return null;
  const semana = getWeekIndex(date);
  const idx = mod(semana + posicao, n);
  return soldadosAtivosOrdenados[idx];
}

/** Soldado escalado num fim de semana VERMELHO (sábado ou domingo). */
export function calcularSoldadoDiaVermelho(
  soldadosAtivosOrdenados: Soldado[],
  date: Date
): Soldado | null {
  const n = soldadosAtivosOrdenados.length;
  if (n === 0) return null;
  if (!isFimDeSemana(date)) return null;
  const semana = getWeekIndex(date);
  const idx = mod(semana, n);
  return soldadosAtivosOrdenados[idx];
}

export function tipoDiaDe(date: Date): TipoDia {
  return isFimDeSemana(date) ? "vermelha" : "preta";
}

export interface AfastamentoPeriodo {
  soldado_id: string;
  data_inicio: string;
  data_fim: string;
}

/** Filtra soldados ativos numa função, considerando afastamentos vigentes na data. */
export function getAtivosNaData(
  soldados: Soldado[],
  afastamentos: AfastamentoPeriodo[],
  funcao: Funcao,
  date: Date
): Soldado[] {
  const iso = formatISO(date, { representation: "date" });
  const candidatos = soldados.filter((s) => {
    if (s.funcao !== funcao) return false;
    if (!s.ativo) return false;
    if (s.data_entrada > iso) return false;
    if (s.data_saida && s.data_saida <= iso) return false;
    return true;
  });

  const afastados = new Set(
    afastamentos
      .filter((a) => a.data_inicio <= iso && iso <= a.data_fim)
      .map((a) => a.soldado_id)
  );

  const ativos = candidatos.filter((s) => !afastados.has(s.id));
  return ordenarSoldadosParaRodizio(ativos);
}

/** Escalado do dia (preto ou vermelho) já considerando afastamentos. */
export function calcularEscaladoDoDia(
  soldados: Soldado[],
  afastamentos: AfastamentoPeriodo[],
  funcao: Funcao,
  date: Date
): { soldado: Soldado | null; tipoDia: TipoDia } {
  const tipoDia = tipoDiaDe(date);
  const ativosOrdenados = getAtivosNaData(soldados, afastamentos, funcao, date);
  const soldado =
    tipoDia === "preta"
      ? calcularSoldadoDiaPreto(ativosOrdenados, date)
      : calcularSoldadoDiaVermelho(ativosOrdenados, date);
  return { soldado, tipoDia };
}

export function parseDateOnly(iso: string): Date {
  return parseISO(iso);
}

export interface DiaEscalaCalculado {
  data: string;
  tipoDia: TipoDia;
  soldado: Soldado | null;
}

/** Gera a escala calculada (preto/vermelho) para cada dia de um intervalo [inicio, fim]. */
export function gerarEscalaPeriodo(
  soldados: Soldado[],
  afastamentos: AfastamentoPeriodo[],
  funcao: Funcao,
  inicio: Date,
  fim: Date
): DiaEscalaCalculado[] {
  const resultado: DiaEscalaCalculado[] = [];
  const cursor = new Date(inicio);
  while (cursor <= fim) {
    const { soldado, tipoDia } = calcularEscaladoDoDia(soldados, afastamentos, funcao, cursor);
    resultado.push({ data: formatISO(cursor, { representation: "date" }), tipoDia, soldado });
    cursor.setDate(cursor.getDate() + 1);
  }
  return resultado;
}
