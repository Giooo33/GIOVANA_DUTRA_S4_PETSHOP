import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Usaremos o CSS que já está no index.css

export default function NovaVenda() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  // Estado para o formulário
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split('T')[0]); // Pega a data de hoje
  
  // Estado para Feedback (Respostas da Pergunta 1)
  const [erro, setErro] = useState(''); // Mensagem de erro (ex: estoque)
  const [sucesso, setSucesso] = useState(null); // Resumo da venda

  // Carrega clientes e produtos nos dropdowns
  useEffect(() => {
    // Busca clientes
    api.get('clientes/?ordering=nome')
      .then(res => setClientes(res.data))
      .catch(err => console.error("Erro ao buscar clientes", err));
      
    // Busca produtos
    // Resposta Pergunta 2: Ordenado pelo backend
    api.get('produtos/?ordering=nome')
      .then(res => setProdutos(res.data))
      .catch(err => console.error("Erro ao buscar produtos", err));
  }, []);

  // Resposta Pergunta 1a: A função que processa a venda no frontend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); // Limpa erros antigos
    setSucesso(null);

    if (!clienteId || !produtoId || quantidade <= 0) {
      setErro("Por favor, preencha todos os campos corretamente.");
      return;
    }

    const dadosVenda = {
      cliente_id: clienteId,
      produto_id: produtoId,
      quantidade: quantidade,
      data_venda: dataVenda 
      // O backend vai pegar o usuário logado automaticamente (se configurado)
    };

    try {
      // Tenta enviar para o endpoint /api/vendas/
      // A lógica de transação e estoque está no backend (VendaViewSet)
  const response = await api.post('vendas/', dadosVenda);
      
      // Se deu certo (HTTP 201)
      setSucesso(response.data); // Mostra o resumo da venda
      
      // Limpa o formulário, exceto cliente e data
      setProdutoId('');
      setQuantidade(1);
      
      // Opcional: Atualizar a lista de produtos para refletir o novo estoque
      // (Isso exigiria um 'fetchProdutos' e passar para um estado global)

    } catch (error) {
      // Se deu errado (ex: HTTP 400 de estoque)
      if (error.response && error.response.data && error.response.data.detalhe) {
        
        // Resposta Pergunta 1b: Captura a mensagem de erro exata do backend
        setErro(error.response.data.detalhe); 
        
      } else {
        setErro("Ocorreu um erro desconhecido ao processar a venda.");
        console.error(error);
      }
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Registrar Nova Venda</h2>
        
        {/* Mostra o erro de estoque aqui */}
        {erro && (
          <div className="erro-api">
            <strong>Falha na Venda:</strong> {erro}
          </div>
        )}
        
        {/* Mostra o resumo da venda aqui */}
        {sucesso && (
          <div className="sucesso-api"> {/* Você pode criar um estilo .sucesso-api */ }
            <h4>Venda Realizada com Sucesso!</h4>
            <p><strong>Cliente:</strong> {sucesso.cliente}</p>
            <p><strong>Produto:</strong> {sucesso.produto}</p>
            <p><strong>Valor Total:</strong> R$ {sucesso.valor_total}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <label>Cliente:</label>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
            <option value="">Selecione um Cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          
          <label>Produto:</label>
          <select value={produtoId} onChange={e => setProdutoId(e.target.value)} required>
            <option value="">Selecione um Produto</option>
            {produtos.map(p => (
              <option 
                key={p.id} 
                value={p.id} 
                disabled={p.quantidade_estoque === 0} // Desativa se estoque for 0
                className={p.quantidade_estoque < 5 ? 'estoque-baixo' : ''} // Alerta no dropdown
              >
                {p.nome} (Estoque: {p.quantidade_estoque})
              </option>
            ))}
          </select>
          
          <label>Quantidade Desejada:</label>
          <input 
            type="number" 
            value={quantidade} 
            onChange={e => setQuantidade(parseInt(e.target.value, 10))}
            min="1"
            required 
          />
          
          <label>Data da Venda:</label>
          <input 
            type="date" 
            value={dataVenda}
            onChange={e => setDataVenda(e.target.value)}
            required
          />
          
          <button type="submit" disabled={!clienteId || !produtoId || quantidade <= 0}>
            Confirmar Venda
          </button>
        </form>
      </div>
    </div>
  );
}

// Opcional: Adicione um estilo para .sucesso-api no seu index.css
/*
.sucesso-api {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}
*/
