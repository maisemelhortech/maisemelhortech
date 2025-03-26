import React, { useState, useEffect } from "react";
import { Search, FileText, X } from "lucide-react";
import { Produto } from '../../Entities/Produto';
import { Venda } from '../../Entities/Venda';
import { Cliente } from '../../Entities/Cliente';
import '../../Styles/VendasTab.css';

export default function VendasTab() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [clientes, setClientes] = useState({});
  const [produtos, setProdutos] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Carregar vendas do localStorage
      const vendasLocalStorage = localStorage.getItem('vendas');
      let vendasData = [];
      
      if (vendasLocalStorage) {
        vendasData = JSON.parse(vendasLocalStorage);
      } else {
        // Tenta carregar da API apenas se não tiver no localStorage
        try {
          vendasData = await Venda.list() || [];
          // Salva no localStorage para futuras referências
          localStorage.setItem('vendas', JSON.stringify(vendasData));
        } catch (apiError) {
          console.error("Erro ao carregar vendas da API:", apiError);
          vendasData = []; // Se falhar, inicializa como array vazio
        }
      }
      
      setVendas(vendasData);
      
      // Carregar clientes
      const clientesLocalStorage = localStorage.getItem('clientes');
      if (clientesLocalStorage) {
        const todosClientes = JSON.parse(clientesLocalStorage);
        const clientesMap = {};
        todosClientes.forEach(cliente => {
          clientesMap[cliente.id] = cliente;
        });
        setClientes(clientesMap);
      } else {
        try {
          const todosClientes = await Cliente.list() || [];
          const clientesMap = {};
          todosClientes.forEach(cliente => {
            clientesMap[cliente.id] = cliente;
          });
          setClientes(clientesMap);
          // Salvar no localStorage para persistência
          localStorage.setItem('clientes', JSON.stringify(todosClientes));
        } catch (error) {
          console.error("Erro ao carregar clientes:", error);
          setClientes({});
        }
      }
      
      // Carregar produtos
      const produtosLocalStorage = localStorage.getItem('produtos');
      if (produtosLocalStorage) {
        const todosProdutos = JSON.parse(produtosLocalStorage);
        const produtosMap = {};
        todosProdutos.forEach(produto => {
          produtosMap[produto.id] = produto;
        });
        setProdutos(produtosMap);
      } else {
        try {
          const todosProdutos = await Produto.list() || [];
          const produtosMap = {};
          todosProdutos.forEach(produto => {
            produtosMap[produto.id] = produto;
          });
          setProdutos(produtosMap);
          // Salvar no localStorage para persistência
          localStorage.setItem('produtos', JSON.stringify(todosProdutos));
        } catch (error) {
          console.error("Erro ao carregar produtos:", error);
          setProdutos({});
        }
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Função para persistir vendas no localStorage
  const salvarVendasNoLocalStorage = (novasVendas) => {
    localStorage.setItem('vendas', JSON.stringify(novasVendas));
    setVendas(novasVendas);
  };

  const abrirDetalhes = (venda) => {
    setVendaSelecionada(venda);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setVendaSelecionada(null);
  };

  // Adicionar nova venda com persistência
  const adicionarVenda = async (novaVenda) => {
    try {
      // Adicionar id se não existir
      if (!novaVenda.id) {
        novaVenda.id = Date.now().toString();
      }
      
      // Verificar se a venda já existe para evitar duplicação
      const vendaExistente = vendas.find(v => v.id === novaVenda.id);
      if (vendaExistente) {
        return true; // Venda já existe, não adiciona novamente
      }
      
      // Adicionar venda via API se disponível
      let vendaSalva = novaVenda;
      try {
        vendaSalva = await Venda.create(novaVenda) || novaVenda;
      } catch (apiError) {
        console.error("Erro ao adicionar venda na API:", apiError);
        // Continue com a versão local se a API falhar
      }
      
      // Atualizar estado e persistir no localStorage
      const novasVendas = [...vendas, vendaSalva];
      salvarVendasNoLocalStorage(novasVendas);
      
      // Atualizar estoque dos produtos
      atualizarEstoqueProdutos(novaVenda.items);
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar venda:", error);
      return false;
    }
  };

  // Atualizar estoque de produtos após uma venda
  const atualizarEstoqueProdutos = (itensVenda) => {
    try {
      // Obter produtos atuais do localStorage
      const produtosLocalStorage = localStorage.getItem('produtos');
      if (!produtosLocalStorage) return;
      
      const todosProdutos = JSON.parse(produtosLocalStorage);
      let atualizacaoNecessaria = false;
      
      // Atualizar quantidades de produtos
      itensVenda.forEach(item => {
        const index = todosProdutos.findIndex(p => p.id === item.produto_id);
        if (index !== -1) {
          todosProdutos[index].quantidade -= item.quantidade;
          if (todosProdutos[index].quantidade < 0) {
            todosProdutos[index].quantidade = 0;
          }
          atualizacaoNecessaria = true;
        }
      });
      
      // Persistir as alterações no localStorage
      if (atualizacaoNecessaria) {
        localStorage.setItem('produtos', JSON.stringify(todosProdutos));
        
        // Atualizar o estado de produtos
        const produtosMap = {};
        todosProdutos.forEach(produto => {
          produtosMap[produto.id] = produto;
        });
        setProdutos(produtosMap);
      }
    } catch (error) {
      console.error("Erro ao atualizar estoque de produtos:", error);
    }
  };

  // Filtrar vendas
  const vendasFiltradas = vendas.filter(venda => {
    const cliente = clientes[venda.cliente_id];
    const termoBusca = filtro.toLowerCase();
    
    return (
      cliente?.nome?.toLowerCase().includes(termoBusca) ||
      cliente?.cpf?.includes(termoBusca) ||
      venda.metodo_pagamento?.toLowerCase().includes(termoBusca) ||
      venda.hash_compra?.toLowerCase().includes(termoBusca)
    );
  });

  return (
    <div className="vendas-container">
   
      <div className="search-container">
        <Search className="search-icon" size={18}  style={{marginLeft: '5px'}}/>
        <input
          type="text"
          placeholder="Buscar vendas..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="search-input"
        />
      </div>

      {carregando ? (
        <div className="loading-container">
          <div className="loading-title skeleton"></div>
          <div className="loading-content">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-row">
                <div className="loading-cell-large skeleton"></div>
                <div className="loading-cell-small skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <table className="vendas-table">
          <thead className="vendas-table-header">
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Método de Pagamento</th>
              <th>Status</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.length > 0 ? (
              vendasFiltradas.map((venda) => (
                <tr key={venda.id} onClick={() => abrirDetalhes(venda)} className="vendas-table-row">
                  <td className="vendas-data">
                    {new Date(venda.data).toLocaleString()}
                  </td>
                  <td>
                    <div className="cliente-info">
                      <span className="cliente-nome">
                        {venda.cliente_id ? (clientes[venda.cliente_id]?.nome || "Cliente não encontrado") : "Cliente não registrado"}
                      </span>
                      <span className="cliente-cpf">
                        {clientes[venda.cliente_id]?.cpf || venda.cliente_id || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="vendas-total">
                    R$ {venda.total ? venda.total.toFixed(2) : "0.00"}
                  </td>
                  <td className="metodo-pagamento">
                    {venda.metodo_pagamento || "Dinheiro"}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      venda.status === "Concluída"
                        ? "status-concluida"
                        : "status-pendente"
                    }`}>
                      {venda.status || "Concluída"}
                    </span>
                  </td>
                  <td>
                    <FileText size={18} className="detalhes-icon" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-message">
                  Nenhuma venda encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal de Detalhes da Venda */}
      {modalAberto && vendaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                Detalhes da Venda #{vendaSelecionada.id}
              </h3>
              <button onClick={fecharModal} className="close-button">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="venda-info-grid">
                <div className="info-group">
                  <h4>Data da Venda</h4>
                  <p>{new Date(vendaSelecionada.data).toLocaleString()}</p>
                </div>
                <div className="info-group">
                  <h4>Status</h4>
                  <p>
                    <span className={`status-badge ${
                      vendaSelecionada.status === "Concluída"
                        ? "status-concluida"
                        : "status-pendente"
                    }`}>
                      {vendaSelecionada.status || "Concluída"}
                    </span>
                  </p>
                </div>
                <div className="info-group">
                  <h4>Cliente</h4>
                  <p>{vendaSelecionada.cliente_id ? (clientes[vendaSelecionada.cliente_id]?.nome || "Cliente não encontrado") : "Cliente não registrado"}</p>
                  {vendaSelecionada.cliente_id && !clientes[vendaSelecionada.cliente_id]?.nome && (
                    <p>CPF/ID: {vendaSelecionada.cliente_id}</p>
                  )}
                </div>
                <div className="info-group">
                  <h4>Método de Pagamento</h4>
                  <p>{vendaSelecionada.metodo_pagamento || "Dinheiro"}</p>
                </div>
                {vendaSelecionada.hash_compra && (
                  <div className="info-group">
                    <h4>Hash da Compra</h4>
                    <p>{vendaSelecionada.hash_compra}</p>
                  </div>
                )}
              </div>
              
              <div className="items-section">
                <h4>Itens da Venda</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço Unit.</th>
                      <th>Quant.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendaSelecionada.items && vendaSelecionada.items.length > 0 ? (
                      vendaSelecionada.items.map((item, index) => (
                        <tr key={index}>
                          <td className="items-produto">
                            {produtos[item.produto_id]?.nome || "Produto não encontrado"}
                          </td>
                          <td className="items-preco">
                            R$ {item.preco_unitario ? item.preco_unitario.toFixed(2) : "0.00"}
                          </td>
                          <td className="items-quantidade">
                            {item.quantidade || 0}
                          </td>
                          <td className="items-subtotal">
                            R$ {((item.preco_unitario || 0) * (item.quantidade || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-message">Nenhum item encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="total-section">
                <span className="total-label">Total</span>
                <span className="total-value">
                  R$ {vendaSelecionada.total ? vendaSelecionada.total.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
