import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/createPageUrl";
import { Produto } from "../Entities/Produto";
import { ShoppingCart, Search } from "lucide-react";
import { Notification, useNotification } from '../Components/NotificacaoAddCarrinho';
import '../Styles/App.css';

export default function Inicio() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa, setPesquisa] = useState("");
  const [destaques, setDestaques] = useState([]);

  // Modificação para permitir múltiplas notificações
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now(); // Unique identifier
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  document.title = "Mais & Melhor - Inicio";

  const categorias = [
    "Bebidas", 
    "Hortifruti", 
    "Peixaria", 
    "Churrasco", 
    "Doces", 
    "Beleza", 
    "Pet Shop", 
    "Produtos de Limpeza", 
    "Higiene", 
    "Todos"
  ]

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        const todosProdutos = await Produto.list();
        setProdutos(todosProdutos);
        
        if (todosProdutos.length > 0) {
          const produtosAleatorios = [...todosProdutos].sort(() => 0.5 - Math.random()).slice(0, 6);
          setDestaques(produtosAleatorios);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        addNotification("Erro ao carregar produtos", "error");
      } finally {
        setCarregando(false);
      }
    }
    
    carregarProdutos();
  }, []);

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

  return (
    <div className="tudo">
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

      <div className="container1">
        <h1>Mais &<br />Melhor</h1>
        <p>Mais variedade,<br />melhor qualidade!</p>
        <div id="circle">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      <div className="container2" id="menu-categorias">
        <div className="texto">
          <h1>Categorias</h1>
          <p>Explore nossas categorias para encontrar exatamente o que você precisa</p>
          <div id="circle">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      {/* Menu Categorias */}
      <div className="footer-categories">
        <div className="footer-categories-container">
          <div className="footer-categories-links">
            {categorias.map((categoria) => (
              <Link 
                key={categoria}
                to={
                  categoria === "Todos" 
                    ? createPageUrl("Inicio") 
                    : `${createPageUrl("Produtos")}?categoria=${encodeURIComponent(categoria)}`
                }
                className="footer-category-link"
              >
                {categoria}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container2">
        <div className="texto">
          <h1>Produtos em Destaque</h1>
          <p>Confira nossa seleção de produtos em destaque com a melhor qualidade e preço!</p>
          <div id="circle" style={{paddingLeft: '100px'}}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        
        {carregando ? (
          <div className="produtos">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card loading">
                <div className="img-placeholder"></div>
                <div className="title-placeholder"></div>
                <div className="desc-placeholder"></div>
                <div className="btn-placeholder"></div>
              </div>
            ))}
          </div>
        ) : destaques.length > 0 ? (
          <div className="produtos">
            {destaques.map((produto) => (
              <div key={produto.id} className="card">
                <div className="img-container">
                  <img 
                    src={produto.imagem_url || "https://images.unsplash.com/photo-1607349913232-6cf2734b6fe3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1cGVybWFya2V0JTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"} 
                    alt={produto.nome} 
                  />
                  <span className="destaque">Em destaque</span>
                </div>
                <h2>{produto.nome}</h2>
                <p>{produto.descricao?.substring(0, 60) || produto.categoria}</p>
                <div className="price-cart">
                  <span className="price">R$ {produto.preco?.toFixed(2)}</span>
                  <button
                    onClick={() => adicionarAoCarrinho(produto)}
                    className="cart-btn"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-products">Nenhum produto em destaque disponível no momento.</p>
        )}
        
        <Link to={createPageUrl("Produtos")}>
          <button className="view-all">
              Ver todos os produtos
          </button>
        </Link>
      </div>

      <div className="container3">
        <h1 id="promo">OFERTA</h1>
        <div className="promo">
          <div className="promo-content">
            <h2>Ofertas Especiais</h2>
            <p>Aproveite nossas promoções incríveis! Produtos selecionados com até 50% de desconto.</p>
            <Link
              to={createPageUrl("Produtos") + "?promocao=true"}
              className="promo-btn"
            >
              Ver Ofertas
            </Link>
          </div>
        </div>
        <h1 id="promo2">ESPECIAL</h1>
      </div>
    </div>
  );
}