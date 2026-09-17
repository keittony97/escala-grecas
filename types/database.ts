export type Funcao = "piscineiro" | "permanencia";
export type Role = "admin" | "comum";
export type TipoDia = "preta" | "vermelha";
export type StatusEscala = "normal" | "troca" | "ausencia" | "substituicao";
export type TipoAfastamento = "ferias" | "atestado" | "licenca" | "curso" | "dispensa";
export type StatusTroca = "pendente" | "compensado";

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          nome_completo: string;
          nome_guerra: string | null;
          foto_url: string | null;
          role: Role;
          criado_em: string;
        };
        Insert: {
          id: string;
          nome_completo: string;
          nome_guerra?: string | null;
          foto_url?: string | null;
          role: Role;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfis"]["Insert"]>;
        Relationships: [];
      };
      soldados: {
        Row: {
          id: string;
          nome_guerra: string;
          nome_completo: string | null;
          funcao: Funcao;
          ativo: boolean;
          data_entrada: string;
          data_saida: string | null;
          perfil_id: string | null;
          observacao: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome_guerra: string;
          nome_completo?: string | null;
          funcao: Funcao;
          ativo?: boolean;
          data_entrada: string;
          data_saida?: string | null;
          perfil_id?: string | null;
          observacao?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["soldados"]["Insert"]>;
        Relationships: [];
      };
      escalas_servico: {
        Row: {
          id: string;
          soldado_id: string;
          funcao: Funcao;
          data: string;
          tipo_dia: TipoDia;
          status: StatusEscala;
          observacao: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          soldado_id: string;
          funcao: Funcao;
          data: string;
          tipo_dia: TipoDia;
          status?: StatusEscala;
          observacao?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["escalas_servico"]["Insert"]>;
        Relationships: [];
      };
      afastamentos: {
        Row: {
          id: string;
          soldado_id: string;
          tipo: TipoAfastamento;
          data_inicio: string;
          data_fim: string;
          observacao: string | null;
          registrado_por: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          soldado_id: string;
          tipo: TipoAfastamento;
          data_inicio: string;
          data_fim: string;
          observacao?: string | null;
          registrado_por?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["afastamentos"]["Insert"]>;
        Relationships: [];
      };
      trocas_servico: {
        Row: {
          id: string;
          data_original: string;
          soldado_ausente_id: string;
          soldado_substituto_id: string;
          funcao: Funcao;
          motivo: string | null;
          data_compensacao: string | null;
          status: StatusTroca;
          registrado_por: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          data_original: string;
          soldado_ausente_id: string;
          soldado_substituto_id: string;
          funcao: Funcao;
          motivo?: string | null;
          data_compensacao?: string | null;
          status?: StatusTroca;
          registrado_por?: string | null;
          criado_em?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trocas_servico"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      vw_estatisticas_servico: {
        Row: {
          soldado_id: string;
          nome_guerra: string;
          funcao: Funcao;
          total_pretas: number;
          total_vermelhas: number;
          data: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
