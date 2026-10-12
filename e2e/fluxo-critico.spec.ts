import { expect, test, type Page } from '@playwright/test'
import { E2E_STORE_SLUG } from './staging'

// Fluxo crítico completo (CLAUDE.md, seção Testes): entrar via mesa (QR) →
// carrinho → identificação (nome/CPF/telefone) → confirmar pedido → status
// muda. Roda contra o banco de STAGING (e2e/staging.ts, playwright.config.ts),
// na loja de teste `loja-e2e` do seed, com produto sem variação/adicional
// (Água). Gera um pedido no staging, com nome de teste pra ficar óbvio no painel.
const STORE_SLUG = E2E_STORE_SLUG
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
  await expect(page.getByRole('heading', { name: `Você está na mesa ${TABLE_NUMBER}` })).toBeVisible()
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
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

  await page.getByRole('button', { name: /Ver sacola/ }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/carrinho`)
  await expect(page.getByText('Água')).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/identificacao`)

  await page.getByLabel('Nome completo').fill('Teste Playwright E2E')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await expect(page.getByLabel('Telefone')).not.toBeVisible()
  await expect(page.getByLabel('Número da mesa')).toHaveValue(TABLE_NUMBER)

  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByRole('heading', { name: 'Tudo certo?' })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(`Mesa ${TABLE_NUMBER}. A gente leva até você.`)).toBeVisible()

  // Acompanhamento faz polling na RPC get_order_status a cada 5s — espera
  // sair do "carregando" e mostrar pelo menos o passo inicial (Recebido).
  await expect(page.getByText('Carregando status…')).not.toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'Fazer outro pedido' })).toBeVisible()
})
