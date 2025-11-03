import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Não precisamos importar CSS, pois já está no index.css

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  // Estado para o formulário (Inserir/Editar)
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco: '',
    quantidade_estoque: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProdutoId, setCurrentProdutoId] = useState(null);
  
  // Estado para feedback e validações
  const [erroForm, setErroForm] = useState('');
  const [erroApi, setErroApi] = useState('');

  // 1. FUNÇÃO PARA BUSCAR PRODUTOS (COM ORDENAÇÃO)
  const fetchProdutos = () => {
    let url = 'produtos/?ordering=nome'; // Sempre ordena por nome
    if (termoBusca) {
      url += `&search=${termoBusca}`; // Adiciona filtro de busca
    }
    api.get(url)
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => console.error("Erro ao buscar produtos:", error));
  };

  // 2. BUSCA INICIAL (AO CARREGAR A TELA)
  useEffect(() => {
    fetchProdutos();
  }, []); // O [] faz rodar só uma vez

  // 3. FUNÇÃO DE BUSCA (AO CLICAR NO BOTÃO)
  const handleBusca = (e) => {
    e.preventDefault();
    fetchProdutos();
  };

  // 4. FUNÇÃO PARA LIDAR COM MUDANÇAS NO FORMULÁRIO
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Resposta da Pergunta 4 (Validação no Frontend)
    validarForm({ ...formData, [name]: value });
  };
  
  // 5. FUNÇÃO DE VALIDAÇÃO (Requisito 3)
  const validarForm = (data) => {
    // Valida Preço
    if (data.preco !== '' && parseFloat(data.preco) <= 0) {
      setErroForm('O preço deve ser maior que zero.');
      return false;
    }
    // Valida Quantidade
    if (data.quantidade_estoque !== '' && parseInt(data.quantidade_estoque, 10) < 0) {
      setErroForm('A quantidade não pode ser negativa.');
      return false;
    }
    
    setErroForm(''); // Limpa erro se for válido
    return true;
  };

  // 6. FUNÇÃO DE SUBMISSÃO (CRIAR OU EDITAR)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarForm(formData)) return; // Bloqueia envio se for inválido

    const metodo = isEditing ? 'put' : 'post';
  const url = isEditing ? `produtos/${currentProdutoId}/` : 'produtos/';

    api[metodo](url, formData)
      .then(response => {
        alert(`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
        resetForm();
        fetchProdutos(); // Atualiza a tabela
      })
      .catch(error => {
        // Captura erros de validação do backend (ex: nome duplicado)
        if (error.response && error.response.data) {
          setErroApi(JSON.stringify(error.response.data));
        } else {
          setErroApi('Erro ao salvar produto.');
        }
      });
  };

  // 7. FUNÇÃO PARA DELETAR
  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
  api.delete(`produtos/${id}/`)
        .then(() => {
          alert('Produto excluído com sucesso!');
          fetchProdutos(); // Atualiza a tabela
        })
        .catch(error => setErroApi('Erro ao excluir produto.'));
    }
  };

  // 8. FUNÇÃO PARA PREPARAR EDIÇÃO
  const handleEdit = (produto) => {
    setIsEditing(true);
    setCurrentProdutoId(produto.id);
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      quantidade_estoque: produto.quantidade_estoque
    });
    setErroApi('');
    setErroForm('');
  };

  // 9. FUNÇÃO PARA LIMPAR O FORMULÁRIO
  const resetForm = () => {
    setIsEditing(false);
    setCurrentProdutoId(null);
    setFormData({ nome: '', categoria: '', preco: '', quantidade_estoque: '' });
    setErroApi('');
    setErroForm('');
  };


  return (
    <div className="container"> {/* CSS vem do index.css */}
      <h2>Cadastro de Produtos</h2>
      
      {/* --- Formulário de Cadastro/Edição --- */}
      <div className="form-container">
        <h3>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="nome" 
            placeholder="Nome do produto" 
            value={formData.nome}
            onChange={handleFormChange}
            required 
          />
          <input 
            type="text" 
            name="categoria" 
            placeholder="Categoria (ex: Ração, Brinquedo)"
            value={formData.categoria}
            onChange={handleFormChange}
          />
          <input 
            type="number" 
            name="preco" 
            placeholder="Preço (ex: 19.99)"
            value={formData.preco}
            onChange={handleFormChange}
            required
            step="0.01"
            min="0.01"
          />
          <input 
            type="number" 
            name="quantidade_estoque" 
            placeholder="Quantidade em Estoque"
            value={formData.quantidade_estoque}
            onChange={handleFormChange}
            required
            step="1"
            min="0"
          />
          
          {erroForm && <small className="erro-validacao">{erroForm}</small>}
          {erroApi && <div className="erro-api">{erroApi}</div>}

          <div className="form-botoes">
            <button type="submit" disabled={!!erroForm}>
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
        <h3>Buscar Produtos</h3>
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

      {/* --- Tabela de Produtos --- */}
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th> {/* Alerta */}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length > 0 ? (
              produtos.map(produto => (
                <tr key={produto.id} className={produto.quantidade_estoque < 5 ? 'estoque-baixo' : ''}>
                  <td>{produto.id}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.categoria}</td>
                  <td>R$ {produto.preco}</td>
                  <td>{produto.quantidade_estoque}</td>
                  <td>
                    {/* Requisito 3: Alerta Visual */}
                    {produto.quantidade_estoque < 5 ? '⚠️ BAIXO' : 'OK'}
                  </td>
                  <td className="acoes">
                    <button className="btn-editar" onClick={() => handleEdit(produto)}>Editar</button>
                    <button className="btn-excluir" onClick={() => handleDelete(produto.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
