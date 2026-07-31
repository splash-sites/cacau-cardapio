# Análise do projeto — 2026-07-29

Pendências ainda em aberto, por prioridade. (P0 de schema já verificado OK, docs já atualizadas no CLAUDE.md — removido daqui.)

---

## 🟡 P1 — inconsistência que vai gerar bug ou confundir

### 1. ~~Preço Lover de variação/adicional não aparecia por opção~~ — corrigido
Banco e query sempre estiveram certos (`admin` rodou o `ALTER TABLE`, dado de "Frutas" do Fondue já veio preenchido: Morango 26→24, Banana 22→21, Misto 24→22 — confirmado via API). O bug era só de tela: `VariationGroupSection`/`AddonGroupSection` em `ProductDetailModal.tsx` nunca renderizavam `option.loverPrice`, só `option.price` — por isso "não aparecia" mesmo com o dado certo chegando do banco. Corrigido nesta sessão: cada opção agora mostra os dois preços (Lover em destaque, normal embaixo, só quando diferem), mesmo padrão da linha do produto base.

**Não testado visualmente no navegador** (sem ferramenta de screenshot disponível na sessão) — validado por leitura de código + tsc/lint/testes (83/83) limpos. Conferir na tela antes de considerar fechado. `addon_options.lover_price` (Chantilly/Bytes) segue `null` — o admin ainda não preencheu esse lado, mas o código já está pronto pra quando preencher.

### 2. ~~`useProductAddons`/`useProductVariations` falhavam em silêncio~~ — corrigido
`ProductDetailModal.tsx` agora lê `isError` **e `isPending`** dos dois hooks (`optionsLoadError`, `optionsLoading`). Botão "Adicionar ao pedido" desabilita nos dois casos — erro final ou ainda carregando/tentando de novo — e mostra texto correspondente ("Não foi possível carregar as opções..." / "Carregando opções…").

**Achado durante o teste manual (testado no navegador desta vez)**: a primeira versão só tratava `isError`, não `isPending`. `useQuery` do TanStack tem retry automático (3 tentativas, backoff, ~7s até desistir) — nesse intervalo a query tá "pending", não "error", e a primeira versão deixava adicionar ao carrinho normalmente durante esse tempo, sem esperar. Corrigido adicionando `isPending` ao gate do botão. Sem esse ajuste, simular offline via DevTools mostrava o item sendo adicionado mesmo com adicional obrigatório configurado.

---

## 🟢 P2 — pendências conhecidas, sem risco de quebrar

### 3. Rota `/atacado` (canal de revendedor) ainda não implementada
`src/App.tsx` não tem rota `/:storeSlug/atacado`, sem uso de `available_reseller`/`sales_channel` no código (só `resellerEnabled` no `Store`, decidindo se a loja *pode* ter a rota). Item aberto do Marco 1. CLAUDE.md já registra que o desenho original (`available_retail`/`available_reseller`) pode precisar de revisão, já que o catálogo migrou pra filtro por tipo de pedido (`available_dine_in/pickup/delivery`) nesse meio tempo — confirmar com o `admin` antes de implementar.

### 4. Sem teste E2E (Playwright)
`package.json` não tem `test:e2e` nem dependência de Playwright. Item aberto do Marco 1/Fase 2.

---

# Varredura completa — 2026-07-31

Auditoria de todo o `src/` (Clean Architecture, SOLID, segurança, escalabilidade, renderização, excesso de requests, erro silencioso), feita via subagente antes da reta final de testes. 13 achados. Corrigidos nesta sessão: 1, 2, 3, 4, 5, 6, 8, 9 (listados abaixo). Ainda em aberto: 7, 11 (precisam decisão/coordenação, não são fix de código isolado). 12 e 13 avaliados e descartados (ver notas).

## Corrigidos

**1 e 2 (crítico) — `useOrderStatus`/`OrderTrackingView` e `useOrderHistory`/`OrdersPage` falhavam em silêncio.**
Mesma classe de bug do item 2 da seção anterior (erro de `useQuery` escondido), só que não tinha sido replicado nesses dois fluxos — que são justamente os que o cliente usa **depois** de já ter confirmado ou tentado recuperar um pedido. Se a RPC falhasse, a tela de acompanhamento travava sem status pra sempre sem aviso, e "Meus pedidos" ficava em branco (indistinguível de "carregando" ou "sem pedidos"). Corrigido: os dois hooks agora expõem `isPending`/`isError`, e as telas mostram aviso vermelho "Tentando de novo automaticamente…" (o polling de 5s já é automático nos dois casos, não precisa botão de retry).

**3 (médio) — `maskPhone` corrompia telefone fixo.**
A máscara sempre assumia formato de celular (DDD + 9 + 4 + 4), então um fixo de 10 dígitos (`5133334444`) virava `"(51) 3 3334-444"` — último grupo com 3 dígitos, reprovado pela validação ("Telefone inválido") mesmo digitado certo. Corrigido: distingue celular de fixo pelo 1º dígito do número local (só celular começa com 9 no plano de numeração BR) — `domain/customer/phone.ts`, testes cobrindo os dois formatos.

**4 (médio) — `ProductDetailModal` não respeitava `prefers-reduced-motion`.**
`ImageLightbox.tsx` já tinha `motion-reduce:transition-none` nas transições; o modal de produto (o componente mais usado do fluxo) não tinha. Adicionado nas duas transições (overlay + bottom-sheet).

**5 (médio) — `QueryClient` sem `staleTime`, refetch a cada volta pro cardápio.**
`main.tsx` agora define `staleTime: 30_000` global. Queries com `refetchInterval` próprio (status/histórico de pedido) não são afetadas — `refetchInterval` tem prioridade sobre `staleTime`.

**6 (médio) — nenhuma rota usava `React.lazy`, apesar do CLAUDE.md listar como requisito.**
`App.tsx` agora usa `React.lazy` + `Suspense` por rota. Confirmado com `pnpm build`: cada página virou chunk separado (`MenuPage` ~22kB, `IdentificationPage` ~69kB, etc.), não é só código morto — o bundle inicial (`index-*.js`) não carrega mais o JS de todas as telas de uma vez.

**8 (médio) — histórico "Meus pedidos" sem paginação.**
A RPC `list_orders_by_cpf` não é deste repositório (não dá pra adicionar `LIMIT`/`OFFSET` nela sem coordenar com quem a mantém) — fix aplicado foi client-side: `domain/order/recentOrders.ts` ordena por `createdAt` desc e corta em 50 na aba "Histórico" (aba "Hoje" já é naturalmente pequena). **Isso limita só a renderização, não a query** — a RPC continua trazendo o histórico inteiro do CPF a cada chamada. Se algum store tiver clientes com centenas de pedidos, o fix real é a RPC aceitar `p_limit`/`p_offset` (ou keyset por `created_at`) — pendência de schema, registrar com quem mantém as RPCs.

**9 (baixo) — `useMenu` disparava fetch antes do redirect quando `orderType` é nulo.**
Se o cliente cai direto em `/cardapio` sem escolher tipo de pedido, a página buscava o cardápio com `orderType ?? 'dine_in'` e descartava no mesmo ciclo pelo `<Navigate>`. Corrigido com `enabled: orderType !== null` no `useMenu` — não fetcha mais à toa.

## Ainda em aberto (não é fix de código isolado)

**7 (médio) — sem Realtime de estoque.** CLAUDE.md descreve como comportamento existente ("Item de cardápio some/desabilita automaticamente quando o estoque zera, via Realtime"), mas não tem `supabase.channel`/Realtime em lugar nenhum do código — é feature ainda não implementada, não regressão. Já é item do checklist do Marco 1 ("respeitando estoque em tempo real"). Fora do escopo desta rodada de bugfix por ser feature nova, não correção.

**11 (baixo, "verificar") — `SupabaseAddonRepository`/`SupabaseVariationRepository` consultam tabela direto, sem view `public_*` dedicada** (diferente de produtos/lojas/promoções). Filtram só por `product_id`, sem `store_id` explícito no client. Não é necessariamente falha — o `product_id` já vem pré-filtrado por loja via `public_products`, e a defesa real é RLS no Supabase, não o filtro do client — mas quebra o padrão do resto do repo. **Precisa confirmar com quem mantém o RLS** se `addon_groups`/`variation_groups` tem policy que valida a cadeia até `store_id`, ou se um `product_id` de outra loja passado manualmente vazaria preço/opção de adicional de loja errada.

## Avaliados e descartados

**12 — acoplamento de `presentation` a repository concreto.** Consistente em todo o projeto (`useMenu`, `usePromotions`, `useOrderHistory` etc. importam a instância `Supabase*Repository` direto, não injetada). É dívida arquitetural leve, mas a regra literal do CLAUDE.md ("presentation nunca importa o client Supabase direto") não é violada, e o próprio CLAUDE.md pede pra não superengenheirar. Decisão: manter como está.

**13 — imagem do `ProductDetailModal` sem `width`/`height`.** Falso alarme: o container já tem `aspect-square w-full`, que reserva o espaço via CSS antes da imagem carregar — não há layout shift real de qualquer forma. Não precisa de fix.
