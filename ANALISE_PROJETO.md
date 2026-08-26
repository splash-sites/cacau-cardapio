# Análise do projeto

Pendências ainda em aberto, por prioridade. (Itens já corrigidos foram removidos deste arquivo — ver histórico do git pra detalhe de cada fix.)

---

## 🟢 P2 — pendências conhecidas, sem risco de quebrar

### 1. Rota `/atacado` (canal de revendedor) ainda não implementada
`src/App.tsx` não tem rota `/:storeSlug/atacado`, sem uso de `available_reseller`/`sales_channel` no código (só `resellerEnabled` no `Store`, decidindo se a loja *pode* ter a rota). Item aberto do Marco 1. CLAUDE.md já registra que o desenho original (`available_retail`/`available_reseller`) pode precisar de revisão, já que o catálogo migrou pra filtro por tipo de pedido (`available_dine_in/pickup/delivery`) nesse meio tempo — confirmar com o `admin` antes de implementar.

### 2. Sem Realtime de estoque
CLAUDE.md descreve como comportamento existente ("Item de cardápio some/desabilita automaticamente quando o estoque zera, via Realtime"), mas não tem `supabase.channel`/Realtime em lugar nenhum do código — é feature ainda não implementada, não regressão. Já é item do checklist do Marco 1 ("respeitando estoque em tempo real").
