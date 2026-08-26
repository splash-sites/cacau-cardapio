import { expect, test, type Page } from '@playwright/test'

// Fluxo crítico completo (CLAUDE.md, seção Testes): entrar via mesa (QR) →
// carrinho → identificação (nome/CPF/telefone) → confirmar pedido → status
// muda. Roda contra o banco Supabase real (não tem staging ainda, ver
// CLAUDE.md "Fase 1") — usa loja e produto reais, sem variação/adicional
// (Água), pra não depender de estoque de teste específico. Gera um pedido
// real em produção, marcado com nome de teste pra ficar óbvio no admin.
const STORE_SLUG = 'cacau-show-capao'
const TABLE_NUMBER = '12'
const VALID_TEST_CPF = '111.444.777-35' // CPF com dígito verificador válido, não é de pessoa real

async function scrollUntilVisible(page: Page, locator: ReturnType<Page['getByRole']>) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await locator.isVisible()) return
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(50)
  }
  await expect(locator).toBeVisible()
}

test('mesa (QR) → cardápio → carrinho → identificação → confirmação → acompanhamento', async ({ page }) => {
  await page.goto(`/${STORE_SLUG}/mesa/${TABLE_NUMBER}`)
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  const addAguaButton = page.getByRole('button', { name: 'Ver detalhes de Água', exact: true })
  await scrollUntilVisible(page, addAguaButton)
  await addAguaButton.click()

  const dialog = page.getByRole('dialog', { name: 'Água' })
  await expect(dialog).toBeVisible()
  const confirmAddButton = dialog.getByRole('button', { name: 'Adicionar ao pedido' })
  await expect(confirmAddButton).toBeEnabled()
  await confirmAddButton.click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /Ver carrinho/ }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/carrinho`)
  await expect(page.getByText('Água')).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/identificacao`)

  await page.getByLabel('Nome completo').fill('Teste Playwright E2E')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await expect(page.getByLabel('Telefone')).not.toBeVisible()
  await expect(page.getByLabel('Número da mesa')).toHaveValue(TABLE_NUMBER)

  await page.getByRole('button', { name: 'Confirmar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByRole('heading', { name: 'Revisar pedido' })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(`Aguarde, sua mesa é a nº ${TABLE_NUMBER}.`)).toBeVisible()

  // Acompanhamento faz polling na RPC get_order_status a cada 5s — espera
  // sair do "carregando" e mostrar pelo menos o passo inicial (Recebido).
  await expect(page.getByText('Carregando status…')).not.toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'Fazer novo pedido' })).toBeVisible()
})
