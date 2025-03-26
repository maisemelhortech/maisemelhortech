import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils/createPageUrl";
import logo from './Assets/logoRosa.svg'
import './Styles/Layout.css'

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="layout-container">
      {/* Barra de navegação principal */}
      <header className="main-header">
        <div className="container">
          <div className="flex">
            {/* Logo - mantendo a imagem */}
            <span className="logo-container">
              <img alt="Logo" src={logo}/>
            </span>
            {/* Menu para desktop */}
            <nav className="nav-menu hidden md:flex">
              <Link to={createPageUrl("Inicio")} className="nav-link">
                Início
              </Link>
              <Link to={createPageUrl("Carrinho")} className="nav-link">
                Carrinho
              </Link>
              {currentPageName !== "AdminLogin" && currentPageName !== "Admin" && (
                <Link to={createPageUrl("AdminLogin")} className="nav-link">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>


      {/* Conteúdo principal */}
      <main className="flex-grow">
        {children}
      </main>
      



      {/* Rodapé */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Mais & Melhor</h3>
              <p>Mais variedade, melhor qualidade!</p>
            </div>
            <div className="footer-section">
              <h3>Contato</h3>
              <p>Email: contato@maismelhor.com</p>
              <p>Telefone: (11) 1234-5678</p>
            </div>
            <div className="footer-section">
              <h3>Horário</h3>
              <p>Segunda a Sábado: 8h às 22h</p>
              <p>Domingo: 8h às 20h</p>
            </div>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} Mais & Melhor. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}