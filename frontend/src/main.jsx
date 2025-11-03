import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Importe TODAS as páginas
import App from './App.jsx'
import Produtos from './pages/Produtos.jsx'
import Clientes from './pages/Clientes.jsx'
import NovaVenda from './pages/NovaVenda.jsx'
import Login from './pages/Login.jsx' // <-- Página de Login

import './index.css'

const router = createBrowserRouter([
  // Rota de Login (página pública)
  {
    path: '/login',
    element: <Login />, // <-- A página de login é separada
  },
  // Rotas Protegidas (só para quem logou)
  {
    path: '/',
    element: <App />, // O App.jsx (menu) será nossa "parede" de proteção
    children: [
      // A rota '/' agora vai mostrar a página de Produtos
      { path: '/', element: <Produtos /> }, 
      { path: '/produtos', element: <Produtos /> },
      { path: '/clientes', element: <Clientes /> },
      { path: '/vendas/nova', element: <NovaVenda /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

