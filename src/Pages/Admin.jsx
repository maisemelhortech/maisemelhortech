import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/createPageUrl";
import { 
  Package, Users, ShoppingCart, LogOut, BarChart2, ArrowLeft
} from "lucide-react";
import "../Styles/Admin.css"; // Importando o arquivo CSS

// Componentes para as diferentes abas do painel
import EstoqueTab from "../Components/admin/EstoqueTab";
import ClientesTab from "../Components/admin/ClienteTab";
import VendasTab from "../Components/admin/VendasTab";
import RelatoriosTab from "../Components/admin/RelatoriosTab";

export default function Admin() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("estoque");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  document.title = "M&M - Admin";
  useEffect(() => {
    // Verificar se o usuário está logado (simulação)
    const checkLogin = async () => {
      setIsLoggedIn(true);
    };
    
    checkLogin();
  }, []);

  const fazerLogout = () => {
    navigate(createPageUrl("Inicio"));
  };

  // Se não estiver logado, redirecionar para o login
  if (!isLoggedIn) {
    navigate(createPageUrl("AdminLogin"));
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2 className="admin-logo">
              <span className="admin-logo-highlight">M&M</span>
              <span className="admin-logo-text">Admin</span>
            </h2>
          </div>
          
          <nav className="admin-nav">
            <ul className="admin-nav-list">
              <li className="admin-nav-item">
                <button 
                  onClick={() => setAbaAtiva("estoque")}
                  className={`admin-nav-button ${
                    abaAtiva === "estoque" ? "admin-nav-button-active" : ""
                  }`}
                >
                  <Package size={20} className="admin-nav-icon" />
                  Estoque
                </button>
              </li>
              <li className="admin-nav-item">
                <button 
                  onClick={() => setAbaAtiva("clientes")}
                  className={`admin-nav-button ${
                    abaAtiva === "clientes" ? "admin-nav-button-active" : ""
                  }`}
                >
                  <Users size={20} className="admin-nav-icon" />
                  Clientes
                </button>
              </li>
              <li className="admin-nav-item">
                <button 
                  onClick={() => setAbaAtiva("vendas")}
                  className={`admin-nav-button ${
                    abaAtiva === "vendas" ? "admin-nav-button-active" : ""
                  }`}
                >
                  <ShoppingCart size={20} className="admin-nav-icon" />
                  Vendas
                </button>
              </li>
              <li className="admin-nav-item">
                <button 
                  onClick={() => setAbaAtiva("relatorios")}
                  className={`admin-nav-button ${
                    abaAtiva === "relatorios" ? "admin-nav-button-active" : ""
                  }`}
                >
                  <BarChart2 size={20} className="admin-nav-icon" />
                  Relatórios
                </button>
              </li>
            </ul>
            
            <div className="admin-sidebar-footer">
              <Link to={createPageUrl("Inicio")} className="admin-back-button">
                <ArrowLeft size={20} className="admin-nav-icon" />
                Voltar à Loja
              </Link>
              <button 
                onClick={fazerLogout}
                className="admin-logout-button"
              >
                <LogOut size={20} className="admin-nav-icon" />
                Sair
              </button>
            </div>
          </nav>
        </div>
        
        {/* Conteúdo principal */}
        <div className="admin-content">
          <header className="admin-header">
            <div className="admin-header-container">
              <h1 className="admin-page-title">
                {abaAtiva === "estoque" && "Gerenciamento de Estoque"}
                {abaAtiva === "clientes" && "Gerenciamento de Clientes"}
                {abaAtiva === "vendas" && "Gerenciamento de Vendas"}
                {abaAtiva === "relatorios" && "Relatórios"}
              </h1>
              
              <div className="admin-user-info">
                <span className="admin-user-text">Admin</span>
              </div>
            </div>
          </header>
          
          <main className="admin-main">
            {abaAtiva === "estoque" && <EstoqueTab />}
            {abaAtiva === "clientes" && <ClientesTab />}
            {abaAtiva === "vendas" && <VendasTab />}
            {abaAtiva === "relatorios" && <RelatoriosTab />}
          </main>
        </div>
      </div>
    </div>
  );
}