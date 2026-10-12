import { expect, test, type Page } from '@playwright/test'
import { E2E_STORE_SLUG } from './staging'

// Fluxo pickup/delivery unificado (CLAUDE.md "Padrões de frontend" / etapa 2 do
// checkout): botão "Pedir para levar ou entregar" -> orderType chega como 'pickup' ->
// checkout mostra o toggle retirar/receber só quando a loja aceita os dois.
// Testa o toggle indo e voltando (mostra/esconde endereço) e fecha o fluxo
// pela opção "Retirar no balcão" — nenhum produto da loja de teste tem
// available_delivery=true hoje, então "Receber em casa" fica só coberto até
// o toggle, sem confirmar pedido por esse braço.
const STORE_SLUG = E2E_STORE_SLUG
const VALID_TEST_CPF = '111.444.777-35'

async function scrollUntilVisible(page: Page, locator: ReturnType<Page['getByRole']>) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await locator.isVisible()) return
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(50)
  }
  await expect(locator).toBeVisible()
}

test('Pedir para levar ou entregar → toggle retirar/receber → confirmação como retirada', async ({ page }) => {
  await page.goto(`/${STORE_SLUG}`)
  await page.getByRole('button', { name: /Pedir para levar/ }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  const addAguaButton = page.getByRole('button', { name: 'Ver detalhes de Água', exact: true })
  await scrollUntilVisible(page, addAguaButton)
  await addAguaButton.click()

  const dialog = page.getByRole('dialog', { name: 'Água' })
  await dialog.getByRole('button', { name: 'Adicionar ao pedido' }).click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /Ver sacola/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/identificacao`)

  const radioGroup = page.getByRole('radiogroup', { name: 'Retirar ou receber' })
  await expect(radioGroup.getByRole('radio', { name: 'Retirar no balcão' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByLabel('Rua')).not.toBeVisible()

  await radioGroup.getByRole('radio', { name: 'Receber em casa' }).click()
  await expect(page.getByLabel('Rua')).toBeVisible()

  await radioGroup.getByRole('radio', { name: 'Retirar no balcão' }).click()
  await expect(page.getByLabel('Rua')).not.toBeVisible()

  await page.getByLabel('Nome completo').fill('Teste Playwright Retirada')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await page.getByLabel('Telefone').fill('51991726861')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByRole('heading', { name: 'Retirada no balcão' })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
})
