# CLAUDE.md — Cardápio do cliente (Splash Pedidos)

Regras **vigentes**. Histórico de decisões (o "porquê" de cada coisa): [docs/historico.md](docs/historico.md). Pendências dos dois repos: `painel-adm-cacau/docs/backlog.md`. Banco: `painel-adm-cacau/supabase/` (este repo não tem migration — o schema mora no painel).

## Comandos
```bash
pnpm install                 # dependências
pnpm dev                     # contra PRODUÇÃO (.env.local) — só navegar, nunca confirmar pedido
pnpm dev --mode staging      # contra STAGING (.env.staging.local) — use este pra testar
pnpm test                    # Vitest (unitário)
pnpm test:e2e                # Playwright contra o STAGING (loja-e2e do seed; confirma pedido lá)
pnpm lint                    # oxlint
pnpm build                   # tsc -b + vite build
node scripts/check-shared-rules.mjs   # confere se o bloco "Regras compartilhadas" bate com o do painel-adm-cacau
```
Rodando junto com o painel: cardápio em `--port 5175`, painel em `--port 5176` (o painel aponta `VITE_STOREFRONT_URL` pra `http://localhost:5175`).

<!-- REGRAS-COMPARTILHADAS:INICIO -->
## Regras compartilhadas (Splash Pedidos)

> **Este bloco é idêntico no `CLAUDE.md` do `painel-adm-cacau` e do `cacau-cardapio`.** Mudou aqui, muda lá no mesmo commit — `node scripts/check-shared-rules.mjs` compara os dois e falha se divergirem. Última conferência contra o banco real: 2026-10-11.

### Produto e repositórios
- **Splash Pedidos**: SaaS de pedidos multi-loja. Primeira cliente: Kaká o Show (Cacau Show Torres e Capão da Canoa). Tudo precisa servir qualquer loja futura — nada de nome de loja fixo no código.
- `painel-adm-cacau` = painel da loja (login, pedidos, catálogo, relatórios). `cacau-cardapio` = cardápio do cliente final (sem login). Os dois falam **direto** com o mesmo Supabase (sem backend próprio); deploy de cada um na Vercel.
- Lugar de cada coisa: regra vigente → `CLAUDE.md` · decisões antigas e o porquê → `docs/historico.md` · pendências → `painel-adm-cacau/docs/backlog.md` · banco → `painel-adm-cacau/supabase/`.

### Ambientes
| | Supabase | Como rodar local |
|---|---|---|
| **Produção** | projeto `ybvg…sscg` — clientes reais | `.env.local` → `pnpm dev` |
| **Staging** | projeto `splash-pedidos-staging` (`nybq…jmvr`) — só dado falso | `.env.staging.local` → `pnpm dev --mode staging` |

- **Teste que grava dado (pedido, status, cadastro) é só no staging.** Produção: só leitura, ou ação real da loja.
- Staging tem lojas falsas (`loja-a`, `loja-b` e `loja-e2e`, usada só pelos testes Playwright) e logins `super@teste.local` (super_admin) e `lojab@teste.local` (store_admin da Loja B). Recriar dados: `supabase/seed.sql`.
- **Testes E2E (Playwright) só rodam contra o staging**: o `playwright.config.ts` sobe o app com `--mode staging` e se recusa a rodar se o `.env.staging.local` faltar ou apontar pro mesmo Supabase da produção.
- Senha do banco (connection string) **nunca** em variável `VITE_*` (vai pro JavaScript público) e nunca no repo. Front só usa a chave `sb_publishable_…`.
- Projeto no plano grátis do Supabase **pausa sozinho após ~7 dias sem uso** — já derrubou a produção uma vez (2026-10-08). Plano Pro (não pausa, tem backup diário) é o recomendado enquanto houver cliente real.

### Banco de dados — fonte de verdade e como mudar
- **Fonte de verdade = `painel-adm-cacau/supabase/migrations/`.** O baseline (`20261011000000_baseline_from_prod.sql`) foi extraído da produção com `pg_dump`. Nenhum doc lista coluna por coluna — pra saber o schema, ler a migration.
- **Toda mudança de banco (tabela, coluna, RLS, função, trigger, grant):**
  1. vira um arquivo novo em `supabase/migrations/` (`AAAAMMDDHHMMSS_descricao.sql`), nunca editar migration já aplicada;
  2. aplica e testa no **staging**;
  3. só depois aplica na **produção**, mesmo arquivo;
  4. atualiza este bloco se mudou alguma regra.
  SQL Editor direto na produção, sem migration, está proibido.
- **Mudança sempre retrocompatível** (o banco serve `main` e `dev` ao mesmo tempo): coluna nova opcional ou com default; nunca renomear/remover coluna ou apertar regra que o código em produção ainda usa — primeiro sai o código, depois o banco.
- **Mudar assinatura de função** (`create or replace` com parâmetro novo) cria **outra versão** em vez de substituir. Sempre `drop function` da antiga na mesma migration e conferir: `select oid::regprocedure from pg_proc where proname = '<nome>'` tem que voltar 1 linha.
- **View pública nova**: criar já com `revoke insert, update, delete` de `anon`/`authenticated` (as views `public_*` não são `security_invoker`; com escrita liberada, passariam por cima do RLS).
- Event trigger `ensure_rls` liga RLS sozinho em tabela nova — mas política (quem lê/escreve) continua sendo escrita à mão e **testada** (ver Segurança).

### Separação entre lojas e segurança
- Toda tabela de domínio tem `store_id`. **RLS ligado em todas as 20 tabelas.** `super_admin` vê todas as lojas; `store_admin` só a dele (`current_role()`, `current_store_id()`). Testado 2026-10-11 no staging: Loja B não lê nem altera nada da Loja A.
- Filtro só no front não é segurança — quem garante é RLS + checagem dentro da função.
- **Cliente final nunca lê tabela de pedido.** Lê só as views `public_*` (sem `cost_price`/`external_code`) e escreve/consulta só por função: `confirm_order`, `get_order_status` (exige id do pedido + CPF), `list_orders_by_cpf` (sem endereço).
- **Funções do banco**: estão executáveis por qualquer um (`PUBLIC`), então **cada função confere por dentro quem chamou** (papel e loja). Testado 2026-10-11: todas recusam chamada de outra loja e de anônimo. Função nova segue a mesma regra; funções só de sistema (`copy_catalog`, `reseller_stock_apply`) têm `revoke` e só rodam via `service_role`/trigger.
- **Edge Functions** (rodam com `service_role`, sempre validam o JWT de quem chamou antes; `verify_jwt` ligado em todas): `setup-first-admin`, `create-admin-user`, `update-admin-user`, `delete-admin-user`, `copy-catalog`. Fonte de verdade = `painel-adm-cacau/supabase/functions/`; mesmo fluxo do banco (staging primeiro, depois produção — comandos no `supabase/README.md`). Testado 2026-10-11 no staging: sem login → 401, `store_admin` → 403.
- `service_role` nunca no front.
- Antes de dar feature como pronta no painel: rodar o agente `security-sweep` (`painel-adm-cacau/.claude/agents/`). Achado CRÍTICO/ALTO bloqueia.

### Contas e identificação
- **Cliente final não tem conta** (decisão 2026-10-11). Identifica-se por nome + CPF + telefone a cada pedido; "Meus pedidos" = digitar o CPF de novo. Risco aceito: quem souber o CPF vê os pedidos (itens e status, sem endereço). Se deixar de ser aceitável, a saída é código por SMS (Supabase Auth), nunca algo caseiro.
- No banco sobrou a conta de cliente pela metade (`orders.customer_id`, papel `customer`, trigger `handle_new_user`) — **sem uso, não construir em cima**. **Cadastro público do Supabase Auth desligado** (staging e produção, 2026-10-11): ninguém cria conta pela API; logins só nascem pelas Edge Functions (`auth.admin.createUser`).
- Login só no painel: `super_admin` e `store_admin`, criados pelas Edge Functions. Papel e loja só se definem na criação.

### Pedido: status
- `received → preparing → out_for_delivery → delivered → finalized`. **Mesa (`dine_in`) pula `out_for_delivery`.** `cancelled` só a partir de `received`.
- `out_for_delivery` aparece como "Saiu pra entrega" (entrega) ou "Pronto pra retirada" (retirada) — mesmo valor no banco, rótulo muda pelo tipo.
- `delivered` = entregue fisicamente. `finalized` = pago/fechado pela atendente (orientação de uso, o sistema não confere pagamento).
- Aceitar (`received → preparing`) **exige atendente**; o atendente fica gravado no pedido.
- Toda transição passa por `change_order_status`/`revert_order_status` e grava em `order_status_history` (quem e quando). O status inicial também entra no histórico, na hora em que o pedido nasce (trigger `orders_initial_status_history`). Voltar etapa só até `delivered`. Editar itens só em `received`.
- Cancelar pede motivo na tela (`orders.cancellation_reason`); a função ainda aceita sem motivo — travar é backlog.
- Pedido de mesa entra sozinho na comanda aberta da mesa (trigger `assign_table_session`); a comanda fecha manual, pelo painel.

### Preço
- **Preço nunca vem do front.** `confirm_order` recalcula tudo no servidor (produto, variação, adicional, combo/desconto) e grava cópia congelada no item (`order_items.unit_price`, `order_item_addons`, `order_item_variations`). Mudar preço depois não altera pedido feito.
- Variação: obrigatória (1 por grupo vinculado). `replace` substitui o preço do produto; `additive` soma. Adicional: opcional, sempre soma, fora do desconto de combo.
- **Cacau Lover**: preço menor mostrado lado a lado em produto, adicional e variação (`lover_price`; vazio = mesmo preço). Hoje é só exibição — quem é Lover é conferido na entrega. **Decidido (a implementar):** ao finalizar o pedido o painel pergunta se o cliente é Lover; o pedido guarda também o preço Lover congelado; Relatórios somam pelo preço que valeu.
- Combo/desconto: promoção = produto principal + itens extras (`promotion_combo_items`) + desconto opcional (percentual ou valor fixo), validado dentro de `confirm_order`. Desconto vale também sobre o Lover.

### Estoque
- **Varejo**: chave por produto `track_stock`. **Decidido (a implementar):** ligada = conta unidades (pedido desconta, cancelamento devolve, recusa pedido acima do saldo); desligada = ignora estoque. **Hoje** a chave ligada só bloqueia quando o saldo já é 0 — não desconta.
- **Revenda (atacado)**: estoque próprio (`reseller_stock_quantity`, chave `reseller_track_stock`), desconta e devolve sozinho por trigger. Já funciona.

### Canais e cardápio
- Tipos de pedido: `dine_in` (mesa/cafeteria), `pickup` (retirada), `delivery` (entrega). Loja liga cada um em `stores.supports_*`.
- No cardápio, retirada e entrega são **um cardápio só**, filtrado por `available_pickup`. `available_delivery` está aposentado (fica no banco, ninguém usa).
- **Revenda** (`/:slug/atacado`, só se `stores.reseller_enabled`): filtra por `available_reseller`, pedido com `sales_channel = 'reseller'`, só retirada (nunca mesa).
- Mesa via QR: `/:slug/mesa/:numero` (gerado em Configurações do painel com `VITE_STOREFRONT_URL`).
- Ordem no cardápio: categorias, produtos, grupos de adicional/variação e as opções dentro de cada grupo, todos por `sort_order`, definida no painel.

### Git, deploy e verificação
- `main` = produção (deploy automático na Vercel). `dev` = dia a dia (Preview Deployment). Release: `git checkout main && git merge dev && git tag vX.Y.Z && git push origin main --tags`. Hotfix: branch da `main` → merge na `main` **e** na `dev`.
- Vercel (2026-10-11): variáveis `VITE_SUPABASE_*` separadas por ambiente, tipo Config — **Production → banco de produção**, **Preview (`dev` e outras branches) → staging**. Mudou variável? Redeploy (ela entra no build).
- Antes de dar qualquer tarefa como pronta: `pnpm test`, `pnpm lint`, `pnpm build` limpos **e** ver funcionando no navegador contra o staging. Type-check não substitui ver a tela.
- Arquitetura dos dois apps: `domain` (regra pura, sem React/Supabase) → `application` (portas e casos de uso) → `infrastructure` (Supabase) → `presentation` (React). Dependência sempre de fora pra dentro; componente nunca importa o client Supabase.
- Textos de interface do lado de quem usa (o botão "Confirmar pedido" gera "Pedido confirmado"); foco de teclado sempre visível; respeitar `prefers-reduced-motion`.
<!-- REGRAS-COMPARTILHADAS:FIM -->

## Este app — cardápio do cliente

### Stack
React 19 + Vite 8 + TypeScript `strict` · Tailwind v4 (`@tailwindcss/vite`, tokens no `@theme` de `src/index.css`) · TanStack Query (servidor) + Zustand (estado de UI; dados do cliente com `persist`) · React Hook Form + Zod · `lucide-react` · Vitest + Testing Library + Playwright · pnpm. Rotas com `React.lazy`.

### Rotas e fluxo
| Rota | Tela |
|---|---|
| `/` | "Acesse pelo link da sua loja." |
| `/:slug` | Escolha do tipo de pedido: **Cafeteria** (`dine_in`) ou **Para Levar/Entrega** (vira `pickup`; `delivery` só se a loja não aceita retirada) |
| `/:slug/mesa/:numero` | Entrada por QR: já marca `dine_in` + número da mesa e vai pro cardápio (mesa inválida ou loja sem `dine_in` → volta pra escolha) |
| `/:slug/atacado` | Entrada da revenda (só com `reseller_enabled`): canal `reseller`, só retirada |
| `/:slug/cardapio` | Cardápio por categoria + carrossel de promoções |
| `/:slug/carrinho` | Carrinho |
| `/:slug/identificacao` | Nome, CPF, telefone; toggle "Retirar no balcão / Receber em casa" (só varejo, loja com os dois); endereço só se entrega |
| `/:slug/revisao` | Revisão → `confirm_order` → acompanhamento |
| `/:slug/pedidos` | "Meus pedidos" por CPF (`list_orders_by_cpf`) |

### Regras deste app
- **Tudo é escopado pela loja do `/:slug`** (resolvida em `public_stores`). Nunca buscar produto sem `store_id` — já misturou produto de duas lojas no carrinho uma vez.
- **Só lê views `public_*`** (+ a tabela `categories`, liberada por RLS pra leitura das ativas). Nunca a tabela `products` (tem `cost_price`). Precisa de campo que só existe na tabela? Ele entra na view (migration no painel), não se lê a tabela.
- **Escrita só por função**: `confirm_order` (preço recalculado no servidor; o front manda só ids, quantidades, observação, adicionais, variações e `promotion_id` do combo).
- Cardápio filtrado pelo tipo escolhido: mesa → `available_dine_in`; retirada/entrega → `available_pickup`; revenda → `available_reseller`. Produto inativo, indisponível no canal ou esgotado não aparece / fica desabilitado. Promoção cujo produto sumiu também some (`visiblePromotions`).
- **Carrinho**: mesma combinação produto + variação + adicionais = mesma linha; combinação diferente = linha separada. Na revenda, quantidade limitada ao saldo do canal; erro de estoque recarrega o saldo e ajusta o carrinho.
- **Preço Lover** mostrado lado a lado em todo lugar que mostra preço (cardápio, carrinho, revisão, mensagem de WhatsApp).
- **Acompanhamento**: polling de `get_order_status` a cada 5s até `finalized`/`cancelled` (sem Realtime). Recarregar a página perde a tela de acompanhamento; o pedido continua em "Meus pedidos".
- **WhatsApp**: só pedido `delivery` com `whatsapp_number` na loja gera link `wa.me` com o resumo. É atalho; a fonte de verdade é o banco.
- **Dados do cliente** (nome, CPF, telefone) ficam salvos no aparelho (`localStorage` `splash-customer`) pra não repetir; endereço é sempre pedido de novo. Tipo de pedido e canal (varejo/atacado) ficam **só em memória** — F5 volta pro varejo (backlog).
- Sem pagamento no sistema: combinado na entrega/retirada/mesa.

### Identidade visual (mobile-first — maioria usa no celular)
- Paleta (tokens no `@theme`): `background #F0ECD2` / `foreground #030404` · `primary #CF9047` (CTA) · `secondary #7B431B` · `accent #2C120B`.
- Status do pedido em cor funcional do Tailwind: `received`/`preparing` âmbar · `out_for_delivery`/`delivered` azul · `finalized` verde · `cancelled` vermelho. Acompanhamento numerado (é sequência real).
- Fontes: `--font-display` **Orelega One** (títulos, nome de produto; só peso 400 — `font-bold` não engrossa de verdade) · `--font-body` **Inter**.
- Área de toque mínima **44x44px** no carrinho/checkout. Imagem de produto lazy. Desenhar pro celular primeiro.

### Checklist antes de dar uma tarefa como pronta
1. Regra de negócio em `domain`/`application`, com teste unitário (carrinho, preço, disponibilidade, CPF…).
2. Leitura nova? Só view `public_*` ou função; listagem com paginação.
3. Mudança de banco? Migration no `painel-adm-cacau/supabase/migrations/`, testada no staging.
4. `pnpm test`, `pnpm lint`, `pnpm build` limpos.
5. Fluxo testado no navegador **contra o staging**, em tela de celular, até o pedido aparecer no painel.
6. Regra nova/alterada registrada aqui (e no bloco compartilhado, se valer pros dois apps). Porquê → `docs/historico.md`. Pendência → backlog do painel.
