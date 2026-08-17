# Análise do projeto

Pendências ainda em aberto, por prioridade. (Itens já corrigidos foram removidos deste arquivo — ver histórico do git pra detalhe de cada fix.)

---

## 🟢 P2 — pendências conhecidas, sem risco de quebrar

### 1. Rota `/atacado` (canal de revendedor) ainda não implementada
`src/App.tsx` não tem rota `/:storeSlug/atacado`, sem uso de `available_reseller`/`sales_channel` no código (só `resellerEnabled` no `Store`, decidindo se a loja *pode* ter a rota). Item aberto do Marco 1. CLAUDE.md já registra que o desenho original (`available_retail`/`available_reseller`) pode precisar de revisão, já que o catálogo migrou pra filtro por tipo de pedido (`available_dine_in/pickup/delivery`) nesse meio tempo — confirmar com o `admin` antes de implementar.

### 2. Sem teste E2E (Playwright)
`package.json` não tem `test:e2e` nem dependência de Playwright. Item aberto do Marco 1/Fase 2.

### 3. Sem Realtime de estoque
CLAUDE.md descreve como comportamento existente ("Item de cardápio some/desabilita automaticamente quando o estoque zera, via Realtime"), mas não tem `supabase.channel`/Realtime em lugar nenhum do código — é feature ainda não implementada, não regressão. Já é item do checklist do Marco 1 ("respeitando estoque em tempo real").

### 4. `SupabaseAddonRepository`/`SupabaseVariationRepository` consultam tabela direto, sem view `public_*` dedicada
Diferente de produtos/lojas/promoções. Filtram só por `product_id`, sem `store_id` explícito no client. Não é necessariamente falha — o `product_id` já vem pré-filtrado por loja via `public_products`, e a defesa real é RLS no Supabase, não o filtro do client — mas quebra o padrão do resto do repo. **Precisa confirmar com quem mantém o RLS** se `addon_groups`/`variation_groups` tem policy que valida a cadeia até `store_id`, ou se um `product_id` de outra loja passado manualmente vazaria preço/opção de adicional de loja errada.
