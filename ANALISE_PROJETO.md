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
