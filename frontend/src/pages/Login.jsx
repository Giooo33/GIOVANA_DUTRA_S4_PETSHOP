import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Nosso 'axios'
// O CSS do login será colocado no index.css

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroLogin('');

    try {
      // 1. Tenta bater no endpoint de token do Django
      // Lembre-se que já criamos este endpoint no backend ('api-token-auth/')
      const response = await api.post('api-token-auth/', {
        username: username,
        password: password
      });

      // 2. Se o Django retornar um token, a senha está correta!
      if (response.data.token) {
        const token = response.data.token;
        
        // 3. Salva o token no localStorage (o "crachá" do navegador)
        localStorage.setItem('authToken', token);
        
        // 4. Diz ao axios para USAR esse token em TODAS as requisições futuras
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // 5. Redireciona o usuário para a página principal
        navigate('/'); // Redireciona para a home (que mostrará o menu)

      }
    } catch (error) {
      // Requisito 1: Mensagem de erro clara
      if (error.response && error.response.status === 400) {
        setErroLogin('Usuário ou senha inválidos. Tente novamente.');
      } else {
        setErroLogin('Erro ao conectar ao servidor. Tente mais tarde.');
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login - Amigo Fiel</h2>
        <p>Acesse o sistema com seu usuário e senha.</p>
        
        <input 
          type="text" 
          placeholder="Usuário (use seu superuser)" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        {erroLogin && <div className="erro-api">{erroLogin}</div>}
        
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}


