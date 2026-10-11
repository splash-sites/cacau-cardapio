import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// E2E confirma pedido de verdade: roda SEMPRE contra o staging. O servidor sobe
// com `--mode staging` (Vite carrega .env.staging.local por cima do .env.local).
// Trava: sem .env.staging.local apontando pra um projeto diferente do de
// producao, nao roda — senao o Vite cairia no .env.local (producao).
function assertStagingEnv() {
  const readUrl = (file: string) =>
    existsSync(file)
      ? readFileSync(file, 'utf8').match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.trim()
      : undefined
  const staging = readUrl('.env.staging.local')
  if (!staging) {
    throw new Error('E2E bloqueado: crie .env.staging.local com o VITE_SUPABASE_URL do staging.')
  }
  if (staging === readUrl('.env.local')) {
    throw new Error('E2E bloqueado: .env.staging.local aponta pro mesmo Supabase do .env.local (producao).')
  }
}
assertStagingEnv()

const PORT = 5177

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm dev --mode staging --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // nunca reaproveitar servidor ja aberto: ele pode estar em modo producao
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
