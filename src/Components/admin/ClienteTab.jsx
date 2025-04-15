import React, { useState, useEffect } from "react";
import { Cliente } from "../../Entities/Cliente";
import { PlusCircle, Trash2, Edit, Search, Save, X } from "lucide-react";
import "../../Styles/ClienteTab.css";

export default function ClientesTab() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteExclusao, setClienteExclusao] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    data_cadastro: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const clientesLocalStorage = localStorage.getItem('clientes');
      
      if (clientesLocalStorage) {
        setClientes(JSON.parse(clientesLocalStorage));
      } else {
        const dadosClientes = await Cliente.list();
        setClientes(dadosClientes);
        localStorage.setItem('clientes', JSON.stringify(dadosClientes));
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setCarregando(false);
    }
  };

  const salvarNoLocalStorage = (novosClientes) => {
    localStorage.setItem('clientes', JSON.stringify(novosClientes));
    setClientes(novosClientes);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      const cpfRaw = value.replace(/\D/g, '');
      
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
      
      setFormData((prev) => ({
        ...prev,
        [name]: formattedCpf
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setClienteEditando(cliente);
      setFormData({
        nome: cliente.nome || "",
        cpf: cliente.cpf || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        endereco: cliente.endereco || "",
        data_cadastro: cliente.data_cadastro || new Date().toISOString().split("T")[0]
      });
    } else {
      setClienteEditando(null);
      setFormData({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        endereco: "",
        data_cadastro: new Date().toISOString().split("T")[0]
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClienteEditando(null);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();

    try {
      let novosClientes = [...clientes];
      
      if (clienteEditando) {
        // Atualizando cliente existente
        await Cliente.update(clienteEditando.id, formData);
        
        // Atualiza no array local também
        const index = novosClientes.findIndex(c => c.id === clienteEditando.id);
        if (index !== -1) {
          novosClientes[index] = { 
            ...clienteEditando, 
            ...formData 
          };
        }
      } else {
        const novoCliente = await Cliente.create(formData);
        
        // Se a API não retornar um ID, geramos um temporário
        const clienteCompleto = novoCliente || {
          ...formData,
          id: Date.now().toString() // Gera um ID único baseado no timestamp
        };
        
        novosClientes.push(clienteCompleto);
      }
      
      // Salva no localStorage
      salvarNoLocalStorage(novosClientes);
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const abrirModalExclusao = (cliente) => {
    setClienteExclusao(cliente);
  };

  const fecharModalExclusao = () => {
    setClienteExclusao(null);
  };

  const excluirCliente = async () => {
    if (!clienteExclusao) return;
    try {
      await Cliente.delete(clienteExclusao.id);
      
      // Remove do array local e salva no localStorage
      const novosClientes = clientes.filter(cliente => cliente.id !== clienteExclusao.id);
      salvarNoLocalStorage(novosClientes);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    } finally {
      fecharModalExclusao();
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpf?.includes(filtro) ||
    cliente.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <div className="search-container">
          <Search className="search-icon" size={18} style={{marginLeft: '5px'}} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          onClick={() => abrirModal()}
          className="new-client-button"
        >
          <PlusCircle size={18} />
          Novo Cliente
        </button>
      </div>

      {clienteExclusao && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">
              Confirmar Exclusão
            </h3>
            <p className="modal-content">
              Tem certeza que deseja excluir o cliente <strong>{clienteExclusao.nome}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={fecharModalExclusao}
                className="button-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={excluirCliente}
                className="button-delete"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">
              {clienteEditando ? "Editar Cliente" : "Novo Cliente"}
            </h3>
            <form onSubmit={salvarCliente}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="form-input"
                  maxLength="14"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-button-container">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="button-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="save-button"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      {carregando ? (
        <div className="loading">Carregando clientes...</div>
      ) : (
        <div className="clientes-table-container">
          <table className="clientes-table">
            <thead className="table-header">
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="table-data-name">{cliente.nome}</td>
                  <td className="table-data-secondiu88iiary">{cliente.cpf}</td>
                  <td className="table-data-secondary">{cliente.email}</td>
                  <td className="table-data-secondary">{cliente.telefone}</td>
                  <td className="table-data-secondary">{cliente.data_cadastro}</td>
                  <td className="table-actions">
                    <button onClick={() => abrirModal(cliente)} className="edit-button">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => abrirModalExclusao(cliente)} className="delete-button">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}