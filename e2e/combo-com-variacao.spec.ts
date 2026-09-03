import { expect, test } from '@playwright/test'

// Combo com desconto, cobrindo o caso mais complexo do domínio: um item do
// combo (Fondue) com 2 grupos de variação obrigatórios (sabor de fruta +
// sabor do chocolate) e outro item (Água) sem variação nenhuma, com desconto
// fixed_amount aplicado sobre a soma dos dois. Usa a promoção de teste já
// existente em produção ("TESTE - Fondue com desconto").
const STORE_SLUG = 'cacau-show-capao'
const TABLE_NUMBER = '12'
const VALID_TEST_CPF = '111.444.777-35'

test('promoção de combo → variação obrigatória em 2 grupos → carrinho agrupado → confirmação', async ({ page }) => {
  // Desliga autoplay do carrossel (respeita prefers-reduced-motion) — evita
  // corrida entre o teste e a rotação automática de slide a cada 3.5s.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/${STORE_SLUG}/mesa/${TABLE_NUMBER}`)
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  // Loja pode ter mais de 1 promoção de Fondue em produção (o carrossel roda
  // a promoção que estiver ativa naquele momento) — em vez de assumir posição
  // fixa, navega pelas abas até achar o título certo. Se só existir 1
  // promoção, o carrossel nem mostra aba, e o slide já é o certo direto.
  const dialogTitle = 'TESTE - Fondue com desconto'
  const comboSlide = page.locator('div[role="button"][aria-label="Ver detalhes de Fondue"]')
  await expect(comboSlide).toBeVisible({ timeout: 10_000 })
  for (let attempt = 0; attempt < 5; attempt++) {
    if ((await page.getByText(dialogTitle).count()) > 0) break
    const nextTab = page.getByRole('tab', { name: `Ver promoção ${attempt + 2}` })
    if ((await nextTab.count()) === 0) break
    await nextTab.click()
  }
  await expect(page.getByText(dialogTitle)).toBeVisible({ timeout: 10_000 })
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
  await expect(page.getByLabel('Telefone')).not.toBeVisible()
  await expect(page.getByLabel('Número da mesa')).toHaveValue(TABLE_NUMBER)
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)
  await expect(page.getByText('Combo', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByRole('heading', { name: 'Pedido enviado!' })).toBeVisible({ timeout: 15_000 })
})
