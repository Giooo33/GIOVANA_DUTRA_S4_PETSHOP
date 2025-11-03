// frontend/src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Nosso conector da API Django
export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  // Estado para o formulário (Inserir/Editar)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentClienteId, setCurrentClienteId] = useState(null);
  
  // Estado para feedback
  const [erroEmail, setErroEmail] = useState('');
  const [erroApi, setErroApi] = useState('');

  // 1. FUNÇÃO PARA BUSCAR CLIENTES
  const fetchClientes = () => {
    let url = 'clientes/';
    if (termoBusca) {
      url += `?search=${termoBusca}`; // Adiciona filtro de busca
    }
    api.get(url)
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => console.error("Erro ao buscar clientes:", error));
  };

  // 2. BUSCA INICIAL (AO CARREGAR A TELA)
  useEffect(() => {
    fetchClientes();
  }, []); // O [] faz rodar só uma vez

  // 3. FUNÇÃO DE BUSCA (AO CLICAR NO BOTÃO)
  const handleBusca = (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    fetchClientes();
  };

  // 4. FUNÇÃO PARA LIDAR COM MUDANÇAS NO FORMULÁRIO
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Resposta da Pergunta 4 (Validação no Frontend)
    if (name === 'email') {
      if (!value.includes('@') || !value.includes('.')) {
        setErroEmail('E-mail inválido. Deve conter "@" e "."');
      } else {
        setErroEmail(''); // Limpa o erro se for válido
      }
    }
  };

  // 5. FUNÇÃO DE SUBMISSÃO (CRIAR OU EDITAR)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (erroEmail) return; // Bloqueia envio se o email for inválido

  const metodo = isEditing ? 'put' : 'post';
  const url = isEditing ? `clientes/${currentClienteId}/` : 'clientes/';

    api[metodo](url, formData)
      .then(response => {
        alert(`Cliente ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
        resetForm();
        fetchClientes(); // Atualiza a tabela
      })
      .catch(error => {
        // Captura erros de validação do backend (ex: email duplicado)
        if (error.response && error.response.data) {
          setErroApi(JSON.stringify(error.response.data));
        } else {
          setErroApi('Erro ao salvar cliente.');
        }
      });
  };

  // 6. FUNÇÃO PARA DELETAR
  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
  api.delete(`clientes/${id}/`)
        .then(() => {
          alert('Cliente excluído com sucesso!');
          fetchClientes(); // Atualiza a tabela
        })
        .catch(error => setErroApi('Erro ao excluir cliente.'));
    }
  };

  // 7. FUNÇÃO PARA PREPARAR EDIÇÃO
  const handleEdit = (cliente) => {
    setIsEditing(true);
    setCurrentClienteId(cliente.id);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone
    });
    setErroApi('');
    setErroEmail('');
  };

  // 8. FUNÇÃO PARA LIMPAR O FORMULÁRIO
  const resetForm = () => {
    setIsEditing(false);
    setCurrentClienteId(null);
    setFormData({ nome: '', email: '', telefone: '' });
    setErroApi('');
    setErroEmail('');
  };


  return (
    <div className="container">
      <h2>Cadastro de Clientes</h2>
      
      {/* --- Formulário de Cadastro/Edição --- */}
      <div className="form-container">
        <h3>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="nome" 
            placeholder="Nome completo" 
            value={formData.nome}
            onChange={handleFormChange}
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="E-mail" 
            value={formData.email}
            onChange={handleFormChange}
            required
          />
          {erroEmail && <small className="erro-validacao">{erroEmail}</small>}
          <input 
            type="text" 
            name="telefone" 
            placeholder="Telefone (Opcional)"
            value={formData.telefone}
            onChange={handleFormChange}
          />
          
          {erroApi && <div className="erro-api">{erroApi}</div>}

          <div className="form-botoes">
            <button type="submit" disabled={!!erroEmail}>
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancelar" onClick={resetForm}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- Barra de Busca --- */}
      <div className="busca-container">
        <h3>Buscar Clientes</h3>
        <form onSubmit={handleBusca}>
          <input 
            type="text" 
            placeholder="Buscar por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
      </div>

      {/* --- Tabela de Clientes --- */}
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefone}</td>
                  <td className="acoes">
                    <button className="btn-editar" onClick={() => handleEdit(cliente)}>Editar</button>
                    <button className="btn-excluir" onClick={() => handleDelete(cliente.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}