import { expect, test, type Page } from '@playwright/test'

// Branch de erro do ReviewPage (status === 'error') nunca tinha sido
// exercitado. Simula a RPC confirm_order recusando o pedido (via
// page.route, sem gerar pedido real em produção) pra ver exatamente o que
// o cliente enxerga quando a confirmação falha.
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

test('confirm_order recusa o pedido → cliente vê mensagem de erro clara, sem travar a tela', async ({ page }) => {
  // Formato real de erro do Postgres levantado dentro da RPC (RAISE EXCEPTION),
  // como o PostgREST devolve pra chamada de rpc.
  await page.route('**/rest/v1/rpc/confirm_order', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'P0001',
        details: null,
        hint: null,
        message: 'Produto não pertence a essa loja',
      }),
    }),
  )

  await page.goto(`/${STORE_SLUG}/mesa/${TABLE_NUMBER}`)
  await expect(page).toHaveURL(`/${STORE_SLUG}/cardapio`)

  const addAguaButton = page.getByRole('button', { name: 'Ver detalhes de Água', exact: true })
  await scrollUntilVisible(page, addAguaButton)
  await addAguaButton.click()
  const dialog = page.getByRole('dialog', { name: 'Água' })
  await dialog.getByRole('button', { name: 'Adicionar ao pedido' }).click()

  await page.getByRole('button', { name: /Ver carrinho/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByLabel('Nome completo').fill('Teste Playwright Erro')
  await page.getByLabel('CPF').fill(VALID_TEST_CPF)
  await expect(page.getByLabel('Telefone')).not.toBeVisible()
  await page.getByRole('button', { name: 'Confirmar' }).click()
  await expect(page).toHaveURL(`/${STORE_SLUG}/revisao`)

  const confirmButton = page.getByRole('button', { name: 'Confirmar pedido' })
  await confirmButton.click()

  // Mensagem tem que citar o erro real da RPC (não um JSON cru tipo
  // {"code":"P0001",...}), e o botão tem que voltar a ficar clicável — cliente
  // não pode ficar preso numa tela que não deixa tentar de novo.
  await expect(page.getByText('Não foi possível confirmar seu pedido.')).toBeVisible()
  await expect(page.getByText('Produto não pertence a essa loja')).toBeVisible()
  await expect(page.getByText('"code":"P0001"')).not.toBeVisible()
  await expect(confirmButton).toBeEnabled()

  // Carrinho não pode ter sido limpo numa confirmação que falhou — cliente
  // tenta de novo sem montar o pedido do zero.
  await expect(page.getByRole('heading', { name: 'Revisar pedido' })).toBeVisible()
})
