-- Escala GRECAS — schema inicial + RLS
-- 6º BEC / Roraima — Piscineiro e Permanência

create extension if not exists "pgcrypto";

-- =========================================================
-- Tabelas
-- =========================================================

create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  nome_guerra text,
  foto_url text,
  role text not null check (role in ('admin', 'comum')),
  criado_em timestamptz default now()
);

create table if not exists soldados (
  id uuid primary key default gen_random_uuid(),
  nome_guerra text not null,
  nome_completo text,
  funcao text not null check (funcao in ('piscineiro', 'permanencia')),
  ativo boolean default true,
  data_entrada date not null,
  data_saida date,
  perfil_id uuid references perfis(id),
  observacao text,
  criado_em timestamptz default now()
);

create table if not exists escalas_servico (
  id uuid primary key default gen_random_uuid(),
  soldado_id uuid not null references soldados(id),
  funcao text not null check (funcao in ('piscineiro', 'permanencia')),
  data date not null,
  tipo_dia text not null check (tipo_dia in ('preta', 'vermelha')),
  status text default 'normal' check (status in ('normal', 'troca', 'ausencia', 'substituicao')),
  observacao text,
  criado_em timestamptz default now(),
  unique (funcao, data)
);

create table if not exists afastamentos (
  id uuid primary key default gen_random_uuid(),
  soldado_id uuid not null references soldados(id),
  tipo text not null check (tipo in ('ferias', 'atestado', 'licenca', 'curso', 'dispensa')),
  data_inicio date not null,
  data_fim date not null,
  observacao text,
  registrado_por uuid references perfis(id),
  criado_em timestamptz default now(),
  constraint afastamento_periodo_valido check (data_fim >= data_inicio)
);

create table if not exists trocas_servico (
  id uuid primary key default gen_random_uuid(),
  data_original date not null,
  soldado_ausente_id uuid not null references soldados(id),
  soldado_substituto_id uuid not null references soldados(id),
  funcao text not null check (funcao in ('piscineiro', 'permanencia')),
  motivo text,
  data_compensacao date,
  status text default 'pendente' check (status in ('pendente', 'compensado')),
  registrado_por uuid references perfis(id),
  criado_em timestamptz default now()
);

create index if not exists idx_soldados_funcao_ativo on soldados (funcao, ativo);
create index if not exists idx_escalas_soldado on escalas_servico (soldado_id);
create index if not exists idx_escalas_funcao_data on escalas_servico (funcao, data);
create index if not exists idx_afastamentos_soldado on afastamentos (soldado_id);
create index if not exists idx_afastamentos_periodo on afastamentos (data_inicio, data_fim);
create index if not exists idx_trocas_ausente on trocas_servico (soldado_ausente_id);
create index if not exists idx_trocas_substituto on trocas_servico (soldado_substituto_id);

-- =========================================================
-- Função auxiliar: papel do usuário autenticado
-- =========================================================

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from perfis where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- View de estatísticas (somente admin — is_admin() na própria view
-- garante zero linhas para não-admins independente de RLS das tabelas base)
-- =========================================================

create or replace view vw_estatisticas_servico as
select
  s.id as soldado_id,
  s.nome_guerra,
  s.funcao,
  count(es.id) filter (where es.tipo_dia = 'preta') as total_pretas,
  count(es.id) filter (where es.tipo_dia = 'vermelha') as total_vermelhas,
  es.data
from soldados s
left join escalas_servico es on es.soldado_id = s.id
where is_admin()
group by s.id, s.nome_guerra, s.funcao, es.data;

-- =========================================================
-- RLS
-- =========================================================

alter table perfis enable row level security;
alter table soldados enable row level security;
alter table escalas_servico enable row level security;
alter table afastamentos enable row level security;
alter table trocas_servico enable row level security;

-- perfis: usuário lê a própria linha; admin lê todas
drop policy if exists perfis_select_propria on perfis;
create policy perfis_select_propria on perfis
  for select using (id = auth.uid() or is_admin());

drop policy if exists perfis_update_propria on perfis;
create policy perfis_update_propria on perfis
  for update using (id = auth.uid() or is_admin());

drop policy if exists perfis_admin_insert on perfis;
create policy perfis_admin_insert on perfis
  for insert with check (is_admin() or id = auth.uid());

drop policy if exists perfis_admin_delete on perfis;
create policy perfis_admin_delete on perfis
  for delete using (is_admin());

-- soldados: SELECT liberado a autenticados; escrita restrita a admin
drop policy if exists soldados_select_autenticados on soldados;
create policy soldados_select_autenticados on soldados
  for select using (auth.role() = 'authenticated');

drop policy if exists soldados_admin_insert on soldados;
create policy soldados_admin_insert on soldados
  for insert with check (is_admin());

drop policy if exists soldados_admin_update on soldados;
create policy soldados_admin_update on soldados
  for update using (is_admin());

drop policy if exists soldados_admin_delete on soldados;
create policy soldados_admin_delete on soldados
  for delete using (is_admin());

-- escalas_servico
drop policy if exists escalas_select_autenticados on escalas_servico;
create policy escalas_select_autenticados on escalas_servico
  for select using (auth.role() = 'authenticated');

drop policy if exists escalas_admin_insert on escalas_servico;
create policy escalas_admin_insert on escalas_servico
  for insert with check (is_admin());

drop policy if exists escalas_admin_update on escalas_servico;
create policy escalas_admin_update on escalas_servico
  for update using (is_admin());

drop policy if exists escalas_admin_delete on escalas_servico;
create policy escalas_admin_delete on escalas_servico
  for delete using (is_admin());

-- afastamentos
drop policy if exists afastamentos_select_autenticados on afastamentos;
create policy afastamentos_select_autenticados on afastamentos
  for select using (auth.role() = 'authenticated');

drop policy if exists afastamentos_admin_insert on afastamentos;
create policy afastamentos_admin_insert on afastamentos
  for insert with check (is_admin());

drop policy if exists afastamentos_admin_update on afastamentos;
create policy afastamentos_admin_update on afastamentos
  for update using (is_admin());

drop policy if exists afastamentos_admin_delete on afastamentos;
create policy afastamentos_admin_delete on afastamentos
  for delete using (is_admin());

-- trocas_servico
drop policy if exists trocas_select_autenticados on trocas_servico;
create policy trocas_select_autenticados on trocas_servico
  for select using (auth.role() = 'authenticated');

drop policy if exists trocas_admin_insert on trocas_servico;
create policy trocas_admin_insert on trocas_servico
  for insert with check (is_admin());

drop policy if exists trocas_admin_update on trocas_servico;
create policy trocas_admin_update on trocas_servico
  for update using (is_admin());

drop policy if exists trocas_admin_delete on trocas_servico;
create policy trocas_admin_delete on trocas_servico
  for delete using (is_admin());

grant select on vw_estatisticas_servico to authenticated;
