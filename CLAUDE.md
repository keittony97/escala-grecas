# Escala GRECAS

Você é um desenvolvedor senior. Implemente o sistema Escala GRECAS do zero.
Stack: Next.js 14+ App Router + TypeScript + Tailwind + Supabase + PWA.
Não me explique — apenas implemente.

## Sistema

Escala GRECAS é um sistema de gestão da escala de serviço dos soldados do
6º BEC de Roraima que atuam no clube de laser GRECAS. Existem duas funções
de serviço por dia: **Piscineiro** (segurança/manutenção da piscina) e
**Permanência** (controle de entrada de pessoas no estabelecimento).

A escala segue um rodízio: quando há, por exemplo, 5 soldados ativos numa
função, cada um tira 1 dia "preto" (segunda a sexta) por semana e folga os
outros 4 dias úteis daquela semana. No fim de semana, cada um tira 1 dia
"vermelho" (sábado + domingo, os dois dias seguidos) a cada N semanas, onde
N é o número de soldados ativos naquela função — os demais fins de semana
ficam de folga. O número de soldados ativos em cada função varia com
frequência (entrada, saída, férias, afastamento, atestado), e a escala das
semanas seguintes precisa ser recalculada automaticamente sempre que o
efetivo muda.

Quando um soldado se ausenta em um dia que era dele, quem estiver com mais
dias de folga acumulados assume o serviço no lugar dele; depois, o soldado
que se ausentou deve cobrir, em uma data futura, o serviço de quem o
substituiu. Essa troca fica registrada.

Todo o histórico de quem já tirou serviço deve ser preservado, mesmo depois
que o soldado sai do serviço — ele só some da visão padrão (ativos), mas
seus registros continuam consultáveis pelo administrador.

Existem dois perfis de acesso:
- **Administrador** (Erivan Arraiz): acesso total — cadastro de soldados,
  registro de férias/afastamento/atestado, registro de trocas, histórico de
  inativos e o dashboard de estatísticas. Deve aparecer destacado na
  interface com uma imagem de soldado batendo continência e o texto
  "Em caso de dúvida ou solicitação de alterações na escala, falar com
  Erivan Arraiz".
- **Usuário comum** (soldado): vê a escala geral completa (Piscineiro e
  Permanência de todos os soldados ativos), com um filtro/toggle
  "Apenas minha escala" para ver só os próprios dias. Não tem acesso ao
  dashboard nem às telas administrativas.

Tema visual: **quartel militar**, com o nome "GRECAS" (Escala GRECAS) em
destaque no cabeçalho/tela inicial. Interface deve funcionar bem tanto no
navegador quanto como app instalável no celular (PWA).

## Banco de Dados (Supabase)

```sql
-- Perfis de acesso (vinculado ao auth.users do Supabase)
create table perfis (
  id uuid primary key references auth.users(id),
  nome_completo text not null,
  nome_guerra text,
  foto_url text,
  role text not null check (role in ('admin', 'comum')),
  criado_em timestamptz default now()
);

-- Pessoas que entram na escala (podem ou não ter login vinculado)
create table soldados (
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

-- Cada dia de serviço tirado (histórico completo, nunca apagado)
create table escalas_servico (
  id uuid primary key default gen_random_uuid(),
  soldado_id uuid not null references soldados(id),
  funcao text not null check (funcao in ('piscineiro', 'permanencia')),
  data date not null,
  tipo_dia text not null check (tipo_dia in ('preta', 'vermelha')),
  status text default 'normal' check (status in ('normal', 'troca', 'ausencia', 'substituicao')),
  observacao text,
  criado_em timestamptz default now()
);

-- Férias, atestados, licenças, cursos, dispensas
create table afastamentos (
  id uuid primary key default gen_random_uuid(),
  soldado_id uuid not null references soldados(id),
  tipo text not null check (tipo in ('ferias', 'atestado', 'licenca', 'curso', 'dispensa')),
  data_inicio date not null,
  data_fim date not null,
  observacao text,
  registrado_por uuid references perfis(id),
  criado_em timestamptz default now()
);

-- Trocas / substituições de serviço
create table trocas_servico (
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

-- View de estatísticas para o dashboard (somente admin)
create view vw_estatisticas_servico as
select
  s.id as soldado_id,
  s.nome_guerra,
  s.funcao,
  count(es.id) filter (where es.tipo_dia = 'preta') as total_pretas,
  count(es.id) filter (where es.tipo_dia = 'vermelha') as total_vermelhas,
  es.data
from soldados s
left join escalas_servico es on es.soldado_id = s.id
group by s.id, s.nome_guerra, s.funcao, es.data;
```

**RLS (Row Level Security):**
- `perfis`: usuário lê apenas a própria linha; admin lê todas.
- `soldados`, `escalas_servico`, `afastamentos`, `trocas_servico`:
  **SELECT liberado para qualquer usuário autenticado** (todos veem a
  escala geral); **INSERT/UPDATE/DELETE restrito a `role = 'admin'`**.
- `vw_estatisticas_servico`: SELECT restrito a `role = 'admin'`.

## Requisitos Funcionais

```
Módulo: Autenticação e Perfis
1. O sistema deve permitir login com usuário/e-mail e senha.
2. O sistema deve ter dois perfis de acesso: administrador e usuário comum.
3. O sistema deve destacar o administrador (Erivan Arraiz) com uma imagem
   de soldado batendo continência e o texto "Em caso de dúvida ou
   solicitação de alterações na escala, falar com Erivan Arraiz".

Módulo: Soldados
4. O administrador deve poder cadastrar soldados com nome, função
   (Piscineiro/Permanência) e data de entrada.
5. O administrador deve poder editar os dados de um soldado.
6. O administrador deve poder marcar um soldado como inativo (saída do
   serviço) sem apagar seu histórico.
7. Soldados inativos devem ficar ocultos da escala geral por padrão.
8. O administrador deve poder consultar a lista de soldados inativos e o
   histórico completo de cada um.

Módulo: Escala de Serviço
9. O sistema deve calcular automaticamente o rodízio de dias "pretos"
   (segunda a sexta) conforme o número de soldados ativos na função.
10. O sistema deve calcular automaticamente o rodízio de fins de semana
    "vermelhos" (sábado + domingo) conforme o número de soldados ativos
    na função.
11. O sistema deve exibir a escala geral (Piscineiro e Permanência) em
    visualização semanal e mensal.
12. Qualquer usuário autenticado deve poder visualizar a escala geral
    completa de todos os soldados ativos.
13. O usuário comum deve poder ativar o filtro "Apenas minha escala" para
    ver somente os próprios dias de serviço.
14. A escala deve exibir dia da semana, dia, mês, ano e tipo de dia
    (preta/vermelha), com destaque visual de cor.
15. Ao alterar o efetivo de uma função (entrada, saída, férias,
    afastamento), o sistema deve recalcular a escala das semanas
    seguintes.

Módulo: Férias e Afastamentos
16. O administrador deve poder registrar férias de um soldado com data de
    início e fim.
17. O administrador deve poder registrar afastamento, atestado, licença,
    curso ou dispensa com data de início e fim.
18. Ao registrar férias/afastamento, o soldado deve sair temporariamente
    da escala ativa da sua função durante o período.
19. O sistema deve manter histórico de todos os afastamentos já
    registrados.

Módulo: Trocas e Substituições
20. O administrador deve poder registrar uma troca quando um soldado se
    ausenta em um dia de serviço.
21. O sistema deve indicar quem está com mais dias de folga acumulados
    como sugestão de substituto.
22. O sistema deve registrar a compensação futura (o soldado ausente
    deverá cobrir o dia de quem o substituiu).
23. O histórico de trocas deve ficar disponível para consulta.

Módulo: Dashboard (somente Administrador)
24. O dashboard deve exibir ranking de soldados por quantidade de
    serviços tirados, por função.
25. O dashboard deve exibir ranking de soldados por quantidade de
    atestados/afastamentos.
26. O dashboard deve permitir filtro por data inicial e final
    personalizada.
27. O dashboard deve permitir filtro predefinido por semana ou por mês.
28. O acesso ao dashboard deve ser restrito ao perfil administrador.

Módulo: Visual e Plataforma
29. A interface deve seguir tema visual de quartel, destacando o nome
    "GRECAS" (Escala GRECAS) no cabeçalho/tela inicial.
30. O sistema deve funcionar como aplicativo instalável no celular (PWA)
    e também no navegador.
```

## Estrutura de Pastas

```
/app
  /(auth)/login
  /(app)/escala           -> escala geral + filtro "Apenas minha escala"
  /(app)/soldados         -> CRUD de soldados (admin)
  /(app)/afastamentos     -> férias/atestado/licença (admin)
  /(app)/trocas           -> registro de substituições (admin)
  /(app)/historico        -> soldados inativos + histórico (admin)
  /(app)/dashboard        -> estatísticas (admin)
/components
/lib/supabase.ts
/types
```

## Configuração Supabase

- Auth: e-mail + senha.
- RLS conforme descrito acima (SELECT geral para autenticados, escrita
  restrita a admin, dashboard restrito a admin).
- Perfil `role` decide o que a UI mostra/esconde (rotas administrativas
  ocultas para `comum`, além do enforcement via RLS no banco).

## Design / Tema Visual

- Tema de quartel militar: paleta em tons de verde-oliva, bege/areia e
  detalhes em vermelho (para os dias "vermelhos" da escala) e preto/cinza
  escuro (para os dias "pretos").
- Nome "GRECAS" em destaque no cabeçalho, tipografia forte (estilo
  stencil/militar) para títulos, fonte legível para o corpo.
- Cartão do administrador com foto/ilustração de soldado batendo
  continência e o aviso de contato.
- Implementar os componentes visuais fiéis ao protótipo gerado no
  Google Stitch para este projeto (mesma paleta, tipografia e layout de
  telas).

Comece pelo setup: criar projeto Next.js, instalar dependências (incluindo
`@supabase/supabase-js` e suporte a PWA), configurar o cliente Supabase e
rodar as migrations das tabelas acima.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
