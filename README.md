# Global Academy — Site de formação presencial

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · GSAP + Lenis · PostgreSQL · TypeORM · AppyPay · Painel administrativo.

Requer Node.js ≥ 20.9. O controlo de acesso ao painel está em `src/proxy.ts` (o antigo `middleware.ts` do Next 15).

## Animação

O motor está em `src/components/motion/` e segue o mesmo padrão do site institucional:

- `SmoothScroll` (Lenis sincronizado com o ScrollTrigger) envolve todas as páginas públicas.
- Qualquer elemento com `data-reveal="up|fade|scale|left|right|clip"` é revelado ao entrar no ecrã (opcional: `data-reveal-delay="0.2"`).
- `SplitReveal` (títulos linha a linha), `ScrubText` (texto que acende com o scroll), `Magnetic`, `Counter`, `Marquee`, `Parallax`.
- Com `prefers-reduced-motion`, o Lenis e as animações desligam-se e todo o conteúdo fica visível.

## Arranque rápido

```bash
cp .env.example .env          # editar AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d          # PostgreSQL local (ou aponte DATABASE_URL para o seu servidor)
npm install
npm run seed                  # cria tabelas, administrador e os 3 cursos reais (npm run seed -- --reset recria o conteúdo)
npm run dev                   # http://localhost:3000   ·   painel: /admin
```

## O que o painel (`/admin`) gere

| Secção | O que controla |
|---|---|
| Visão geral | Inscrições pendentes/pagas, receita, próximas turmas, cursos em rascunho, inscrições por semana |
| Cursos | Editor em separadores — Geral, Aparência, Programa (módulos reordenáveis), Turmas, Formadores, Preços, FAQ, Galeria. Duplicar, destacar, publicar/rascunho |
| Formadores / Destaques do topo / Números em destaque / Porque escolher-nos / Testemunhos / Empresas e parceiros | Listas reordenáveis (arrastar) |
| Métodos de pagamento | Nome, tipo, instruções, dados IBAN/telefone, ativar/desativar |
| Conteúdo da página | Textos e imagens do hero, apresentação, diferencial, empresas, contactos e rodapé |
| Inscrições | Pesquisa e filtros (estado, curso, datas), mudar estado, exportar CSV |
| Pagamentos | Inscrições com dados de pagamento (gateway ou manual), por estado |
| Mensagens | Caixa de entrada do formulário de contacto |
| Utilizadores | Administradores do painel, criar/remover, mudar a própria palavra-passe |

Todos os formulários do painel avisam antes de sair com alterações por guardar.

Imagens: carregue no painel (arrastar e largar, vários ficheiros de uma vez) ou cole um link. Com
`UPLOADTHING_TOKEN` preenchido, os ficheiros vão para o UploadThing; sem ele, ficam em `UPLOAD_DIR`,
servidos em `/media/…`. Imagens fixas podem ir para `public/images/` e usar o caminho `/images/ficheiro.jpg`.

## Pagamentos (AppyPay)

`src/lib/payments/appypay.ts` usa a mesma integração do site institucional:

- Método de pagamento do tipo **Express** no painel → cobrança Multicaixa Express (GPO). A pessoa aprova no telemóvel.
- Método do tipo **Referência** → o AppyPay gera entidade + referência, mostradas na página da inscrição.
- Outros tipos (transferência, numerário) ficam em modo manual: inscrição pendente + instruções do painel; marca-se "Pago" no painel.

Sem as variáveis `GATEWAY_API_URL`, `APPY_*` e `APPYPAY_*` preenchidas, tudo funciona em modo manual.

Webhook a registar no AppyPay: `{SITE_URL}/api/payments/appypay/callback`. Como o webhook não é assinado,
o corpo só identifica a inscrição: o estado é sempre confirmado diretamente na API do AppyPay antes de
marcar a inscrição como paga.

A coluna `enrollments.payment_details` (jsonb) é criada automaticamente no arranque em produção
(`ALTER TABLE … ADD COLUMN IF NOT EXISTS`, em `src/lib/db.ts`).

## Deploy no Render

O projeto inclui um `render.yaml` (Blueprint) pronto. Passos:

1. Suba o repositório para o GitHub (se ainda não estiver lá).
2. No [dashboard do Render](https://dashboard.render.com), **New → Blueprint**, aponte para o repositório. O Render lê o `render.yaml` e cria o serviço web com disco persistente (1 GB, montado em `/var/data`, para os uploads do painel) já configurado.
3. Preencha as variáveis marcadas como "from the dashboard" (não vão no git):
   - `DATABASE_URL` — a connection string do Supabase em **modo Transaction** (porta `6543`, Project Settings → Database → Connection pooling). **Não** use o modo Session (porta `5432`) — esgota o limite de conexões.
   - `AUTH_SECRET` — gerar com `openssl rand -base64 48`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciais do administrador.
   - `SITE_URL` — o domínio final (ex.: `https://globalacademy.onrender.com` ou o seu domínio próprio).
   - `APPY_CLIENT_ID`, `APPY_CLIENT_SECRET`, `APPY_RESOURCE`, `APPYPAY_GPO_ID`, `APPYPAY_REF_ID`, `APPYPAY_MERCHANT_IDENTIFIER`, `APPYPAY_API_KEY` — as mesmas credenciais AppyPay do site institucional. Confirme também `GATEWAY_API_URL`.
   - `NODE_VERSION` — o Next 16 exige Node ≥ 20.9; o `render.yaml` fixa `20`, que instala a 20.x mais recente.
   - `UPLOADTHING_TOKEN` — opcional; sem ele, os uploads do painel usam o disco persistente (`UPLOAD_DIR`).
4. Primeiro deploy feito, crie as tabelas e o administrador uma única vez, a partir do seu computador, apontando temporariamente o `DATABASE_URL` local para a mesma string do Supabase usada no Render:
   ```bash
   npm run seed
   ```
   Depois **reponha o `.env` local** para o banco de desenvolvimento.

O disco persistente do Render garante que as imagens carregadas pelo painel (`UPLOAD_DIR=/var/data/uploads`, servidas em `/media/…`) sobrevivem a reinícios e deploys — ao contrário de plataformas serverless (Vercel, Netlify), onde o sistema de ficheiros é descartável/só-leitura e os uploads locais não funcionam.

## Produção — checklist

- `AUTH_SECRET` longo e aleatório; alterar a palavra-passe inicial do administrador.
- Palavras-passe guardadas com `scrypt`. Contas antigas (bcrypt) continuam a entrar e são convertidas para scrypt no primeiro login.
- O build precisa de `DATABASE_URL` (o layout lê as definições do site para os metadados).
- Depois do primeiro arranque, `DB_SYNC=false` (já é o padrão no `render.yaml`) e passar a usar migrações TypeORM.
- HTTPS obrigatório (o cookie de sessão é `secure` em produção; o Render fornece HTTPS automaticamente).
- Limite de tentativas de login é em memória (1 instância). Com várias instâncias, usar Redis.
- Envio de emails (confirmação de inscrição, pagamento confirmado, contacto e pedido de proposta) via Resend — preencher `RESEND_API_KEY` e `EMAIL_FROM` (domínio verificado no Resend).
