import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/createPageUrl";
import { Produto } from "../Entities/Produto";
import { Venda } from "../Entities/Venda";
import { Cliente } from "../Entities/Cliente";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, FileText, FileDown } from "lucide-react";
import { InvokeLLM } from "../integrations/Core";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import '../Styles/Carrinho.css'

export default function Carrinho() {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [total, setTotal] = useState(0);
  const [clienteCpf, setClienteCpf] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("Cartão de Crédito");
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [hashCompra, setHashCompra] = useState(null);
  const [baixandoRelatório, setBaixandoRelatório] = useState(false);
  const [compraFinalizada, setCompraFinalizada] = useState(null); // Para guardar os dados da compra finalizada

  document.title = "Mais & Melhor - Carrinho";

  useEffect(() => {
    async function carregarCarrinho() {
      try {
        setCarregando(true);
        
        const itensLocalStorage = JSON.parse(localStorage.getItem('carrinho') || '[]');
        
        if (itensLocalStorage.length > 0) {
          const todosProdutos = await Produto.list();
          
          const itensAtualizados = itensLocalStorage.map(item => {
            const produtoCompleto = todosProdutos.find(p => p.id === item.produto_id);
            
            return {
              ...item,
              produto: produtoCompleto || {
                nome: item.nome,
                preco: item.preco,
                quantidade: 9999,
                imagem_url: item.imagem_url
              }
            };
          });
          
          setItensCarrinho(itensAtualizados);
          const valorTotal = itensAtualizados.reduce((soma, item) => soma + item.subtotal, 0);
          setTotal(valorTotal);
        }
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      } finally {
        setCarregando(false);
      }
    }
    
    carregarCarrinho();
  }, []);

  const atualizarQuant = (index, novaQuant) => {
    if (novaQuant < 1) return;
    
    const estoqueDisponivel = itensCarrinho[index].produto.quantidade;
    if (novaQuant > estoqueDisponivel) {
      alert(`Apenas ${estoqueDisponivel} unidades disponíveis em estoque.`);
      novaQuant = estoqueDisponivel;
    }
    
    const novosItens = [...itensCarrinho];
    novosItens[index].quantidade = novaQuant;
    novosItens[index].subtotal = novosItens[index].produto.preco * novaQuant;
    
    setItensCarrinho(novosItens);
    setTotal(novosItens.reduce((soma, item) => soma + item.subtotal, 0));
    
    // Atualizar localStorage
    const itensParaStorage = novosItens.map(item => ({
      id: item.id,
      nome: item.nome || item.produto.nome,
      preco: item.preco || item.produto.preco,
      quantidade: item.quantidade,
      subtotal: item.subtotal,
      imagem_url: item.imagem_url || item.produto.imagem_url,
      produto_id: item.produto_id || item.produto.id
    }));
    
    localStorage.setItem('carrinho', JSON.stringify(itensParaStorage));
  };

  const removerItem = (index) => {
    const novosItens = itensCarrinho.filter((_, i) => i !== index);
    setItensCarrinho(novosItens);
    setTotal(novosItens.reduce((soma, item) => soma + item.subtotal, 0));
    
    // Atualizar localStorage
    const itensParaStorage = novosItens.map(item => ({
      id: item.id,
      nome: item.nome || item.produto.nome,
      preco: item.preco || item.produto.preco,
      quantidade: item.quantidade,
      subtotal: item.subtotal,
      imagem_url: item.imagem_url || item.produto.imagem_url,
      produto_id: item.produto_id || item.produto.id
    }));
    
    localStorage.setItem('carrinho', JSON.stringify(itensParaStorage));
  };

  const gerarHash = async () => {
    const itensString = itensCarrinho.map(item => 
      `${item.produto.id}|${item.produto.nome}|${item.quantidade}|${item.produto.preco}`
    ).join(',');
    
    const dataString = new Date().toISOString();
    const inputString = `${itensString}|${total}|${dataString}`;
    
    try {
      const response = await InvokeLLM({
        prompt: `Gere um hash alfanumérico único de exatamente 20 caracteres (letras, números e caracteres especiais) baseado neste input: ${inputString}. Retorne APENAS o hash, sem texto adicional.`,
        response_json_schema: {
          type: "object",
          properties: {
            hash: { type: "string" }
          }
        }
      });
      
      return response.hash;

    } catch (error) {
      console.error("Erro ao gerar hash:", error);
      return `ID${Date.now().toString().substring(0, 16)}`;
    }
  };

  // Nova implementação usando jsPDF - Agora usando os itens da compra finalizada
  const gerarPDF = () => {
    try {
      const doc = new jsPDF();
      const itens = compraFinalizada.itens;
      const valorTotal = compraFinalizada.valorTotal;
      
      // Título e cabeçalho
      doc.setFontSize(16);
      doc.text('RECIBO DA COMPRA - MAIS & MELHOR', 20, 20);
      doc.setFontSize(12);
      doc.text('-----------------------------------------', 20, 25);
      
      // Data e informações do cliente
      const dataHora = new Date().toLocaleString();
      doc.text(`Data: ${dataHora}`, 20, 35);
      doc.text(`Cliente: ${compraFinalizada.clienteCpf || "Cliente não identificado"}`, 20, 45);
      doc.text(`Método de Pagamento: ${compraFinalizada.metodoPagamento}`, 20, 55);
      
      // Itens da compra
      doc.text('ITENS COMPRADOS:', 20, 70);
      doc.text('-----------------------------------------', 20, 75);
      
      let y = 85;
      
      itens.forEach((item, index) => {
        // Verificar se precisamos adicionar uma nova página
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const produtoNome = item.produto?.nome || item.nome || "Produto";
        const produtoCodigo = item.produto?.codigo || "N/A";
        const produtoPreco = item.produto?.preco || item.preco || 0;
        const quantidade = item.quantidade || 0;
        const subtotal = item.subtotal || (produtoPreco * quantidade);
        
        doc.text(`${index + 1}. ${produtoNome}`, 20, y);
        doc.text(`   Código: ${produtoCodigo}`, 20, y + 10);
        doc.text(`   Quantidade: ${quantidade}`, 20, y + 20);
        doc.text(`   Preço unitário: R$ ${produtoPreco.toFixed(2)}`, 20, y + 30);
        doc.text(`   Subtotal: R$ ${subtotal.toFixed(2)}`, 20, y + 40);
        doc.text('-----------------------------------------', 20, y + 50);
        
        y += 60;
      });
      
      // Verificar se precisamos adicionar uma nova página para o resumo
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      // Resumo da compra
      doc.text('RESUMO:', 20, y + 10);
      doc.text(`Total de itens: ${itens.reduce((soma, item) => soma + (item.quantidade || 0), 0)}`, 20, y + 20);
      doc.text(`Valor total: R$ ${valorTotal.toFixed(2)}`, 20, y + 30);
      doc.text('-----------------------------------------', 20, y + 40);
      doc.text(`ID da Compra: ${hashCompra}`, 20, y + 50);
      doc.text('-----------------------------------------', 20, y + 60);
      doc.text('Obrigado por comprar na Mais & Melhor!', 20, y + 70);
      doc.text('www.maismelhor.com', 20, y + 80);
      
      doc.save(`compra_maismelhor_${new Date().toISOString().split('T')[0]}.pdf`);
      return true;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tentando baixar versão alternativa em texto.");
      return gerarTxt();
    }
  };

  // Uusando os itens da compra finalizada
  const gerarTxt = () => {
    try {
      const dataHora = new Date().toLocaleString();
      const cliente = compraFinalizada.clienteCpf || "Cliente não identificado";
      const itens = compraFinalizada.itens;
      const valorTotal = compraFinalizada.valorTotal;
      
      let conteudo = "RECIBO DA COMPRA - MAIS & MELHOR\n";
      conteudo += "=====================================\n\n";
      conteudo += `Data: ${dataHora}\n`;
      conteudo += `Cliente: ${cliente}\n`;
      conteudo += `Método de Pagamento: ${compraFinalizada.metodoPagamento}\n\n`;
      conteudo += "ITENS COMPRADOS:\n";
      conteudo += "----------------\n";
      
      itens.forEach((item, index) => {
        const produtoNome = item.produto?.nome || item.nome || "Produto";
        const produtoCodigo = item.produto?.codigo || "N/A";
        const produtoPreco = item.produto?.preco || item.preco || 0;
        const quantidade = item.quantidade || 0;
        const subtotal = item.subtotal || (produtoPreco * quantidade);
        
        conteudo += `\n${index + 1}. ${produtoNome}\n`;
        conteudo += `   Código: ${produtoCodigo}\n`;
        conteudo += `   Quantidade: ${quantidade}\n`;
        conteudo += `   Preço unitário: R$ ${produtoPreco.toFixed(2)}\n`;
        conteudo += `   Subtotal: R$ ${subtotal.toFixed(2)}\n`;
        conteudo += "--------------------------------\n";
      });
      
      conteudo += "\nRESUMO:\n";
      conteudo += `Total de itens: ${itens.reduce((soma, item) => soma + (item.quantidade || 0), 0)}\n`;
      conteudo += `Valor total: R$ ${valorTotal.toFixed(2)}\n\n`;
      conteudo += "=====================================\n";
      conteudo += `ID da Compra: ${hashCompra}\n`;
      conteudo += "=====================================\n\n";
      conteudo += "Obrigado por comprar na Mais & Melhor!\n";
      conteudo += "www.maismelhor.com";
      
      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `compra_maismelhor_${new Date().toISOString().split('T')[0]}.txt`);
      
      return true;
    } catch (error) {
      console.error("Erro ao gerar TXT:", error);
      alert("Ocorreu um erro ao gerar o arquivo de texto.");
      return false;
    }
  };

  // Função para baixar ambos os relatórios
  const baixarRelatorios = async () => {
    setBaixandoRelatório(true);
    try {
      await gerarTxt();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await gerarPDF();
    } catch (error) {
      console.error("Erro ao baixar relatórios:", error);
      alert("Ocorreu um erro ao gerar os relatórios. Por favor, tente novamente.");
    } finally {
      setBaixandoRelatório(false);
    }
  };

  // Função para persistir vendas no localStorage
  const salvarVendaNoLocalStorage = (novaVenda) => {
    try {
      // Obter as vendas existentes do localStorage
      const vendasLocalStorage = localStorage.getItem('vendas');
      let vendas = [];
      
      if (vendasLocalStorage) {
        vendas = JSON.parse(vendasLocalStorage);
      }
      
      // Adicionar a nova venda
      vendas.push(novaVenda);
      
      // Salvar de volta no localStorage
      localStorage.setItem('vendas', JSON.stringify(vendas));
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar venda no localStorage:", error);
      return false;
    }
  };

  const finalizarCompra = async () => {
    if (itensCarrinho.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }
    
    try {
      setProcessando(true);
      setSucesso(false);
      setErro(null);
      
      const hash = await gerarHash();
      setHashCompra(hash);
      
      // Salvar os dados da compra antes de limpar o carrinho
      setCompraFinalizada({
        itens: [...itensCarrinho], // Cópia profunda dos itens
        valorTotal: total,
        clienteCpf: clienteCpf,
        metodoPagamento: metodoPagamento,
        data: new Date()
      });
      
      const items = itensCarrinho.map(item => ({
        produto_id: item.produto_id || item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco || item.produto.preco
      }));
      
      // Criar o objeto de venda completo
      const vendaObj = {
        id: Date.now().toString(), // Garantir um ID único
        cliente_id: clienteCpf || null,
        data: new Date().toISOString(),
        items,
        total,
        metodo_pagamento: metodoPagamento,
        status: "Concluída",
        hash_compra: hash
      };
      
      // Tentativa de criar a venda via API
      let venda;
      try {
        venda = await Venda.create(vendaObj);
      } catch (apiError) {
        console.error("Erro ao criar venda via API:", apiError);
        venda = vendaObj; // Se falhar, usar o objeto local
      }
      
      // Persistir a venda no localStorage para garantir que esteja disponível no VendasTab
      salvarVendaNoLocalStorage(venda || vendaObj);
      
      // CORREÇÃO: Atualizar estoque dos produtos corretamente
      for (const item of itensCarrinho) {
        try {
          const produtoId = item.produto_id || item.produto.id;
          // Buscar todos os produtos para encontrar o produto específico com a quantidade atual
          const todosProdutos = await Produto.list();
          const produtoAtual = todosProdutos.find(p => p.id === produtoId);
          
          if (produtoAtual) {
            // Calcular a nova quantidade subtraindo apenas o que foi comprado
            const novaQuant = produtoAtual.quantidade - item.quantidade;
            const quantidadeFinal = novaQuant >= 0 ? novaQuant : 0;
            
            // Atualizar na API
            await Produto.update(produtoId, {
              quantidade: quantidadeFinal
            });
            
            // Atualizar também no localStorage
            atualizarProdutoNoLocalStorage(produtoId, quantidadeFinal);
          }
        } catch (error) {
          console.error("Erro ao atualizar estoque do produto:", error);
        }
      }
      
      localStorage.removeItem('carrinho');
      
      setItensCarrinho([]);
      setTotal(0);
      
      setSucesso(true);
      
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      setErro("Ocorreu um erro ao processar sua compra. Por favor, tente novamente.");
    } finally {
      setProcessando(false);
    }
  };
  
  // Função para atualizar produtos no localStorage
  const atualizarProdutoNoLocalStorage = (produtoId, novaQuantidade) => {
    try {
      const produtosLocalStorage = localStorage.getItem('produtos');
      if (produtosLocalStorage) {
        const produtos = JSON.parse(produtosLocalStorage);
        const index = produtos.findIndex(p => p.id === produtoId);
        
        if (index !== -1) {
          produtos[index].quantidade = novaQuantidade;
          localStorage.setItem('produtos', JSON.stringify(produtos));
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar produto no localStorage:", error);
    }
  };

return (
  <div className="carrinho-container">
    <Link to={createPageUrl("Inicio")} className="carrinho-voltar-link">
      <ArrowLeft size={18} className="carrinho-voltar-icone" /> Continuar comprando
    </Link>
    
    <h1 className="carrinho-titulo">Seu Carrinho</h1>
    
    {carregando ? (
      <div className="carrinho-loading">
        <div className="carrinho-loading-titulo"></div>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="carrinho-loading-item">
            <div className="carrinho-loading-produto">
              <div className="carrinho-loading-imagem"></div>
              <div className="carrinho-loading-info">
                <div className="carrinho-loading-nome"></div>
                <div className="carrinho-loading-preco"></div>
              </div>
            </div>
            <div className="carrinho-loading-acoes">
              <div className="carrinho-loading-quantidade"></div>
              <div className="carrinho-loading-remover"></div>
            </div>
          </div>
        ))}
        <div className="carrinho-loading-resumo">
          <div className="carrinho-loading-total-label"></div>
          <div className="carrinho-loading-total-valor"></div>
        </div>
      </div>
    ) : sucesso ? (
      <div className="carrinho-sucesso">
        <div className="carrinho-sucesso-icone">
          <ShoppingBag size={24} className="carrinho-sucesso-icone-svg" />
        </div>
        <h2 className="carrinho-sucesso-titulo">Compra realizada com sucesso!</h2>
        <p className="carrinho-sucesso-mensagem">
          Obrigado por comprar na Mais & Melhor. Sua compra foi processada com sucesso.
        </p>
        <p className="carrinho-sucesso-hash">
          Hash da compra: <span className="carrinho-sucesso-hash-valor">{hashCompra}</span>
        </p>
        <div className="carrinho-sucesso-acoes">
          <button
            onClick={baixarRelatorios}
            disabled={baixandoRelatório}
            className="carrinho-sucesso-btn-relatorio"
          >
            {baixandoRelatório ? (
              <>Baixando relatórios...</>
            ) : (
              <>
                <FileDown size={18} />
                Baixar relatórios (PDF e TXT)
              </>
            )}
          </button>
        </div>
        <Link
          to={createPageUrl("Inicio")}
          className="carrinho-sucesso-btn-comprar"
        >
          Continuar Comprando
        </Link>
      </div>
    ) : itensCarrinho.length > 0 ? (
      <div className="carrinho-grid">
        <div className="carrinho-lista-container">
          <div className="carrinho-lista-card">
            <h2 className="carrinho-lista-titulo">Itens do Carrinho</h2>
            
            <div className="carrinho-lista-items">
              {itensCarrinho.map((item, index) => (
                <div key={index} className="carrinho-item">
                  <div className="carrinho-item-produto">
                    <div className="carrinho-item-imagem-container">
                      <img 
                        src={item.produto.imagem_url || "https://images.unsplash.com/photo-1607349913232-6cf2734b6fe3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1cGVybWFya2V0JTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"} 
                        alt={item.produto.nome} 
                        className="carrinho-item-imagem"
                      />
                    </div>
                    <div className="carrinho-item-info">
                      <h3 className="carrinho-item-nome">{item.produto.nome}</h3>
                      <p className="carrinho-item-preco">
                        R$ {item.produto.preco?.toFixed(2)} cada
                      </p>
                    </div>
                  </div>
                  
                  <div className="carrinho-item-acoes">
                    <div className="carrinho-item-quantidade">
                      <button 
                        onClick={() => atualizarQuant(index, item.quantidade - 1)}
                        className="carrinho-item-btn-menos"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="carrinho-item-qtd-valor">{item.quantidade}</span>
                      <button 
                        onClick={() => atualizarQuant(index, item.quantidade + 1)}
                        className="carrinho-item-btn-mais"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="carrinho-item-totais">
                      <span className="carrinho-item-subtotal">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removerItem(index)}
                        className="carrinho-item-btn-remover"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="carrinho-resumo-container">
          <div className="carrinho-resumo-card">
            <h2 className="carrinho-resumo-titulo">Resumo do Pedido</h2>
            
            <div className="carrinho-resumo-valores">
              <div className="carrinho-resumo-linha">
                <span className="carrinho-resumo-label">Subtotal</span>
                <span className="carrinho-resumo-valor">R$ {total.toFixed(2)}</span>
              </div>
              <div className="carrinho-resumo-linha carrinho-resumo-linha-borda">
                <span className="carrinho-resumo-label">Frete</span>
                <span className="carrinho-resumo-valor">Grátis</span>
              </div>
              <div className="carrinho-resumo-linha carrinho-resumo-total">
                <span className="carrinho-resumo-total-label">Total</span>
                <span className="carrinho-resumo-total-valor">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="carrinho-form-campo">
              <label className="carrinho-form-label">
                CPF do cliente (opcional)
              </label>
              <input
                type="text"
                placeholder="Digite o CPF"
                value={clienteCpf}
                onChange={(e) => {
                  const cpfRaw = e.target.value.replace(/\D/g, '');
                  
                  let formattedCpf = '';
                  if (cpfRaw.length <= 3) {
                    formattedCpf = cpfRaw;
                  } else if (cpfRaw.length <= 6) {
                    formattedCpf = `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3)}`;
                  } else if (cpfRaw.length <= 9) {
                    formattedCpf = `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6)}`;
                  } else {
                    formattedCpf = `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6, 9)}-${cpfRaw.slice(9, 11)}`;
                  }
                  
                  setClienteCpf(formattedCpf);
                }}
                className="carrinho-form-input"
              />
            </div>
            
            <div className="carrinho-form-campo">
              <label className="carrinho-form-label">
                Método de pagamento
              </label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="carrinho-form-select"
              >
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
            
            {erro && (
              <div className="carrinho-erro-mensagem">
                {erro}
              </div>
            )}
            
            <button
              onClick={finalizarCompra}
              disabled={processando || itensCarrinho.length === 0}
              className={`carrinho-btn-finalizar ${
                processando || itensCarrinho.length === 0
                  ? "carrinho-btn-finalizar-desativado"
                  : ""
              }`}
            >
              {processando ? "Processando..." : "Finalizar Compra"}
            </button>

            <div className="carrinho-info-nota">
              <p style={{color: "#000000"}}>Após a compra, você poderá baixar os comprovantes em PDF e TXT.</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="carrinho-vazio">
        <div className="carrinho-vazio-icone">
          <ShoppingBag size={24} className="carrinho-vazio-icone-svg" />
        </div>
        <h2 className="carrinho-vazio-titulo">Seu carrinho está vazio</h2>
        <p className="carrinho-vazio-mensagem">
          Adicione produtos ao seu carrinho para começar a comprar.
        </p>
        <Link
          to={createPageUrl("Inicio")}
          className="carrinho-vazio-btn"
        >
          Começar a Comprar
        </Link>
      </div>
    )}
  </div>
);
}