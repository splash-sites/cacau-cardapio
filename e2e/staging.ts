// Os E2E rodam SEMPRE contra o banco de staging (nunca producao): confirmam
// pedido de verdade. Loja de teste vem do seed
// (painel-adm-cacau/supabase/seed.sql, bloco "Loja dos testes E2E").
export const E2E_STORE_SLUG = process.env.E2E_STORE_SLUG ?? 'loja-e2e'
