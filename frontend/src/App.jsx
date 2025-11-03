import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import api from './services/api'; // Importe o api

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState('');
  const navigate = useNavigate();

  // 1. CHECA O LOGIN QUANDO A PÁGINA CARREGA
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // Se NÃO tem token, chuta o usuário para a tela de login
      navigate('/login');
    } else {
      // Se TEM token, avisa o axios para usá-lo
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // (Bônus: poderíamos buscar o nome do usuário aqui)
      // Por enquanto, vamos simular o nome
      setUsuarioLogado('Admin Logado'); 
    }
  }, [navigate]); // O `Maps` aqui é uma dependência

  // 2. FUNÇÃO DE LOGOUT (Requisito 2)
  const handleLogout = () => {
    // Limpa o token do "crachá"
    localStorage.removeItem('authToken');
    
    // Avisa o axios para parar de usar o token
    delete api.defaults.headers.common['Authorization'];
    
    // Manda o usuário de volta para o login
    navigate('/login');
  };
  
  // Se o usuário ainda não foi verificado, não mostra nada
  if (!usuarioLogado) {
    return <div>Verificando autenticação...</div>;
  }

  // 3. SE ESTÁ LOGADO, MOSTRA O MENU
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          Pet Shop "Amigo Fiel"
        </div>
        <div className="nav-links">
          <Link to="/produtos">Produtos</Link>
          <Link to="/clientes">Clientes</Link>
          <Link to="/vendas/nova">Nova Venda</Link>
        </div>
        <div className="navbar-user">
          {/* Requisito 2: Nome do usuário logado */}
          <span>Olá, {usuarioLogado}</span> 
          
          {/* Requisito 2: Logout funcional */}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;

