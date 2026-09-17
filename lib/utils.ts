import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function iniciais(nome: string): string {
  const limpo = nome.replace(/^sd\.?\s*/i, "").trim();
  const partes = limpo.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function nomeDiaSemana(date: Date): string {
  return DIAS_SEMANA[date.getDay()];
}

export function nomeMes(date: Date): string {
  return MESES[date.getMonth()];
}

/**
 * O Supabase Auth exige um e-mail como identificador de login, mas o sistema
 * usa apenas "nome de guerra + senha" — sem campo de e-mail em nenhuma tela.
 * Este domínio interno (não roteável) mapeia o nome de guerra digitado para
 * um e-mail sintético usado só internamente pelo Supabase Auth.
 */
const DOMINIO_LOGIN = "grecas.local";

/** Normaliza um nome de guerra em um identificador de usuário estável (sem acentos/espaços). */
export function normalizarUsuario(nomeGuerra: string): string {
  return nomeGuerra
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.-]/g, "");
}

export function emailSinteticoDeUsuario(nomeGuerra: string): string {
  return `${normalizarUsuario(nomeGuerra)}@${DOMINIO_LOGIN}`;
}
