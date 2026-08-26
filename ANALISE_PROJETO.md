# Análise do projeto

Pendências ainda em aberto, por prioridade. (Itens já corrigidos foram removidos deste arquivo — ver histórico do git pra detalhe de cada fix.)

---

## 🟢 P2 — pendências conhecidas, sem risco de quebrar

### 1. Rota `/atacado` (canal de revendedor) ainda não implementada
`src/App.tsx` não tem rota `/:storeSlug/atacado`, sem uso de `available_reseller`/`sales_channel` no código (só `resellerEnabled` no `Store`, decidindo se a loja *pode* ter a rota). Item aberto do Marco 1. CLAUDE.md já registra que o desenho original (`available_retail`/`available_reseller`) pode precisar de revisão, já que o catálogo migrou pra filtro por tipo de pedido (`available_dine_in/pickup/delivery`) nesse meio tempo — confirmar com o `admin` antes de implementar.

### 2. Sem Realtime de estoque
CLAUDE.md descreve como comportamento existente ("Item de cardápio some/desabilita automaticamente quando o estoque zera, via Realtime"), mas não tem `supabase.channel`/Realtime em lugar nenhum do código — é feature ainda não implementada, não regressão. Já é item do checklist do Marco 1 ("respeitando estoque em tempo real").

### 3. `SupabaseAddonRepository`/`SupabaseVariationRepository` consultam tabela direto, sem view `public_*` dedicada
Diferente de produtos/lojas/promoções. Filtram só por `product_id`, sem `store_id` explícito no client — quebra o padrão do resto do repo. **Investigado e testado ao vivo (2026-08-26)**: RLS está habilitada nas 6 tabelas (`addon_groups`, `addon_options`, `variation_groups`, `variation_options`, `product_addon_groups`, `product_variation_groups`); leitura sem escopo de loja é intencional (mesmo modelo de `products`/`public_products` — cardápio é público entre lojas por design, policy só filtra por `active`). Escrita (`INSERT`/`UPDATE`/`DELETE`) já estava bloqueada pela RLS (`current_role()` retorna `null` pra chamada sem sessão, nunca bate com `store_admin`/`super_admin`), confirmado com tentativa de `INSERT` real via chave `anon` (rejeitada, `42501`). Único problema real encontrado: `anon` tinha `GRANT INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER` nas 6 tabelas — permissão de tabela sobrando, sem uso, com a RLS como única trava. Corrigido via `REVOKE` (só `SELECT` sobra pro `anon` agora), reconfirmado ao vivo que leitura continua funcionando e escrita agora falha por `permission denied` (grant), não mais por RLS. Sem mais risco de segurança — o que resta é só estilo (essas 2 tabelas não passarem por view `public_*` como o resto do repo), não crítico.
