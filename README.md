# Escala GRECAS

Sistema de gestão da escala de serviço (Piscineiro / Permanência) do 6º BEC no clube GRECAS.

## Setup

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode as migrations em `supabase/migrations/0001_init.sql` (SQL editor do painel ou `supabase db push`).
3. Copie `.env.local.example` para `.env.local` e preencha com a URL e a chave anônima do projeto.
4. Crie o usuário do administrador (Erivan Arraiz) em Authentication → Users, copie o UUID e siga as instruções em `supabase/migrations/0002_seed_admin.sql` para vincular o perfil `admin`.
5. Cadastre os demais soldados e perfis conforme necessário.
6. `npm install && npm run dev`.

## Rede corporativa / Kaspersky (Windows)

Se `npm run dev` rodar em uma máquina com o Kaspersky Endpoint Security fazendo
inspeção de TLS (comum em rede corporativa), as chamadas do servidor Next.js para
o Supabase falham com `fetch failed` / `SELF_SIGNED_CERT_IN_CHAIN` — o Windows e o
navegador confiam na CA raiz que o Kaspersky injeta, mas o Node.js não, por padrão.

Os scripts `dev`/`build`/`start` já apontam `NODE_EXTRA_CA_CERTS` para
`.certs/kaspersky-root-ca.pem` (exportada da store `Root` do Windows) para resolver
isso. Se a máquina não usar Kaspersky, o arquivo é simplesmente ignorado — não é
preciso remover nada.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (auth, Postgres, RLS) + PWA.

O motor de rodízio (dias pretos/vermelhos) fica em `lib/escala/engine.ts` — recalcula
automaticamente a escala das próximas semanas a partir do efetivo ativo e dos afastamentos
vigentes, sem alterar o histórico já registrado em `escalas_servico`.
