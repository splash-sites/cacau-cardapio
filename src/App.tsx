import { Route, Routes } from 'react-router-dom'
import { CartPage } from './presentation/cart/CartPage'
import { IdentificationPage } from './presentation/customer/IdentificationPage'
import { MenuPage } from './presentation/menu/MenuPage'
import { OrdersPage } from './presentation/order/OrdersPage'
import { OrderTypeSelectionPage } from './presentation/order/OrderTypeSelectionPage'
import { ReviewPage } from './presentation/order/ReviewPage'
import { StoreLayout } from './presentation/store/StoreLayout'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
            <p className="font-body text-foreground/70">Acesse pelo link da sua loja.</p>
          </div>
        }
      />
      <Route path="/:storeSlug" element={<StoreLayout />}>
        <Route index element={<OrderTypeSelectionPage />} />
        <Route path="cardapio" element={<MenuPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route path="identificacao" element={<IdentificationPage />} />
        <Route path="revisao" element={<ReviewPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
      </Route>
    </Routes>
  )
}

export default App
