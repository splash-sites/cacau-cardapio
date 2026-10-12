import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { StoreLayout } from './presentation/store/StoreLayout'

const OrderTypeSelectionPage = lazy(() =>
  import('./presentation/order/OrderTypeSelectionPage').then((m) => ({ default: m.OrderTypeSelectionPage })),
)
const TableEntryPage = lazy(() =>
  import('./presentation/order/TableEntryPage').then((m) => ({ default: m.TableEntryPage })),
)
const ResellerEntryPage = lazy(() =>
  import('./presentation/order/ResellerEntryPage').then((m) => ({ default: m.ResellerEntryPage })),
)
const MenuPage = lazy(() => import('./presentation/menu/MenuPage').then((m) => ({ default: m.MenuPage })))
const CartPage = lazy(() => import('./presentation/cart/CartPage').then((m) => ({ default: m.CartPage })))
const IdentificationPage = lazy(() =>
  import('./presentation/customer/IdentificationPage').then((m) => ({ default: m.IdentificationPage })),
)
const ReviewPage = lazy(() => import('./presentation/order/ReviewPage').then((m) => ({ default: m.ReviewPage })))
const OrdersPage = lazy(() => import('./presentation/order/OrdersPage').then((m) => ({ default: m.OrdersPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <p className="text-muted">Carregando…</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex min-h-dvh items-center justify-center bg-bg px-4 text-center">
              <p className="text-muted">Acesse pelo link da sua loja.</p>
            </div>
          }
        />
        <Route path="/:storeSlug" element={<StoreLayout />}>
          <Route index element={<OrderTypeSelectionPage />} />
          <Route path="mesa/:numeroMesa" element={<TableEntryPage />} />
          <Route path="atacado" element={<ResellerEntryPage />} />
          <Route path="cardapio" element={<MenuPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="identificacao" element={<IdentificationPage />} />
          <Route path="revisao" element={<ReviewPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
