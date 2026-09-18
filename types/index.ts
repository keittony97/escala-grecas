export type {
  Funcao,
  Role,
  TipoDia,
  StatusEscala,
  TipoAfastamento,
  StatusTroca,
} from "./database";

import type { Funcao, TipoDia, StatusEscala } from "./database";

export interface Perfil {
  id: string;
  nome_completo: string;
  nome_guerra: string | null;
  foto_url: string | null;
  role: "admin" | "comum";
  criado_em: string;
}

export interface Soldado {
  id: string;
  nome_guerra: string;
  nome_completo: string | null;
  patente: string;
  funcao: Funcao;
  ativo: boolean;
  data_entrada: string;
  data_saida: string | null;
  perfil_id: string | null;
  observacao: string | null;
  criado_em: string;
}

export interface DiaEscala {
  data: string;
  diaSemana: number;
  tipoDia: TipoDia;
  soldado: Soldado | null;
  status: StatusEscala;
  escalaId: string | null;
}

export interface SoldadoComFolgas extends Soldado {
  diasFolgaAcumulados: number;
  totalPretas: number;
  totalVermelhas: number;
}
