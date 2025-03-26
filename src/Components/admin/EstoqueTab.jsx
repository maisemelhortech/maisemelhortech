import React, { useState, useEffect } from "react";
import { Produto } from "../../Entities/Produto";
import { PlusCircle, Trash2, Edit, Search, Save, X, AlertTriangle } from "lucide-react";
import { Notification } from "../NotificacaoAddCarrinho";
import { ConfirmationModal } from "../NotificacaoRemoveProdutoAdm";
import "../../Styles/EstoqueTab.css";

export default function EstoqueTab() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "Outros",
    preco: "",
    quantidade: "",
    codigo: "",
    codigoNumerico: "",
    descricao: "",
    imagem_url: ""
  });
  const [erroCodigoUnico, setErroCodigoUnico] = useState(false);
  const [erroCodigoTamanho, setErroCodigoTamanho] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  const getPrefixoCategoria = (categoria) => {
    return categoria.substring(0, 3).toUpperCase();
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const produtosLocalStorage = localStorage.getItem('produtos');
      
      if (produtosLocalStorage) {
        setProdutos(JSON.parse(produtosLocalStorage));
      } else {
        const dadosProdutos = await Produto.list();
        setProdutos(dadosProdutos);
        localStorage.setItem('produtos', JSON.stringify(dadosProdutos));
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      addNotification("Erro ao carregar produtos", "error");
    } finally {
      setCarregando(false);
    }
  };

  const salvarNoLocalStorage = (novosProdutos) => {
    localStorage.setItem('produtos', JSON.stringify(novosProdutos));
    setProdutos(novosProdutos);
  };

  const verificarCodigoUnico = (prefixo, codigoNumerico, idAtual = null) => {
    const codigoCompleto = `${prefixo}${codigoNumerico}`;
    
    if (codigoNumerico.length !== 3 || !/^\d{3}$/.test(codigoNumerico)) {
      setErroCodigoTamanho(true);
      return false;
    } else {
      setErroCodigoTamanho(false);
    }
    
    const codigoExistente = produtos.some(
      produto => produto.codigo === codigoCompleto && (!idAtual || produto.id !== idAtual)
    );
    
    setErroCodigoUnico(codigoExistente);
    return !codigoExistente;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "categoria") {
      const prefixo = getPrefixoCategoria(value);
      const codigoNumerico = formData.codigoNumerico;
      
      setFormData(prev => ({
        ...prev,
        categoria: value,
        codigo: `${prefixo}${codigoNumerico}`
      }));
      
      verificarCodigoUnico(prefixo, codigoNumerico, produtoEditando?.id);
    } else if (name === "codigoNumerico") {
      const numerosFiltrados = value.replace(/\D/g, '').substring(0, 3);
      
      const prefixo = getPrefixoCategoria(formData.categoria);
      setFormData(prev => ({
        ...prev,
        codigoNumerico: numerosFiltrados,
        codigo: `${prefixo}${numerosFiltrados}`
      }));
      
      verificarCodigoUnico(prefixo, numerosFiltrados, produtoEditando?.id);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === "preco" || name === "quantidade" 
          ? parseFloat(value) || 0 
          : value
      }));
    }
  };

  const abrirModal = (produto = null) => {
    setErroCodigoUnico(false);
    setErroCodigoTamanho(false);
    
    if (produto) {
      const prefixo = getPrefixoCategoria(produto.categoria);
      const codigoNumerico = produto.codigo.substring(3);
      
      setProdutoEditando(produto);
      setFormData({
        nome: produto.nome || "",
        categoria: produto.categoria || "Outros",
        preco: produto.preco || 0,
        quantidade: produto.quantidade || 0,
        codigo: produto.codigo || "",
        codigoNumerico: codigoNumerico,
        descricao: produto.descricao || "",
        imagem_url: produto.imagem_url || ""
      });
    } else {
      setProdutoEditando(null);
      setFormData({
        nome: "",
        categoria: "Outros",
        preco: "",
        quantidade: "",
        codigo: "OUT",
        codigoNumerico: "",
        descricao: "",
        imagem_url: ""
      });
    }
    
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoEditando(null);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    
    const prefixo = getPrefixoCategoria(formData.categoria);
    if (!verificarCodigoUnico(prefixo, formData.codigoNumerico, produtoEditando?.id)) {
      return;
    }
    
    try {
      let novosProdutos = [...produtos];
      const dadosSalvar = {
        ...formData,
        codigo: `${prefixo}${formData.codigoNumerico}`
      };
      
      if (produtoEditando) {
        await Produto.update(produtoEditando.id, dadosSalvar);
        
        const index = novosProdutos.findIndex(p => p.id === produtoEditando.id);
        if (index !== -1) {
          novosProdutos[index] = { 
            ...produtoEditando, 
            ...dadosSalvar 
          };
        }
        addNotification(`Produto ${formData.nome} atualizado com sucesso!`);
      } else {
        const novoProduto = await Produto.create(dadosSalvar);
        
        const produtoCompleto = novoProduto || {
          ...dadosSalvar,
          id: Date.now().toString()
        };
        
        novosProdutos.push(produtoCompleto);
        addNotification(`Produto ${formData.nome} criado com sucesso!`);
      }
      
      salvarNoLocalStorage(novosProdutos);
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      addNotification("Erro ao salvar produto", "error");
    }
  };

  const excluirProduto = async (id) => {
    const produtoParaExcluir = produtos.find(p => p.id === id);
    
    setProdutoParaExcluir(produtoParaExcluir);
    setConfirmationModalOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return;

    try {
      await Produto.delete(produtoParaExcluir.id);
      
      const novosProdutos = produtos.filter(produto => produto.id !== produtoParaExcluir.id);
      salvarNoLocalStorage(novosProdutos);
      
      addNotification(`Produto ${produtoParaExcluir.nome} excluído com sucesso!`);
      
      setConfirmationModalOpen(false);
      setProdutoParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      addNotification("Erro ao excluir produto", "error");
      
      setConfirmationModalOpen(false);
      setProdutoParaExcluir(null);
    }
  };

  const cancelarExclusao = () => {
    setConfirmationModalOpen(false);
    setProdutoParaExcluir(null);
  };

  const gerarCodigoNumericoUnico = () => {
    const prefixo = getPrefixoCategoria(formData.categoria);
    const codigosExistentes = new Set(
      produtos
        .filter(p => p.codigo?.startsWith(prefixo))
        .map(p => p.codigo?.substring(3))
    );
    
    let novoCodigoNumerico;
    do {
      novoCodigoNumerico = String(Math.floor(Math.random() * 900) + 100);
    } while (codigosExistentes.has(novoCodigoNumerico));
    
    setFormData(prev => ({
      ...prev,
      codigoNumerico: novoCodigoNumerico,
      codigo: `${prefixo}${novoCodigoNumerico}`
    }));
    
    setErroCodigoUnico(false);
    setErroCodigoTamanho(false);
  };

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.categoria?.toLowerCase().includes(filtro.toLowerCase())
  );

  const formValido = !erroCodigoUnico && !erroCodigoTamanho && formData.codigoNumerico.length === 3;

  return (
    <div className="estoque-container">
      {notifications.map((notification) => (
        <Notification 
          key={notification.id}
          message={notification.message} 
          type={notification.type}
          duration={1500}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <ConfirmationModal 
        isOpen={confirmationModalOpen}
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${produtoParaExcluir?.nome}"?`}
      />

      <div className="estoque-header">
        <div className="estoque-search">
          <Search className="estoque-search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="estoque-search-input"
          />
        </div>
        
        <button
          onClick={() => abrirModal()}
          className="estoque-btn-novo"
        >
          <PlusCircle size={18} />
          Novo Produto
        </button>
      </div>

      {carregando ? (
        <div className="estoque-loading">
          <div className="estoque-loading-title"></div>
          <div className="estoque-loading-items">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="estoque-loading-item">
                <div className="estoque-loading-name"></div>
                <div className="estoque-loading-desc"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="estoque-table-container">
          <table className="estoque-table">
            <thead className="estoque-table-header">
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Código</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th className="estoque-table-actions">Ações</th>
              </tr>
            </thead>
            <tbody className="estoque-table-body">
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id}>
                  <td>
                    <div className="estoque-produto-cell">
                      <div className="estoque-produto-img">
                        <img
                          src={produto.imagem_url || "https://images.unsplash.com/photo-1607349913232-6cf2734b6fe3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1cGVybWFya2V0JTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"}
                          alt={produto.nome}
                          className="estoque-produto-img-src"
                        />
                      </div>
                      <div>
                        <div className="estoque-produto-nome">
                          {produto.nome}
                        </div>
                        <div className="estoque-produto-desc">
                          {produto.descricao?.substring(0, 50)}
                          {produto.descricao?.length > 50 ? "..." : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{produto.categoria}</td>
                  <td>{produto.codigo}</td>
                  <td>R$ {produto.preco?.toFixed(2)}</td>
                  <td>
                    <span className={`estoque-badge ${
                      produto.quantidade > 10
                        ? "estoque-badge-verde"
                        : produto.quantidade > 0
                        ? "estoque-badge-amarelo"
                        : "estoque-badge-vermelho"
                    }`}>
                      {produto.quantidade} unidades
                    </span>
                  </td>
                  <td className="estoque-table-actions">
                    <button
                      onClick={() => abrirModal(produto)}
                      className="estoque-btn-edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => excluirProduto(produto.id)}
                      className="estoque-btn-delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="estoque-empty-message">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="estoque-modal-overlay">
          <div className="estoque-modal">
            <div className="estoque-modal-header">
              <h3 className="estoque-modal-title">
                {produtoEditando ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button onClick={fecharModal} className="estoque-modal-close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={salvarProduto} className="estoque-form">
              <div className="estoque-form-group">
                <label className="estoque-form-label">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="estoque-form-input"
                />
              </div>
              
              <div className="estoque-form-group">
                <label className="estoque-form-label">Categoria</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className="estoque-form-select"
                >
                  {["Bebidas", "Hortifruti", "Peixaria", "Churrasco", "Doces", "Beleza", "Pet Shop", "Produtos de Limpeza", "Higiene", "Outros"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="estoque-form-group-row">
                <div className="estoque-form-group">
                  <label className="estoque-form-label">Preço</label>
                  <input
                    type="number"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="estoque-form-input"
                  />
                </div>
                
                <div className="estoque-form-group">
                  <label className="estoque-form-label">Quantidade</label>
                  <input
                    type="number"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="estoque-form-input"
                  />
                </div>
              </div>
              
              <div className="estoque-form-group" >
                <label className="estoque-form-label">Código</label>
                <div className="estoque-form-codigo-container">
                  <div className="estoque-form-codigo-prefixo">
                    {getPrefixoCategoria(formData.categoria)}
                  </div>  
                  <input
                    type="text"
                    name="codigoNumerico"
                    value={formData.codigoNumerico}
                    onChange={handleInputChange}
                    required
                    className={`estoque-form-input estoque-form-codigo-input ${
                      erroCodigoUnico || erroCodigoTamanho ? "estoque-form-input-erro" : ""
                    }`}
                    placeholder="123"
                    maxLength={3}
                  />
                  <button
                    type="button"
                    onClick={gerarCodigoNumericoUnico}
                    className="estoque-btn-gerar-codigo"
                    title="Gerar código único"
                  >
                    Gerar
                  </button>
                </div>
                
                {erroCodigoUnico && (
                  <div className="estoque-form-erro">
                    <AlertTriangle size={14} />
                    Este código já está em uso. Por favor, use outro código.
                  </div>
                )}
                
                {erroCodigoTamanho && (
                  <div className="estoque-form-erro">
                    <AlertTriangle size={14} />
                    O código deve ter exatamente 3 dígitos numéricos.
                  </div>
                )}
                
                <small className="estoque-form-help-text">
                  O código deve ter 6 caracteres: 3 letras da categoria + 3 dígitos únicos
                </small>
              </div>
              
              <div className="estoque-form-group">
                <label className="estoque-form-label">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows="3"
                  className="estoque-form-textarea"
                />
              </div>
              
              <div className="estoque-form-group">
                <label className="estoque-form-label">URL da Imagem</label>
                <input
                  type="url"
                  name="imagem_url"
                  value={formData.imagem_url}
                  onChange={handleInputChange}
                  className="estoque-form-input"
                  placeholder="https://..."
                />
              </div>
              
              <div className="estoque-form-actions">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="estoque-btn-cancelar"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="estoque-btn-salvar"
                  disabled={!formValido}
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}