import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// staleTime evita refetch redundante quando o cliente navega cardápio ↔
// carrinho ↔ cardápio (dado de catálogo/loja não muda a cada segundo).
// Queries com refetchInterval próprio (status/histórico de pedido) ignoram
// staleTime pro polling — não afeta o tempo real delas.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
