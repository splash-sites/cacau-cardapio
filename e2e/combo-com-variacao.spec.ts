import { expect, test, type Page } from '@playwright/test'

// Combo com desconto, cobrindo o caso mais complexo do domínio: um item do
// combo (Fondue) com 2 grupos de variação obrigatórios (sabor de fruta +
// sabor do chocolate) e outro item (Água) sem variação nenhuma, com desconto
// fixed_amount aplicado sobre a soma dos dois. Usa a promoção de teste já
// existente em produção ("TESTE - Fondue com desconto").
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

test('promoção de combo → variação obrigatória em 2 grupos → carrinho agrupado → confirmação', async ({ page }) => {
  // Desliga autoplay do carrossel (respeita prefers-reduced-motion) — evita
  // corrida entre o teste e a rotação automática de slide a cada 3.5s.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/${STORE_SLUG}/mesa/${TABLE_NUMBER}`)
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  // Loja tem 2 promoções de Fondue em produção — a de teste é a 2ª
  // (sort_order 1), a de combo real ("COMBO FONDUE + PASTEL FRITO") vem
  // primeiro no carrossel.
  await page.getByRole('tab', { name: 'Ver promoção 2' }).click()

  // Carrossel some se a promoção não estiver visível (produto do combo sem
  // estoque/canal) — falha aqui já denuncia isso, não precisa de asserção extra.
  const comboSlide = page.locator('div[role="button"][aria-label="Ver detalhes de Fondue"]')
  await expect(comboSlide).toBeVisible({ timeout: 10_000 })
  await comboSlide.click()

  const dialog = page.getByRole('dialog', { name: 'TESTE - Fondue com desconto' })
  await expect(dialog).toBeVisible()

  const addButton = dialog.getByRole('button', { name: 'Adicionar combo' })
  await expect(addButton).toBeDisabled()

  await dialog.getByRole('radio', { name: 'Banana' }).click()
  await dialog.getByRole('radio', { name: 'Chocolate preto' }).click()
  await expect(addButton).toBeEnabled()
  await addButton.click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /Ver carrinho/ }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/carrinho`)
  await expect(page.getByText('Combo', { exact: true })).toBeVisible()
  await expect(page.getByText(/Fondue/)).toBeVisible()
  await expect(page.getByText(/Água/)).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/identificacao`)

  await page.getByLabel('Nome completo').fill('Teste Playwright Combo')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await page.getByLabel('Telefone').fill('51991726861')
  await expect(page.getByLabel('Número da mesa')).toHaveValue(TABLE_NUMBER)
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByText('Combo', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
})
