# Prompt para Google Stitch — Escala GRECAS

## Contexto

Escala GRECAS é um painel de gestão da escala de serviço dos soldados do
6º BEC de Roraima que atuam no clube de laser GRECAS. Duas funções de
serviço se revezam por dia: Piscineiro (segurança/manutenção da piscina) e
Permanência (controle de entrada de pessoas). A escala tem dias "pretos"
(segunda a sexta) e dias "vermelhos" (sábado + domingo), calculados por
rodízio automático conforme o efetivo de cada função.

Usuário final: militares do exército brasileiro, a maioria acessando pelo
celular no dia a dia para consultar a escala; nível técnico baixo/médio —
a interface precisa ser simples, direta e rápida de ler, sem jargão de
sistema. Dois perfis: administrador (Erivan Arraiz, acesso total) e
usuário comum (soldado, vê a escala geral de todos e pode filtrar para ver
só a própria).

## Telas a prototipar

**1. Login**
- Logo/nome "Escala GRECAS" em destaque, campo de usuário/e-mail, campo de
  senha, botão "Entrar".
- Visual de quartel desde a tela de entrada (fundo em tom verde-oliva/areia).

**2. Escala Geral** (tela inicial após login, para todos os perfis)
- Cabeçalho com o nome "GRECAS" em destaque e a data atual.
- Alternância entre visualização Semanal e Mensal.
- Duas seções/colunas: Piscineiro e Permanência, cada uma listando os
  soldados ativos e seus dias marcados (preto = dia útil de serviço,
  vermelho = fim de semana de serviço).
- Toggle "Apenas minha escala" que filtra a visualização para mostrar só
  os dias do próprio usuário logado.
- Cores de dia (preto/vermelho) aplicadas como badges ou destaque nas
  células do calendário/lista.
- Cartão fixo do administrador: foto/ilustração de soldado batendo
  continência + texto "Em caso de dúvida ou solicitação de alterações na
  escala, falar com Erivan Arraiz".

**3. Soldados** (somente administrador)
- Lista de soldados ativos, com nome, função (Piscineiro/Permanência) e
  data de entrada.
- Botão "Adicionar soldado" (formulário: nome, função, data de entrada).
- Ação para marcar soldado como inativo (com confirmação).
- Busca/filtro por nome ou função.

**4. Afastamentos** (somente administrador)
- Lista de afastamentos registrados (tipo, soldado, período).
- Botão "Registrar afastamento" com formulário: soldado, tipo (Férias,
  Atestado, Licença, Curso, Dispensa), data início, data fim, observação.

**5. Trocas de Serviço** (somente administrador)
- Lista de trocas registradas: soldado ausente, substituto, data original,
  data de compensação, status (Pendente/Compensado).
- Botão "Registrar troca" com formulário correspondente.

**6. Histórico / Inativos** (somente administrador)
- Lista de soldados inativos (que já saíram do serviço), ocultos da tela
  inicial.
- Ao clicar em um soldado (ativo ou inativo), mostra o histórico completo
  de dias de serviço, afastamentos e trocas dele.

**7. Dashboard** (somente administrador)
- Filtro de período no topo: campos de data inicial/final, além de atalhos
  rápidos "Esta semana" / "Este mês".
- Cards/gráficos de ranking: soldados que mais tiraram serviço (por
  função), soldados que mais tiraram atestado/afastamento.
- Visual de painel de comando, com números grandes em destaque e
  gráficos de barra simples.

## Design System

**Paleta de cores** (tema quartel, compatível com shadcn/ui):
- Cor primária: `#4A5D23` (verde-oliva militar)
- Cor de fundo: `#F5F1E8` (bege areia claro)
- Cor de superfície (cards): `#FFFDF7`
- Cor de texto principal: `#2B2B26` (cinza-chumbo escuro)
- Cor de destaque/ação: `#B33A3A` (vermelho boina)
- Cor secundária de destaque: `#C9A227` (dourado insígnia, para elementos de admin/liderança)
- Cor "dia preto" (serviço em dia útil): `#2B2B2B`
- Cor "dia vermelho" (serviço de fim de semana): `#A83232`

**Tipografia:**
- Títulos/cabeçalhos: fonte condensada e forte, estilo "stencil" militar
  (ex: Oswald ou Bebas Neue), em caixa alta para o nome "GRECAS".
- Corpo de texto e labels: fonte legível e neutra (ex: Inter ou Roboto),
  peso regular/medium.
- Hierarquia: H1 (nome do sistema/tela), H2 (seções: Piscineiro,
  Permanência, etc.), corpo (dados da escala), label (status, tags de tipo
  de dia).

**Tom visual:**
- Minimalista e funcional, mas com identidade militar: bordas mais retas
  (pouco arredondadas), ícones simples (capacete, apito, escudo/insígnia),
  uso pontual de textura sutil (ex.: um detalhe discreto de camuflagem em
  cabeçalho ou fundo do card do administrador, sem poluir a leitura).
- Cards com sombra suave, espaçamento generoso, contraste alto entre dias
  "pretos" e "vermelhos" para leitura rápida no celular.
- Layout mobile-first (a maioria acessa pelo celular), com versão adaptada
  para navegador desktop mantendo a mesma identidade.

## Instrução final para o Stitch

Gere todas as telas de forma navegável e coerente entre si, respeitando o
design system definido. Os componentes devem ser consistentes entre telas.
Use o design system como base para todos os elementos visuais.
