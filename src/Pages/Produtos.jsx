import React, { useState, useEffect } from "react";
import { Produto } from "../Entities/Produto";
import { ShoppingCart, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Notification } from '../Components/NotificacaoAddCarrinho';
import '../Styles/Produtos.css';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  const [filtroPrecoPor, setFiltroPrecoPor] = useState(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // Modificação para permitir múltiplas notificações
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  document.title = "Mais & Melhor - Produtos";
  
  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        const urlParams = new URLSearchParams(window.location.search);
        const categoria = urlParams.get("categoria");
        setCategoriaAtual(categoria);
        
        const todosProdutos = await Produto.list();
        if (categoria) {
          setProdutos(todosProdutos.filter(p => p.categoria === categoria));
        } else {
          setProdutos(todosProdutos);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        addNotification("Erro ao carregar produtos", "error");
      } finally {
        setCarregando(false);
      }
    }
    
    carregarProdutos();
  }, [window.location.search]);

  const adicionarAoCarrinho = async (produto) => {
    try {
      const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho') || '[]');
      const produtoExistente = carrinhoAtual.find(item => item.id === produto.id);
      
      if (produtoExistente) {
        produtoExistente.quantidade += 1;
        produtoExistente.subtotal = produtoExistente.quantidade * produtoExistente.preco;
        addNotification(`${produto.nome} - quantidade atualizada no carrinho`);
      } else {
        carrinhoAtual.push({
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
          subtotal: produto.preco,
          imagem_url: produto.imagem_url,
          produto_id: produto.id
        });
        addNotification(`${produto.nome} adicionado ao carrinho!`);
      }
      
      localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      addNotification("Erro ao adicionar produto ao carrinho", "error");
    }
  };

  const filtrarPorPreco = (ordem) => {
    setFiltroPrecoPor(ordem);
    let produtosFiltrados = [...produtos];
    
    if (ordem === "menor") {
      produtosFiltrados.sort((a, b) => a.preco - b.preco);
    } else if (ordem === "maior") {
      produtosFiltrados.sort((a, b) => b.preco - a.preco);
    }
    
    setProdutos(produtosFiltrados);
  };

  return (
    <div className="produtos-container">
      {/* Notifications */}
      {notifications.map((notification) => (
        <Notification 
          key={notification.id}
          message={notification.message} 
          type={notification.type}
          duration={1500}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <div className="produtos-cabecalho">
        <h1 className="produtos-titulo">
          {categoriaAtual ? `Produtos: ${categoriaAtual}` : "Todos os Produtos"}
        </h1>
        <p className="produtos-subtitulo">
          {categoriaAtual 
            ? `Explore nossa seleção de produtos da categoria ${categoriaAtual}` 
            : "Explore nossa seleção completa de produtos"
          }
        </p>
      </div>
      
      <div className="filtros-container">
        <div className="filtros-cabecalho">
          <h2 className="filtros-titulo">
            <Filter size={20} className="filtros-icone" /> Filtros
          </h2>
          <button 
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="filtros-toggle"
          >
            {filtrosAbertos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {filtrosAbertos && (
          <div className="filtros-conteudo">
            <div className="filtro-item">
              <label className="filtro-label">Ordenar por preço</label>
              <select 
                className="filtro-select"
                value={filtroPrecoPor || ""}
                onChange={(e) => filtrarPorPreco(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {carregando ? (
        <div className="produtos-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="produto-skeleton">
              <div className="produto-imagem-skeleton"></div>
              <div className="produto-titulo-skeleton"></div>
              <div className="produto-descricao-skeleton"></div>
              <div className="produto-preco-skeleton"></div>
            </div>
          ))}
        </div>
      ) : produtos.length > 0 ? (
        <div className="produtos-grid">
          {produtos.map((produto) => (
            <div key={produto.id} className="produto-card">
              <div className="produto-imagem-container">
                <img 
                  src={produto.imagem_url || "https://images.unsplash.com/photo-1607349913232-6cf2734b6fe3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1cGVybWFya2V0JTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"} 
                  alt={produto.nome} 
                  className="produto-imagem"
                />
              </div>
              <div className="produto-categoria-container">
                <span className="produto-categoria">{produto.categoria}</span>
              </div>
              <h3 className="produto-nome">{produto.nome}</h3>
              <p className="produto-codigo">Código: {produto.codigo}</p>
              <p className="produto-descricao">
                {produto.descricao?.substring(0, 60) || "Produto de alta qualidade"}
                {produto.descricao?.length > 60 ? "..." : ""}
              </p>
              <div className="produto-compra">
                <span className="produto-preco">
                  R$ {produto.preco?.toFixed(2)}
                </span>
                <button
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="produto-botao"
                  disabled={produto.quantidade <= 0}
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
              {produto.quantidade <= 0 && (
                <p className="produto-indisponivel">Produto indisponível</p>
              )}
              {produto.quantidade > 0 && produto.quantidade < 5 && (
                <p className="produto-estoque-baixo">Apenas {produto.quantidade} em estoque</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="produtos-vazio">
          <h3 className="produtos-vazio-titulo">Nenhum produto encontrado</h3>
          <p className="produtos-vazio-mensagem">
            {categoriaAtual 
              ? `Não há produtos disponíveis na categoria ${categoriaAtual} no momento.` 
              : "Não há produtos disponíveis no momento."
            }
          </p>
        </div>
      )}
    </div>
  );
}