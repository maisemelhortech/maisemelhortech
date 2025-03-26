import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, FileText, PieChart as PieChartIcon } from "lucide-react";
import {Produto} from '../../Entities/Produto';
import {Venda} from '../../Entities/Venda';
import {Cliente} from '../../Entities/Cliente';
import '../../Styles/RelatoriosTab.css';

export default function RelatoriosTab() {
  const [dados, setDados] = useState({
    vendas: [],
    produtos: [],
    clientes: []
  });
  const [categoriasSummary, setCategoriasSummary] = useState([]);
  const [vendasMensais, setVendasMensais] = useState([]);
  const [metodoPagamentoSummary, setMetodoPagamentoSummary] = useState([]);
  const [vendasFiltradas, setVendasFiltradas] = useState([]); 
  const [carregando, setCarregando] = useState(true);
  const [tipoRelatorio, setTipoRelatorio] = useState("estoque");
  const [periodoRelatorio, setPeriodoRelatorio] = useState("30");

  const COLORS = ['#1a407a', '#ffaec0', '#4ade80', '#f97316', '#a855f7', '#ec4899', '#0891b2'];

  useEffect(() => {
    carregarDados();
  }, [periodoRelatorio]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      console.log("Iniciando carregamento de dados...");
      
      // Carregar vendas - Primeiramente do localStorage, como faz a VendasTab
      let vendas = [];
      const vendasLocalStorage = localStorage.getItem('vendas');
      
      if (vendasLocalStorage) {
        vendas = JSON.parse(vendasLocalStorage);
        console.log("Vendas carregadas do localStorage:", vendas);
      } else {
        try {
          vendas = await Venda.list() || [];
          console.log("Vendas carregadas da API:", vendas);
        } catch (error) {
          console.error("Erro ao carregar vendas da API:", error);
          vendas = [];
        }
      }
      
      // Carregar produtos - Primeiro do localStorage
      let produtos = [];
      const produtosLocalStorage = localStorage.getItem('produtos');
      
      if (produtosLocalStorage) {
        produtos = JSON.parse(produtosLocalStorage);
        console.log("Produtos carregados do localStorage:", produtos);
      } else {
        try {
          produtos = await Produto.list() || [];
          console.log("Produtos carregados da API:", produtos);
        } catch (error) {
          console.error("Erro ao carregar produtos da API:", error);
          produtos = [];
        }
      }
      
      // Carregar clientes - Primeiro do localStorage
      let clientes = [];
      const clientesLocalStorage = localStorage.getItem('clientes');
      
      if (clientesLocalStorage) {
        clientes = JSON.parse(clientesLocalStorage);
        console.log("Clientes carregados do localStorage:", clientes);
      } else {
        try {
          clientes = await Cliente.list() || [];
          console.log("Clientes carregados da API:", clientes);
        } catch (error) {
          console.error("Erro ao carregar clientes da API:", error);
          clientes = [];
        }
      }
      
      setDados({ vendas, produtos, clientes });
      
      // Filtrar apenas as vendas concluídas - corresponde a VendasTab
      const vendasConcluidas = vendas.filter(venda => 
        venda.status === "Concluída" || venda.status === undefined || venda.status === null
      );
      
      // Filtrar vendas pelo período selecionado.
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - parseInt(periodoRelatorio));
      
      const vendasFiltradasPorPeriodo = vendasConcluidas.filter(venda => {
        if (!venda.data) return false;
        
        // Cria um objeto de data a partir da data de venda
        const dataVenda = new Date(venda.data);
        
        // Checar se a data é válida.
        if (isNaN(dataVenda.getTime())) {
          console.warn(`Data inválida para venda ID ${venda.id || 'desconhecido'}:`, venda.data);
          return false;
        }
        
        return dataVenda >= dataLimite;
      });
      
      console.log("Vendas filtradas por período:", vendasFiltradasPorPeriodo);
      setVendasFiltradas(vendasFiltradasPorPeriodo);
      
      // Calcular resumo por categoria
      const categorias = {};
      produtos.forEach(produto => {
        if (!produto.categoria) return;
        
        categorias[produto.categoria] = categorias[produto.categoria] || 0;
        categorias[produto.categoria] += produto.quantidade || 0;
      });
      
      const categoriasArr = Object.keys(categorias).map(categoria => ({
        name: categoria,
        value: categorias[categoria]
      }));
      
      setCategoriasSummary(categoriasArr);
      
      // Calcular vendas mensais
      const vendaPorMes = {};
      vendasFiltradasPorPeriodo.forEach(venda => {
        if (!venda.data) return;
        
        try {
          const data = new Date(venda.data);
          if (isNaN(data.getTime())) return;
          
          const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
          vendaPorMes[mesAno] = vendaPorMes[mesAno] || 0;
          vendaPorMes[mesAno] += venda.total || 0;
        } catch (error) {
          console.error("Erro ao processar data da venda:", error);
        }
      });
      
      const vendaMensalArr = Object.keys(vendaPorMes).map(mesAno => ({
        name: mesAno,
        valor: vendaPorMes[mesAno]
      }));
      
      vendaMensalArr.sort((a, b) => {
        const [mesA, anoA] = a.name.split('/');
        const [mesB, anoB] = b.name.split('/');
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
      });
      
      console.log("Vendas mensais calculadas:", vendaMensalArr);
      setVendasMensais(vendaMensalArr);
      
      // Calcular por método de pagamento
      const metodosPagamento = {};
      vendasFiltradasPorPeriodo.forEach(venda => {
        if (!venda.metodo_pagamento) {
          // Se não tiver método de pagamento definido, considerar como "Dinheiro"
          metodosPagamento["Dinheiro"] = metodosPagamento["Dinheiro"] || 0;
          metodosPagamento["Dinheiro"] += venda.total || 0;
          return;
        }
        
        metodosPagamento[venda.metodo_pagamento] = metodosPagamento[venda.metodo_pagamento] || 0;
        metodosPagamento[venda.metodo_pagamento] += venda.total || 0;
      });
      
      const metodosPagamentoArr = Object.keys(metodosPagamento).map(metodo => ({
        name: metodo,
        value: metodosPagamento[metodo]
      }));
      
      console.log("Métodos de pagamento calculados:", metodosPagamentoArr);
      setMetodoPagamentoSummary(metodosPagamentoArr);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  const gerarRelatorioTXT = () => {
    let conteudo = "";
    
    if (tipoRelatorio === "estoque") {
      conteudo = "RELATÓRIO DE ESTOQUE - MAIS & MELHOR\n";
      conteudo += "===================================\n\n";
      conteudo += `Data de geração: ${new Date().toLocaleString()}\n\n`;
      
      conteudo += "RESUMO POR CATEGORIA:\n";
      categoriasSummary.forEach(categoria => {
        conteudo += `${categoria.name}: ${categoria.value} unidades\n`;
      });
      
      conteudo += "\nPRODUTOS EM ESTOQUE:\n";
      dados.produtos.forEach(produto => {
        conteudo += `\nCódigo: ${produto.codigo}\n`;
        conteudo += `Nome: ${produto.nome}\n`;
        conteudo += `Categoria: ${produto.categoria}\n`;
        conteudo += `Preço: R$ ${produto.preco?.toFixed(2)}\n`;
        conteudo += `Quantidade: ${produto.quantidade} unidades\n`;
      });
    } else if (tipoRelatorio === "vendas") {
      conteudo = "RELATÓRIO DE VENDAS - MAIS & MELHOR\n";
      conteudo += "===================================\n\n";
      conteudo += `Data de geração: ${new Date().toLocaleString()}\n`;
      conteudo += `Período: Últimos ${periodoRelatorio} dias\n\n`;
      
      conteudo += "RESUMO POR MÉTODO DE PAGAMENTO:\n";
      metodoPagamentoSummary.forEach(metodo => {
        conteudo += `${metodo.name}: R$ ${metodo.value.toFixed(2)}\n`;
      });
      
      conteudo += "\nVENDAS POR MÊS:\n";
      vendasMensais.forEach(mes => {
        conteudo += `${mes.name}: R$ ${mes.valor.toFixed(2)}\n`;
      });
      
      conteudo += "\nDETALHES DAS VENDAS:\n";
      vendasFiltradas.forEach(venda => {
        const cliente = dados.clientes.find(c => c.id === venda.cliente_id);
        
        conteudo += `\nID: ${venda.id || 'N/A'}\n`;
        conteudo += `Hash da compra: ${venda.hash_compra || 'N/A'}\n`;
        conteudo += `Data: ${venda.data ? new Date(venda.data).toLocaleString() : 'Data não registrada'}\n`;
        conteudo += `Cliente: ${cliente?.nome || venda.cliente_id || "Cliente não registrado"}\n`;
        conteudo += `Total: R$ ${venda.total?.toFixed(2) || '0.00'}\n`;
        conteudo += `Método de Pagamento: ${venda.metodo_pagamento || 'Dinheiro'}\n`;
        conteudo += `Status: ${venda.status || 'Concluída' }\n`;
        
        // Adicionar detalhes dos itens se disponíveis
        if (venda.items && venda.items.length > 0) {
          conteudo += "Itens:\n";
          venda.items.forEach(item => {
            const produto = dados.produtos.find(p => p.id === item.produto_id);
            conteudo += `   - ${produto?.nome || 'Produto'}: ${item.quantidade} x R$ ${item.preco_unitario?.toFixed(2) || '0.00'} = R$ ${((item.quantidade || 0) * (item.preco_unitario || 0)).toFixed(2)}\n`;
          });
        }
      });
    }
    
    // Criar e baixar o arquivo
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_${tipoRelatorio}_${new Date().toISOString().split("T")[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relatorios-container">
      <div className="relatorios-card">
        <h2 className="relatorios-title">Gerar Relatórios</h2>
        
        <div className="relatorios-form-grid">
          <div className="relatorios-form-group">
            <label className="relatorios-form-label">Tipo de Relatório</label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="relatorios-form-select"
            >
              <option value="estoque">Relatório de Estoque</option>
              <option value="vendas">Relatório de Vendas</option>
            </select>
          </div>
          
          <div className="relatorios-form-group">
            <label className="relatorios-form-label">Período (dias)</label>
            <select
              value={periodoRelatorio}
              onChange={(e) => setPeriodoRelatorio(e.target.value)}
              className="relatorios-form-select"
              disabled={tipoRelatorio === "estoque"}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
          
          <div className="relatorios-form-group" style={{ justifyContent: 'flex-end' }}>
            <button
              onClick={gerarRelatorioTXT}
              className="relatorios-button"
            >
              <Download className="relatorios-button-icon" />
              Gerar Relatório TXT
            </button>
          </div>
        </div>
      </div>
      
      {carregando ? (
        <div className="relatorios-loading">
          <div className="relatorios-loading-title"></div>
          <div className="relatorios-loading-content"></div>
        </div>
      ) : (
        <div className="relatorios-grid">
          {tipoRelatorio === "estoque" ? (
            <>
              <div className="relatorios-card">
                <h2 className="relatorios-title">Distribuição de Produtos por Categoria</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriasSummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoriasSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} unidades`, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="relatorios-card">
                <h2 className="relatorios-title">Resumo de Estoque por Categoria</h2>
                <div className="table-container">
                  <table className="relatorios-table">
                    <thead className="relatorios-table-header">
                      <tr>
                        <th>Categoria</th>
                        <th>Quantidade Total</th>
                        <th>Valor Total em Estoque</th>
                      </tr>
                    </thead>
                    <tbody className="relatorios-table-body">
                      {categoriasSummary.map((categoria, index) => {
                        const produtosCategoria = dados.produtos.filter(p => p.categoria === categoria.name);
                        const valorTotal = produtosCategoria.reduce((sum, produto) => sum + (produto.preco * produto.quantidade || 0), 0);
                        
                        return (
                          <tr key={index}>
                            <td className="relatorios-table-data-primary">
                              {categoria.name}
                            </td>
                            <td className="relatorios-table-data">
                              {categoria.value} unidades
                            </td>
                            <td className="relatorios-table-data">
                              R$ {valorTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relatorios-card">
                <h2 className="relatorios-title">Vendas Mensais</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vendasMensais}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                      <Legend />
                      <Bar dataKey="valor" fill="#1a407a" name="Valor (R$)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="relatorios-grid-2col">
                <div className="relatorios-card">
                  <h2 className="relatorios-title">Vendas por Método de Pagamento</h2>
                  <div className="chart-container-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metodoPagamentoSummary}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {metodoPagamentoSummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="relatorios-card">
                  <h2 className="relatorios-title">Resumo de Vendas</h2>
                  
                  {/* Total de vendas */}
                  <div className="stats-grid">
                    <div className="stats-card">
                      <p className="stats-label">Total de vendas</p>
                      <p className="stats-value">
                        {vendasFiltradas.length}
                      </p>
                    </div>
                    <div className="stats-card">
                      <p className="stats-label">Valor total</p>
                      <p className="stats-value">
                        R$ {vendasFiltradas
                          .reduce((sum, venda) => sum + (venda.total || 0), 0)
                          .toFixed(2)
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Métodos de pagamento */}
                  <div className="payment-list">
                    <h3 className="payment-list-title">Por método de pagamento</h3>
                    <ul>
                      {metodoPagamentoSummary.map((metodo, index) => (
                        <li key={index} className="payment-list-item">
                          <span className="payment-method">{metodo.name}</span>
                          <span className="payment-value">R$ {metodo.value.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Add a new section to display sales details */}
              <div className="relatorios-card">
                <h2 className="relatorios-title">Detalhes das Vendas</h2>
                <div className="table-container">
                  <table className="relatorios-table">
                    <thead className="relatorios-table-header">
                      <tr>
                        <th>ID/Hash</th>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Método</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody className="relatorios-table-body">
                      {vendasFiltradas.length > 0 ? (
                        vendasFiltradas.map((venda, index) => {
                          const cliente = dados.clientes.find(c => c.id === venda.cliente_id);
                          
                          return (
                            <tr key={index}>
                              <td className="relatorios-table-data-primary">
                                {venda.hash_compra || venda.id || 'N/A'}
                              </td>
                              <td className="relatorios-table-data">
                                {venda.data ? new Date(venda.data).toLocaleString() : 'N/A'}
                              </td>
                              <td className="relatorios-table-data">
                                {cliente?.nome || venda.cliente_id || "Cliente não registrado"}
                              </td>
                              <td className="relatorios-table-data">
                                {venda.metodo_pagamento || "Dinheiro"}
                              </td>
                              <td className="relatorios-table-data">
                                {venda.status || "Concluída"}
                              </td>
                              <td className="relatorios-table-data">
                                R$ {venda.total?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="relatorios-table-data-empty">
                            Nenhuma venda encontrada para o período selecionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

