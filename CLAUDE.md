# CLAUDE.md — Cardápio do cliente ([Splash Pedidos])

## Pré-requisitos (instalar uma vez, antes de tudo)
- Node.js 20+ → https://nodejs.org
- pnpm → `npm install -g pnpm`
- Git

## Setup inicial — rodar só se este projeto ainda não existe (sem `package.json` nesta pasta)
Se já existe `package.json` aqui, pule direto pra "Comandos". Se não existe, siga esta ordem:

**1. Criar o projeto Vite + React + TypeScript nesta pasta:**
```bash
pnpm create vite@latest . --template react-ts --no-interactive
```
Se aparecer aviso de pasta não vazia (por causa deste `CLAUDE.md`), pode confirmar/prosseguir — o Vite não mexe em arquivos `.md`.

**2. Instalar dependências:**
```bash
pnpm install
pnpm add @supabase/supabase-js @tanstack/react-query zustand react-hook-form zod react-router-dom
pnpm add -D @tailwindcss/vite
```

**3. Configurar Tailwind CSS v4.** Em `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```
Conteúdo completo de `src/index.css` (a paleta de marca já embutida como tokens):
```css
@import "tailwindcss";

@theme {
  --color-background: #F0ECD2;
  --color-foreground: #030404;

  --color-primary: #CF9047;
  --color-primary-foreground: #030404;

  --color-secondary: #7B431B;
  --color-secondary-foreground: #F0ECD2;

  --color-accent: #2C120B;
  --color-accent-foreground: #F0ECD2;
}
```

**4. Criar a estrutura de Clean Architecture:**
```bash
mkdir -p src/domain src/application src/infrastructure/supabase src/presentation
```

**5. Criar o cliente Supabase**, em `src/infrastructure/supabase/client.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**6. Criar `.env.local` na raiz** (nunca commitar este arquivo):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
O projeto Supabase já existe (foi criado a partir do repositório `admin`) — **não crie um projeto novo aqui**. Peça pra quem está no `admin` te mandar a Project URL e a anon key, e cole exatamente os mesmos dois valores acima.

**7. `.gitignore` na raiz:**
```
node_modules
dist
.env.local
.DS_Store
```

**8. Primeiro commit:**
```bash
git init
git add .
git commit -m "chore: scaffold inicial do storefront"
```

## Comandos (depois que o projeto já existe)
```bash
pnpm install       # instala dependências (se node_modules não existir)
pnpm dev           # inicia servidor de desenvolvimento (http://localhost:5173)
pnpm build         # build de produção
pnpm test          # testes unitários (Vitest)
pnpm test:e2e      # testes end-to-end (Playwright) — a partir da Fase 2
pnpm lint          # ESLint
```
Quando pedirem pra "iniciar a aplicação": sem `package.json` → siga "Setup inicial" primeiro. Com `package.json` mas sem `node_modules` → `pnpm install`. Depois, sempre `pnpm dev`.

## Sobre o projeto
[Splash Pedidos] é um SaaS de pedidos multi-loja (multi-tenant). Não é um sistema exclusivo da Kaká o Show — a Kaká o Show é a primeira cliente (3 lojas), mas o produto precisa suportar qualquer loja/cafeteria que assinar depois. Não é um MVP raso: o objetivo é um produto pronto pra produção (testes, RLS, tratamento de erro) desde o primeiro código — mesmo que o processo em volta comece simples.

Este repositório é só o **cardápio do cliente**. O painel administrativo vive num repositório separado (`admin`). Os dois se conectam ao mesmo projeto Supabase hospedado — não existe repositório de schema, porque não existe schema duplicado.

## Repositórios do projeto
- `admin` — painel administrativo
- `storefront` (este repositório) — cardápio do cliente
- **1 banco de dados**: um único projeto Supabase hospedado (não local), compartilhado pelos dois repositórios via a mesma `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Domínio e roteamento (decisão pra Fase 2, registrada aqui pra não se perder)
A rota `/:storeSlug/...` já está implementada e em uso desde a Fase 1 (path-based, `localhost:5173/loja1` por exemplo) — o que fica pra Fase 2 é só a camada de domínio/subdomínio abaixo, não o roteamento por loja em si.

Quando o domínio da empresa for comprado: **subdomínios**, não path-based sob o mesmo domínio.
- `pedido.dominio.com` (ou o domínio raiz) → este app, com a loja no path (`pedido.dominio.com/cacaushow-torres`), usando a rota `/:storeSlug/...` já prevista no design.
- `admin.dominio.com` → o `admin`, um app só, sem loja no path — login + RLS decidem o que cada usuário vê.

Cada subdomínio aponta direto pro respectivo projeto Vercel, sem proxy/rewrite entre os dois.

**Passo a passo pra quando chegar na Fase 2** (precisa de um deploy vivo na Vercel primeiro — não dá pra apontar DNS pra nada antes disso):
1. No projeto Vercel deste app: Settings → Domains → adicionar `pedido.seudominio.com` (ou o domínio raiz)
2. A Vercel mostra um registro CNAME pra criar (geralmente `cname.vercel-dns.com`)
3. No painel do registrador do domínio (registro.br, Cloudflare etc.): criar esse CNAME
4. O mesmo processo acontece no projeto Vercel do `admin`, pra `admin.seudominio.com`
5. Propagação de DNS leva de minutos a algumas horas; a Vercel emite o certificado SSL sozinha depois que o CNAME resolve

O domínio em si pode ser comprado a qualquer momento, sem depender desse passo — só o apontamento do CNAME que precisa esperar o primeiro deploy.

## Fases do projeto
**Fase 1 (agora):** 2 repositórios (`admin`, `storefront`), 1 projeto Supabase hospedado compartilhado entre os dois. Sem PR obrigatório, sem CI, sem staging separado — ver "Fluxo de versionamento (Git)" abaixo pro esquema de branch. Mudança de schema é feita direto no SQL Editor do Supabase Studio, por enquanto sem migration versionada — formaliza isso na Fase 2.

**Fase 2 — unificação (ao bater o Marco 1 abaixo):** os dois repositórios se juntam num monorepo (Turborepo + pnpm workspaces), as mudanças de schema passam a ser migrations versionadas (`supabase/migrations`), e entra staging (projeto Supabase separado ou branch persistente do Supabase Branching), CI e PR obrigatório.

## Fluxo de versionamento (Git)
Clientes já usam a produção — ninguém desenvolve mais direto na `main`. GitFlow simplificado (mesmo esquema usado no repositório `admin`, pra manter os dois consistentes): sem `feature/*` nem `release/*`, só o núcleo que importa aqui — separação teste/produção e hotfix com merge duplo.

- **`main`** → produção. Só recebe merge no momento de soltar uma versão.
- **`dev`** → trabalho do dia a dia. Commit e push direto aqui. Cada push gera um Preview Deployment próprio na Vercel (`cacau-cardapio-git-dev-....vercel.app`) — é o ambiente de teste, produção não é tocada.
- **Soltar versão pros clientes:**
  ```bash
  git checkout main
  git merge dev
  git tag v1.x.y
  git push origin main --tags
  git checkout dev
  ```
- **Bug urgente em produção:** branch a partir de `main`, corrige, merge em `main` (deploy sai na hora) **e** em `dev` — senão a correção some no próximo release.

**Banco compartilhado, sem isolamento ainda**: o Supabase é o mesmo projeto pra `dev` e produção (ver "Repositórios do projeto" acima) — nenhuma branch de código protege o banco. Enquanto não existir staging separado (Fase 2): só mudança aditiva no schema (coluna nova sempre opcional/com default), nunca renomear/remover coluna nem alterar política de RLS que o código em produção usa sem avisar quem mantém o `admin` antes. Mudança de schema/RLS: preferir testar primeiro num Supabase local (`supabase start`, via Docker) antes de aplicar no projeto compartilhado, mesmo sem migration versionada ainda.

Configuração necessária na Vercel (Settings → Environment Variables, deste projeto): `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` marcadas também pro ambiente **Preview**, não só **Production** — sem isso o Preview Deployment da `dev` quebra (variável ausente).

## Stack técnica
- React 18 + Vite, TypeScript em modo `strict`
- Tailwind CSS v4 via `@tailwindcss/vite` (sem `tailwind.config.js` — tokens ficam em CSS, bloco `@theme`, quando precisar customizar)
- TanStack Query (estado de servidor) + Zustand (estado local de UI)
- React Hook Form + Zod (formulários e validação)
- Supabase (Postgres + Auth + Realtime + Storage + API automática)
- Deploy: Vercel

## Paleta de cores
Tokens de marca (já embutidos no `@theme` do `src/index.css`, ver "Setup inicial"):

| Token | Hex | Uso |
|---|---|---|
| `background` / `foreground` | `#F0ECD2` / `#030404` | fundo principal / texto principal |
| `primary` / `primary-foreground` | `#CF9047` / `#030404` | botões e CTAs |
| `secondary` / `secondary-foreground` | `#7B431B` / `#F0ECD2` | ações secundárias, bordas |
| `accent` / `accent-foreground` | `#2C120B` / `#F0ECD2` | cabeçalhos, superfícies escuras, hover |

**Cores de status do pedido** (na tela de acompanhamento do cliente) seguem a mesma convenção do admin — paleta funcional do Tailwind, não a de marca:
- `received` / `preparing` → âmbar (`amber-500`)
- `out_for_delivery` / `delivered` → azul (`blue-500`)
- `finalized` → verde (`green-500`)
- `cancelled` → vermelho (`red-500`)

## Padrões de frontend e identidade visual
Aviso honesto: creme + caramelo é um dos combos que mais grita "gerado por IA" quando não é intencional — no nosso caso é legítimo (marca real de café/cacau), mas isso só funciona se a personalidade vier da tipografia e da linguagem, não só da cor. Adicione ao `@theme` de `src/index.css` (idêntico ao do `admin`, pra manter os dois apps consistentes):
```css
--font-display: "Orelega One", serif;
--font-body: "Inter", sans-serif;
```
E no `index.html`, dentro de `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orelega+One&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
`font-display` (Orelega One) pra títulos e nome de produto no cardápio; `font-body` (Inter) pra UI, formulário e texto corrido. Orelega One só tem 1 peso (400, regular) — `font-bold`/`font-semibold` combinado com `font-display` não ganha peso real, o navegador só aplica negrito sintético. Escala de tamanho: usa a escala padrão do Tailwind (`text-sm` até `text-3xl`) — não inventa tamanho solto fora dela.

Regras não-negociáveis, independente de feature:
- **Foco de teclado sempre visível** (nunca `outline: none` sem substituir por outro indicador claro).
- **Mobile-first de verdade** — este app é usado majoritariamente no celular; desenhe pro mobile primeiro, desktop depois.
- **Área de toque mínima 44x44px** em qualquer botão do carrinho/checkout.
- **Motion com intenção, não decoração** — anima só onde ajuda a entender o que mudou (ex: item entrando no carrinho, status avançando), nunca só pra "parecer moderno". Respeitar `prefers-reduced-motion`.
- **Marcador numerado (1/2/3) só onde a sequência é real** — o acompanhamento de status do pedido é uma sequência de verdade, então numerar ali faz sentido.
- **Copy do lado de quem usa**: voz ativa, nomeia pelo que a pessoa reconhece, não por termo técnico do sistema. O botão que diz "Confirmar pedido" gera um toast "Pedido confirmado" — a mesma palavra do botão, nunca jargão tipo "processado com sucesso".

## Multi-tenancy (isolamento entre lojas)
- Banco único, schema único. Toda tabela de domínio tem `store_id uuid not null references stores(id)`.
- **RLS obrigatório em toda tabela.** Cliente só enxerga produtos e pedidos da própria loja.
- Nunca confie em filtro feito só no frontend — a segurança real é a política de RLS definida no projeto Supabase compartilhado.
- **Cliente final não tem conta/sessão** (ver "Identificação do cliente (sem conta)" abaixo) — então o RLS aqui só isola por `store_id`, não por cliente. "Meus pedidos" filtra por `customer_cpf` no client, sem garantia server-side de que quem digitou o CPF é o dono dele (risco aceito, ver seção Segurança).
- **Resolvido**: existe `public_stores` (view sobre `stores`, mesmo padrão de `public_products` — `id, name, slug, active, supports_dine_in, supports_pickup, supports_delivery, reseller_enabled, whatsapp_number`), liberada pro `anon` via `grant select`. `/:storeSlug` resolve a loja através dela (`infrastructure/store/SupabaseStoreRepository.ts`). Tela de tipo de pedido já filtra pelas opções que `supports_*` marca como suportadas. `whatsapp_number` alimenta o link de WhatsApp pós-confirmação (ver "Confirmação de pedido").
- **Cuidado real, já vivido**: o cardápio antes não filtrava por loja — com 2 lojas cadastradas no banco compartilhado, produto de uma loja apareceu misturado no carrinho de pedido pensado pra outra, e a confirmação falhou (RPC recusou corretamente, produto não pertencia à loja do pedido). Todo fluxo (cardápio, carrinho, confirmação) é escopado pela loja resolvida via `/:storeSlug` agora — não existe mais busca de produto "global" sem `store_id`.

## Modelo de dados (no projeto Supabase compartilhado)
```
profiles      (id, role: super_admin|store_admin, store_id nullable, full_name)
               -- só lojista/admin (gerenciado pelo repositório `admin`); cliente final não tem linha aqui
stores        (id, name, slug, active, created_at,
               supports_dine_in boolean default true, supports_pickup boolean default true,
               supports_delivery boolean default false, reseller_enabled boolean default false,
               whatsapp_number)   -- número que recebe o pedido via WhatsApp (só rota delivery, ver "Confirmação de pedido")
products      (id, store_id, name, category, description, image_url, unit, price, lover_price,
               stock_quantity, track_stock, sort_order, active, created_at,
               available_dine_in boolean, available_pickup boolean, available_delivery boolean)
               -- lover_price: preço alternativo pro cliente "Cacau Lover" (ver seção própria abaixo)
               -- colunas internas fora da view public_products (não confirmado se ainda existem
               -- na tabela completa): external_code, ncm, cost_price
               -- available_retail/available_reseller (do desenho original do canal atacado) não
               -- aparecem em public_products hoje — filtro de catálogo por canal usa
               -- available_dine_in/pickup/delivery; ver "Canal de revendedor" pra status real
addon_groups          (id, store_id, name, active)
addon_options         (id, addon_group_id, name, price, active)
product_addon_groups  (product_id, addon_group_id, selection_type: single|multiple, max_quantity nullable, sort_order)
variation_groups          (id, store_id, name, price_mode: replace|additive, active)
variation_options         (id, variation_group_id, name, price, active)
                          -- lover_price ainda NÃO existe nessa tabela (pedido feito ao admin,
                          -- pendente ALTER TABLE) — enquanto isso o client usa price como lover_price
                          -- também, então variação nunca mostra desconto Lover de verdade
product_variation_groups (product_id, variation_group_id, sort_order)
orders        (id, store_id, customer_name, customer_cpf, customer_phone,
               order_type: dine_in|pickup|delivery, status,
               sales_channel: retail|reseller default 'retail',
               table_number nullable, delivery_address jsonb nullable, created_at, updated_at)
               -- sales_channel='reseller' nunca combina com order_type='dine_in'
               -- customer_cpf é texto puro (sem FK — não existe tabela de conta de cliente),
               -- indexado pra suportar a busca de "meus pedidos" por CPF
order_items   (id, order_id, product_id, quantity, unit_price)   -- cópia do preço no momento
                                                                    -- do pedido, nunca referencie
                                                                    -- products.price direto
                                                                    -- (não confirmado se guarda addon/variação escolhida — ver RPC confirm_order)
order_status_history (id, order_id, status, changed_by, changed_at)
promotions    (id, store_id, title, subtitle, badge_label, image_url, product_id, sort_order,
               active default true, created_at)
               -- carrossel de promoções do cardápio (ver "Carrossel de promoções" abaixo)
               -- product_id references products(id) — toque no slide sempre abre o produto vinculado
```

## Confirmação de pedido (RPC `confirm_order`)
Cliente final não tem `INSERT` direto em `orders`/`order_items` (RLS bloqueia — testado, confirmado). Escrita passa pela função Postgres `confirm_order(p_store_id, p_order_type, p_customer_name, p_customer_cpf, p_customer_phone, p_delivery_address, p_items, p_table_number default null)`, `security definer`, liberada pro `anon` via `grant execute`. `p_table_number` é `text`, só preenchido quando `order_type = 'dine_in'` — pré-preenchido na tela de identificação quando o cliente entra via QR code de mesa (rota `/:storeSlug/mesa/:numeroMesa`, `TableEntryPage`), mas continua editável (cliente corrige se o QR ler errado). Ela recalcula `unit_price` a partir de `products.price` no momento da confirmação (cliente não consegue forjar preço mandando `unit_price` direto), valida loja ativa e produto ativo/da mesma loja, grava pedido + itens de forma atômica, sempre com `status = 'received'` (fixo pela função — client não manda status). Implementação em `infrastructure/order/SupabaseOrderRepository.ts` (chama `supabase.rpc('confirm_order', ...)`), caso de uso em `application/order/confirmOrder.ts`.

Cada item de `p_items` carrega `product_id, quantity, note, addons: [{addon_option_id}], variations: [{variation_option_id}]` — confirmado (via chamada direta à RPC) que a função já lê `addons`/`variations` sem erro de schema; não confirmado ainda como ela grava essa seleção em `order_items` (tabela documentada acima não expõe essas colunas do lado client, então a gravação é opaca a este repositório).

**Aviso via WhatsApp (só pedido `delivery`)**: se `store.whatsapp_number` existir, `ReviewPage` monta um link `wa.me` com o resumo do pedido (`presentation/order/whatsappOrderMessage.ts`) depois que `confirm_order` responde com sucesso, e mostra o link na tela de acompanhamento. Não substitui a RPC — é só um atalho pra loja também saber pelo WhatsApp; a fonte de verdade do pedido continua sendo o banco. Só dispara em `delivery` (dine_in/pickup não geram link).

## Adicionais e variações de produto (`addon`, `variation`)
Produto pode ter grupos de **adicional** (`AddonGroup`/`AddonOption`, ex: "Cobertura extra") e de **variação** (`VariationGroup`/`VariationOption`, ex: "Tamanho"), lidos por `useProductAddons`/`useProductVariations` e escolhidos no `ProductDetailModal` antes de ir pro carrinho.
- **Adicional**: sempre soma ao preço base (`addon_options.price`). `selection_type` (`single`/`multiple`) e `max_quantity` (de `product_addon_groups`) controlam quantas opções o cliente pode marcar por grupo.
- **Variação**: `variation_groups.price_mode` decide o efeito no preço —
  - `replace`: o preço da opção escolhida **substitui** o preço base do produto (ex: tamanho Grande = R$15, ignora o preço do produto).
  - `additive`: o preço da opção **soma** ao preço base (ex: chocolate belga +R$2).
  - Lógica em `domain/variation/variationSelection.ts` (`resolveBasePrice`).
- Duas seleções diferentes de adicional/variação pro mesmo produto viram **linhas separadas no carrinho** (`domain/cart/Cart.ts`, `cartItemId` combina `product.id` + ids escolhidos, não só `product.id`).

## Preço duplo — "Cacau Lover"
Cliente que é "Cacau Lover" paga um preço menor no mesmo produto — não é cadastro/conta, é preço promocional exibido lado a lado com o preço normal em todo lugar que mostra preço (cardápio, carrinho, revisão, mensagem de WhatsApp). Copy atual (`whatsappOrderMessage.ts`) diz que **o CPF é validado na entrega** pra confirmar se o cliente é Cacau Lover — ou seja, o desconto é mostrado no client mas a validação de quem realmente é Lover acontece manualmente do lado da loja, não no banco.
- `products.lover_price` é real e populado no banco (confirmado via API — ex: produto de R$8 com `lover_price` R$6.9).
- `variation_options.lover_price` **ainda não existe** na tabela (ver "Modelo de dados") — o client usa `price` como `loverPrice` de variação enquanto isso, então o preço Lover de uma variação nunca reflete desconto de verdade até o `admin` rodar o `ALTER TABLE`.
- Cálculo em `domain/cart/Cart.ts` (`itemUnitLoverPrice`, `cartLoverTotal`) e `domain/variation/variationSelection.ts` (`resolveBasePrice` devolve `{ regular, lover }`).

## Carrossel de promoções (cardápio)
Topo do cardápio (`MenuPage`, acima da lista de categorias) mostra um carrossel de até N promoções por loja — desliza sozinho a cada 3,5s (`presentation/menu/PromotionCarousel.tsx`), com pontos de navegação clicáveis, e respeita `prefers-reduced-motion` (autoplay desliga, navegação manual continua). Cada slide **sempre** leva a um produto: toque abre o `ProductDetailModal` do produto vinculado (`product_id`), igual ao toque num `ProductCard`.

- Escopo por loja: `promotions.store_id`, mesmo padrão de RLS/`grant select` via view (`public_promotions`) usado em `public_products`/`public_stores` — client nunca lê a tabela `promotions` direto.
- Imagem vem de um bucket próprio no Storage (`promotions`), não reaproveita `products.image_url` — permite banner/arte específica da promoção, diferente da foto do produto no cardápio.
- **Preço nunca é armazenado na promoção** — o carrossel sempre resolve `price`/`lover_price` a partir do produto vinculado, já carregado pelo `useMenu` (mesmo princípio de "nunca referencie preço congelado" já usado em `order_items`). Se o produto vinculado não estiver mais visível no cardápio atual (sem estoque, indisponível pro canal escolhido, inativo), a promoção correspondente some do carrossel — regra pura em `domain/promotion/visiblePromotions.ts`, com teste unitário.
- `badge_label` é opcional (texto livre tipo "Combo especial", "Só hoje") — pílula acima do título, cadastrado pelo admin por promoção.
- Controle de exibição é só `active` (boolean) + `sort_order` (inteiro) — sem período de vigência (`starts_at`/`ends_at`); pra tirar do ar, o lojista desativa manualmente pelo `admin`.
- Repository: `infrastructure/promotion/SupabasePromotionRepository.ts` (lê `public_promotions`), hook `presentation/menu/usePromotions.ts` (TanStack Query, `queryKey: ['promotions', storeId]`).
- **Pendente no `admin`**: tela de CRUD de promoções (título, subtitle, badge_label, upload de imagem pro bucket `promotions`, seletor de produto da própria loja, sort_order, toggle active) — este repositório só lê, não escreve.

## Acompanhamento de pedido (RPC `get_order_status`)
Mesma lógica de segurança do `confirm_order`: cliente final não tem `SELECT` em `orders` (vazaria nome/CPF/telefone/endereço de todo mundo pro anon key). `get_order_status(p_order_id uuid, p_customer_cpf text)` devolve só o `status` (texto), e só pra quem sabe o `id` do pedido **e** o CPF usado nele — não dá pra listar/adivinhar pedido de outra pessoa só sabendo o CPF (mais forte que o modelo de "CPF sozinho" aceito em outros lugares deste doc, porque aqui dá pra ser mais forte sem custo de fricção extra: o id já existe no navegador de quem acabou de confirmar).

Sem WebSocket/Realtime de verdade — a tela de acompanhamento (`presentation/order/OrderTrackingView.tsx`, via `useOrderStatus`) faz *polling* dessa RPC a cada 5s (`TanStack Query`, `refetchInterval`) até o status virar `finalized` ou `cancelled`, onde para de perguntar. Visualmente igual a tempo real pro cliente, muito mais simples de manter do que Realtime com trigger de broadcast.

**Limitação conhecida**: se a pessoa recarregar a página nesse meio tempo, perde o acompanhamento (estado é só em memória, `orderId` não persiste em localStorage). Reabrir o pedido de outro aparelho/depois de fechar a aba ainda não tem tela própria — falta a busca "meus pedidos" só por CPF (mencionada em "Identificação do cliente (sem conta)"), que é o próximo passo natural quando for preciso.

**Importante**: este app nunca consulta a tabela `products` diretamente — usa a view `public_products` (mesmas colunas, exceto `cost_price` e `external_code`, que são informação interna da loja). Se algum dia precisar de um campo que só existe na tabela completa, é sinal de que ele deveria estar na view também, não de usar a tabela direto.

## Canal de revendedor (`/atacado`)
**Status atual: não implementado.** `App.tsx` não tem rota `/:storeSlug/atacado`; `public_products` hoje não expõe `available_retail`/`available_reseller` (só `available_dine_in/pickup/delivery`); nenhuma tela usa `sales_channel`. Ainda é item aberto no Marco 1. Design pretendido, registrado aqui pra quando for implementar:

Mesma loja, mesmo preço, mesma identificação por CPF do cliente comum — **não é um papel novo**, é a mesma rota de checkout com o canal marcado diferente. Rota: `/:storeSlug/atacado`, sempre derivada do slug da loja, só existe se `stores.reseller_enabled = true`. Diferenças de comportamento nessa rota:
- Catálogo filtra por `available_reseller` em vez de `available_retail`
- Tipo de pedido não oferece `dine_in` — só `pickup` ou `delivery`
- Pedido nasce com `sales_channel = 'reseller'`
Reaproveite os mesmos componentes de carrinho/checkout da rota normal — a diferença é um parâmetro de canal passado adiante (`domain`/`application`), não uma tela duplicada.

Antes de implementar: confirmar com o `admin` se `available_retail`/`available_reseller` ainda fazem parte do plano de schema, já que o catálogo migrou pra filtro por `available_dine_in/pickup/delivery` nesse meio tempo — pode ser que o desenho de canal precise ser revisado, não só implementado como está descrito acima.

## Arquitetura limpa (Clean Architecture)
4 camadas, dependência sempre de fora pra dentro:
```
domain/           → entidades e regras de negócio puras (sem React, sem Supabase)
application/      → casos de uso (interfaces/portas + orquestração)
infrastructure/   → implementações concretas (cliente Supabase)
presentation/     → componentes React, hooks, páginas
```

## SOLID aplicado ao frontend
- **S**: componente faz uma coisa só (busca / formata / desenha em partes separadas).
- **O**: composição em vez de `if/else` de tipo — mapa de estratégias por `order_type`.
- **L**: qualquer implementação de uma interface (ex: `CheckoutRepository`) é substituível, inclusive por um fake nos testes.
- **I**: hooks pequenos e específicos (`useCart`, `useOrderStatus`) em vez de um hook gigante que faz tudo.
- **D**: `presentation` depende de abstrações de `application`, nunca importa o client Supabase direto num componente.

## Fluxo de status do pedido
6 valores possíveis na coluna `status` (CHECK constraint no banco, confirmado com quem mantém o `admin`): `received`, `preparing`, `out_for_delivery`, `delivered`, `finalized`, `cancelled`. Pedido nasce direto como `received` (sem estado `pending` — tirado de propósito, confirmação do cliente já é o pedido chegando pra loja).

`delivered` e `finalized` são dois passos distintos, nessa ordem: `delivered` marca a entrega física (comida na mesa, pedido retirado no balcão, ou entregue no endereço); `finalized` é o fechamento manual da comanda pelo lojista no painel (evento administrativo, não físico) — os dois nunca são o mesmo clique do admin.

Comum a todos os tipos: `received` → `preparing` → `delivered` → `finalized`.
- **`dine_in`**: sem etapa `out_for_delivery` — vai direto de `preparing` pra `delivered` (comida entregue na mesa).
- **`pickup`**: passa por `out_for_delivery` entre `preparing` e `delivered` — só que o painel exibe o rótulo **"Pronto pra retirada"** pra esse mesmo valor (é o mesmo status de delivery por trás, rótulo muda pelo `order_type`, não o dado); `delivered` aqui é rotulado **"Retirado"**.
- **`delivery`**: passa por `out_for_delivery` (rótulo **"Saiu pra entrega"**) entre `preparing` e `delivered` (rótulo **"Entregue"**, endereço do cliente).

`cancelled` só a partir de `received` (não dá pra cancelar depois que entrou em preparo). O cliente só acompanha essa máquina de estados em tempo real — não pode alterá-la diretamente; quem muda status é o `admin`.

## Propósito e fluxos principais
App **mobile-first** onde o cliente navega o cardápio e faz o pedido — local (mesa via QR code), retirada ou delivery. Lojas com `reseller_enabled = true` também têm uma vitrine separada de atacado em `/:storeSlug/atacado` (ver "Canal de revendedor" acima).

1. **Entrada via mesa (QR code)**: rota `/:storeSlug/mesa/:numeroMesa` (`TableEntryPage`) — pré-seleciona `dine_in` e o número da mesa (`useOrderType`), pula a tela de escolha abaixo e vai direto pro cardápio. Se a loja não aceitar `dine_in` ou o número vier vazio, cai na tela de escolha normal em vez de forçar mesa inválida.
2. **Escolha do tipo de pedido**: tela de 3 cards — "Cafeteria" (`dine_in`), "Delivery" (`delivery`), "Para Levar" (`pickup`) — se não veio de QR code. Vem **antes** do cardápio, não depois: cada produto tem disponibilidade por canal (`available_dine_in`/`available_pickup`/`available_delivery`), então o cardápio só sabe o que mostrar depois de saber o tipo.
3. **Cardápio**: por categoria, filtrado pelo tipo escolhido; item sem estoque ou indisponível nesse canal aparece desabilitado/oculto, em tempo real. Botão de adicionar em cada item.
4. **Carrinho e checkout**: sem pagamento processado no sistema — combinado na entrega/retirada/mesa.
5. **Identificação do cliente**: nome, CPF e telefone (ver "Identificação do cliente (sem conta)" abaixo) — pedida junto do checkout, não antes. Endereço entra aqui também se tipo = delivery.
6. **Confirmação do pedido**.
7. **Acompanhamento em tempo real**: status muda ao vivo, seguindo a máquina de estados acima. Cliente recupera "meus pedidos" digitando o mesmo CPF de novo, em qualquer aparelho.

## Específico deste app
- **Performance é prioridade** — maior volume de acesso, primeira impressão do cliente. Lazy loading de imagem, `React.lazy` por rota, Lighthouse antes de cada release maior.
- Item de cardápio some/desabilita automaticamente quando o estoque zera, via Realtime.
- PWA não é requisito agora, mas é barato deixar a porta aberta — sugestão a avaliar.

## Identificação do cliente (sem conta)
Decisão de produto (registrada aqui pra não se perder): este app **não tem cadastro/login tradicional pro cliente final** — sem senha, sem sessão de autenticação, sem tabela de usuário pro cliente. Motivo: público-alvo mais velho, muitos sem e-mail; qualquer fricção de conta derruba conversão. Modelo validado em projeto anterior do mesmo tipo.

Como funciona:
- **CPF é a chave de identificação**, não um `user_id`. Coletado (junto com nome e telefone) no momento do checkout, não na entrada do app.
- Validação é só client-side: campos obrigatórios + CPF com dígito verificador válido (`domain/customer/cpf.ts`, funções `isValidCpf`/`normalizeCpf`). **Sem chamada de backend pra "criar conta"** — não existe conta pra criar.
- Todo pedido salvo carrega `customer_name`, `customer_cpf`, `customer_phone` direto na linha de `orders` (ver "Modelo de dados").
- **"Meus pedidos"**: query filtra por `customer_cpf = <cpf informado>` (e `store_id`). Cliente recupera histórico em qualquer aparelho só repetindo o mesmo CPF — sem login.
- Endereço (`street`, `number`, `complement`, `neighborhood`, `city`, `state`, `zipCode`) só é pedido se o tipo de pedido for delivery — schema em `application/customer/schemas.ts` (`identificationSchema`), com endereço obrigatório via `superRefine` quando `wantsDelivery` é `true`.

**Risco de segurança aceito conscientemente**: CPF não é secreto — qualquer pessoa que souber o CPF de um cliente consegue ver o pedido/endereço dele digitando o mesmo CPF. Decisão consciente da pessoa dona do produto, favorecendo zero fricção sobre prova de identidade. Não tentar "consertar" isso com autenticação por conta própria (ver Segurança) — se o risco deixar de ser aceitável, a saída correta é telefone + código SMS via Supabase Auth nativo (Twilio), não um remendo caseiro.

Login/sessão com Supabase Auth (JWT) **continua existindo só pro lado lojista/admin** (`profiles.role = store_admin|super_admin`), gerenciado pelo repositório `admin` — nada disso vive neste repositório.

## Etapas de desenvolvimento
Este app depende de dado que só existe depois de algumas coisas prontas no `admin` — não dá pra testar cardápio de verdade sem loja/produto cadastrado:
1. **Confirmar dado de teste** — pelo menos 1 loja e alguns produtos já cadastrados no banco compartilhado (pode ser via SQL Editor direto, enquanto o CRUD de produto no `admin` não está pronto)
2. **Escolha de tipo de pedido** (tela de 3 cards) + **navegação do cardápio** filtrado por tipo (lendo de `public_products`) — pública, sem identificação
3. **Carrinho** — adicionar/remover item, ajustar quantidade
4. **Identificação do cliente** (nome/CPF/telefone, endereço se delivery) — parte do checkout, ver "Identificação do cliente (sem conta)"
5. **Confirmação do pedido**
6. **Acompanhamento de status em tempo real** — só faz sentido testar de ponta a ponta depois que o dashboard do `admin` também está mudando status

A tela de tipo de pedido filtra pelos `supports_dine_in/pickup/delivery` da loja resolvida via `/:storeSlug` (ver "Multi-tenancy" — `public_stores`).

**Checklist de revisão — rodar ao final de cada etapa acima, antes de avançar pra próxima:**
- [ ] **Clean Architecture**: a lógica de negócio dessa etapa está em `domain`/`application`, sem `import` de React ou do client Supabase ali dentro?
- [ ] **SOLID**: componente/hook novo faz uma coisa só? Alguma implementação concreta devia estar atrás de uma interface?
- [ ] **Segurança**: a query nova usa `public_products` (nunca `products` direto)? Operação crítica (confirmar pedido) tem validação no client + reforço em RPC?
- [ ] **Escalabilidade**: toda listagem nova tem paginação? Imagem de produto está otimizada/lazy?
- [ ] **Frontend**: segue a paleta/tipografia definidas? Mobile-first de verdade? Área de toque mínima 44x44px? Copy do lado do usuário?
- [ ] **Testes**: regra de negócio nova tem teste unitário? Se é fluxo crítico, pelo menos testado manualmente de ponta a ponta.

## Marco 1 — o que precisa estar pronto antes da Fase 2
- [ ] Identificação do cliente por CPF no checkout (sem conta/senha)
- [ ] Navegação do cardápio por categoria, respeitando estoque em tempo real
- [ ] Carrinho + seleção de tipo de pedido (local via QR/mesa, retirada, delivery)
- [ ] Confirmação do pedido (sem pagamento)
- [ ] Acompanhamento de status em tempo real
- [ ] Canal de revendedor (`/atacado`) pra lojas com `reseller_enabled`
- [ ] Pelo menos 1 teste E2E do fluxo completo + testes unitários do carrinho/domínio

## Exemplo de organização por feature (`cart`)
```
src/
  domain/cart/Cart.ts
  application/cart/CheckoutRepository.ts
  application/cart/confirmOrder.ts
  infrastructure/cart/SupabaseCheckoutRepository.ts
  presentation/cart/CartPage.tsx
  presentation/cart/useCart.ts
```

## Testes
- Vitest + React Testing Library (unitário/componente), Playwright (E2E, Fase 2), MSW (mock do Supabase nos testes unitários).
- E2E crítico: entrar via mesa/retirada/delivery → carrinho → identificação (nome/CPF/telefone) → confirmar pedido → status muda em tempo real.
- Acessibilidade básica: contraste, área de toque mínima (44x44px) nos botões do carrinho.
- Caso de borda: item fica sem estoque depois de já estar no carrinho.

## Segurança
- `service_role` do Supabase nunca no client. Variáveis de ambiente em `.env.local` (gitignored).
- Validação com Zod no client + reforço em RPC do Postgres pra operações críticas (confirmar pedido).
- **Cliente final**: sem conta/sessão, identificado só por CPF (ver "Identificação do cliente (sem conta)") — risco de exposição por CPF conhecido/adivinhado é aceito deliberadamente pela pessoa dona do produto, não é descuido.
- **Lojista/admin**: sessão via Supabase Auth (JWT); nunca autenticação própria. Essa regra vale pro repositório `admin`, não pro cliente final deste repositório.

## Escalabilidade
- Índice em `store_id` em toda tabela filtrada por loja. Paginação obrigatória em listagem.
- Code-splitting por rota. Imagens de produto otimizadas/lazy — impacto direto em conversão.
