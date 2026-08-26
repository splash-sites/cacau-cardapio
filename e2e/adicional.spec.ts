import { expect, test, type Page } from '@playwright/test'

// Fluxo de adicional (selection_type 'multiple', sem max_quantity) nunca
// tinha passado por E2E — só variação tinha sido coberta. Fondue é o único
// produto da loja com grupo de adicional hoje ("Adc Fondue": Bytes,
// Granulado), então também exercita variação obrigatória junto (mesmo
// produto tem os 2 grupos), sem depender de promoção/combo desta vez —
// abre o ProductDetailModal normal, não o de combo.
const STORE_SLUG = 'cacau-show-capao'
const TABLE_NUMBER = '12'
const VALID_TEST_CPF = '111.444.777-35'

async function scrollUntilVisible(page: Page, locator: ReturnType<Page['getByRole']>) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await locator.isVisible()) return
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(50)
  }
  await expect(locator).toBeVisible()
}

test('adicional múltiplo (Bytes + Granulado) em produto com variação obrigatória', async ({ page }) => {
  await page.goto(`/${STORE_SLUG}/mesa/${TABLE_NUMBER}`)
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  // Botão real do ProductCard (não o slide do carrossel, que também usa
  // "Ver detalhes de Fondue" como aria-label — é um <div role="button">, este
  // aqui é o <button> de verdade da listagem).
  const openFondue = page.locator('button[aria-label="Ver detalhes de Fondue"]')
  await scrollUntilVisible(page, openFondue)
  await openFondue.click()

  const dialog = page.getByRole('dialog', { name: 'Fondue' })
  await expect(dialog).toBeVisible()
  const addButton = dialog.getByRole('button', { name: 'Adicionar ao pedido' })
  await expect(addButton).toBeDisabled()

  await dialog.getByRole('radio', { name: 'Banana' }).click()
  await dialog.getByRole('radio', { name: 'Chocolate preto' }).click()
  await expect(addButton).toBeEnabled()

  const bytesCheckbox = dialog.getByRole('checkbox', { name: 'Bytes' })
  const granuladoCheckbox = dialog.getByRole('checkbox', { name: 'Granulado' })
  await expect(bytesCheckbox).toHaveAttribute('aria-checked', 'false')
  await bytesCheckbox.click()
  await granuladoCheckbox.click()
  await expect(bytesCheckbox).toHaveAttribute('aria-checked', 'true')
  await expect(granuladoCheckbox).toHaveAttribute('aria-checked', 'true')

  await addButton.click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /Ver carrinho/ }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/carrinho`)
  await expect(page.getByText(/Bytes/)).toBeVisible()
  await expect(page.getByText(/Granulado/)).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByLabel('Nome completo').fill('Teste Playwright Adicional')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await expect(page.getByLabel('Telefone')).not.toBeVisible()
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByText(/Bytes/)).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
})
