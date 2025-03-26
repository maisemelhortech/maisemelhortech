import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/createPageUrl";
import { Lock, Mail, ArrowRight } from "lucide-react";
import "../Styles/AdminLogin.css"; 
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  document.title = "Mais & Melhor - AdminLogin";

  const fazerLogin = async (e) => {
    e.preventDefault();
    
    setErro(null);
    setCarregando(true);
    
    try {
      // Simular verificação
      if (email === "admin@maismelhor.com" && senha === "admin123") {
        // Login bem-sucedido
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        navigate(createPageUrl("Admin"));
      } else {
        setErro("Email ou senha incorretos");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Área Administrativa</h1>
          <p className="admin-subtitle">
            Entre com suas credenciais para acessar o painel administrativo
          </p>
        </div>
        
        <form className="admin-form" onSubmit={fazerLogin}>
          {erro && (
            <div className="form-error">
              {erro}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@maismelhor.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="form-label">
              Senha
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            <div className="forgot-password">
              <a href="#">Esqueceu a senha?</a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={carregando}
              className="submit-button"
            >
              {carregando ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} className="button-icon" />
                </>
              )}
            </button>
          </div>
          
          <div className="demo-credentials">
            <p style={{color: "#374151"}}>Para fins de demonstração:</p>
            <p style={{color: "#374151"}}>Email: admin@maismelhor.com</p>
            <p style={{color: "#374151"}}>Senha: admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}