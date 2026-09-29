# Roadmap de Redesenho — Global Academy

Documento de planeamento (sem implementação). Cobre a visão de produto para a
próxima versão do site, a seguir à integração de pagamentos (Fase 1, já
implementada em `src/app/api/payments`).

## 1. Direção visual

Decisão: **não** estender a identidade atual incrementalmente — construir uma
linguagem visual nova, mais atual e mais assente em azul.

- Paleta: manter o azul como cor de marca dominante, mas substituir os tons
  atuais (`#16215a`, `#002f7b`, `#f8f8f8`) por uma escala mais viva e
  contemporânea — ex.: um azul primário mais saturado/brilhante para CTAs e
  destaques, um azul quase-preto para texto/headers, gradientes subtis
  azul→azul-claro em heróis e cartões, e um branco/cinza muito claro como
  fundo neutro. A paleta final deve ser validada em Figma/artifact antes de
  entrar em código.
- Tipografia: rever a fonte atual (Inter) — manter ou substituir por algo com
  mais personalidade para títulos (ex.: uma display sans mais geométrica),
  mantendo Inter (ou equivalente) para corpo de texto.
- Componentes: cartões com mais profundidade (sombras suaves, cantos mais
  arredondados), motion sutil (hover, scroll-reveal), mais espaço em branco.
  Os logótipos existentes (`logo-white.png`, `logo-black.png`,
  `imagotipo.png`) mantêm-se — o refresh é de UI, não de marca.
- Acessibilidade: qualquer novo tom de azul deve manter contraste AA contra
  branco/texto (validar com o skill de acessibilidade antes de finalizar).

## 2. Estrutura de páginas

Mapeada sobre o App Router já existente (`src/app/(home)/...`):

- **Início** — hero renovado, prova social (parceiros, testemunhos, CEO),
  destaques de cursos.
- **Catálogo de cursos** (`/courses`) — adicionar filtros (área, tipo,
  formato, preço) e pesquisa por texto; atualmente é uma lista simples.
- **Detalhe do curso** (`/courses/about/[courseId]`) — adicionar programa,
  formador, datas/vagas, preço, CTA de inscrição.
- **Formação in-company / pedido de proposta** — página nova, formulário
  dedicado para empresas (distinto da pré-inscrição individual).
- **Sobre / Contactos** — já existem (`ceo-msg`, `clients`), rever conteúdo e
  layout.
- **Área do aluno** — página nova, protegida por autenticação: cursos
  inscritos, estado de pagamento, certificados.

## 3. Modelo de dados (para quando existir backend/BD real)

A Fase 1 introduziu apenas uma store efémera (Redis) para correlacionar
callbacks de pagamento — não é uma base de dados de produto. Para suportar o
catálogo dinâmico, área do aluno e painel admin, será necessária uma BD real
com, no mínimo:

- `courses` (nome, tipo, descrição, preço, programa, formador, datas, vagas)
- `enrollments` (aluno, curso, estado — pendente/pago/confirmado, referência
  de pagamento)
- `students` (dados pessoais, credenciais de acesso à área do aluno)
- `companies` (clientes corporativos, pedidos de formação in-company)
- `payments` (histórico de transações — hoje só existe o estado efémero da
  Fase 1; isto seria o registo permanente)
- `certificates` (aluno, curso, data de emissão, ficheiro)
- `users`/`roles` (admin, formador, financeiro)

## 4. Painel de administração

Nova área protegida (`/admin`, route group separado com o seu próprio
layout) ou aplicação separada — a decidir. Funcionalidades:

- Gestão de cursos (CRUD, preços, datas, vagas, formadores)
- Gestão de inscrições e clientes (individuais e empresas)
- Gestão de pagamentos (histórico, reconciliação com os callbacks de
  pagamento já implementados) e emissão de certificados
- Gestão de conteúdo do site (banners, testemunhos, blog)
- Dashboard com métricas (inscrições, receita, cursos mais procurados)
- Perfis de acesso (admin, formador, financeiro)

## 5. Ordem de entrega sugerida

1. Definir paleta/identidade nova (Figma ou artifact de design) e validar
   com o cliente antes de tocar em código.
2. Redesenhar Início + Catálogo + Detalhe do curso (maior impacto visual,
   sem depender de BD nova).
3. Introduzir BD real + autenticação (decisão de stack em aberto — ver
   secção 6) — pré-requisito para Área do Aluno e Admin.
4. Área do Aluno (login, estado de inscrição, certificados).
5. Painel de administração.

## 6. Decisões em aberto (o utilizador precisa de responder)

- Orçamento/hospedagem: manter Vercel? Orçamento mensal aceitável para
  BD + auth (ex.: Postgres gerido, Upstash, etc.)?
- Escolha de BD (Postgres/Supabase, MongoDB, outro) e de fornecedor de auth
  (NextAuth/Auth.js, Clerk, Supabase Auth, etc.)
- Quem vai gerir o conteúdo dos cursos no dia-a-dia (equipa interna via
  admin panel vs. atualização manual de código)?
- Prazo desejado para cada fase.
- Confirmar se a paleta "mais azul" deve ser proposta em 2–3 opções (via
  artifact) antes de escolher a definitiva.
