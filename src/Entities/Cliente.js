// Cliente.js
const clientes = [
  {
    id: "1",
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@exemplo.com",
    telefone: "(11) 99999-8888",
    endereco: "Rua das Flores, 123",
    data_cadastro: "2023-01-15"
  },
  {
    id: "2",
    nome: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria@exemplo.com",
    telefone: "(11) 98888-7777",
    endereco: "Av. Principal, 456",
    data_cadastro: "2023-02-20"
  },
  {
    id: "3",
    nome: "Pedro Oliveira",
    cpf: "456.789.123-00",
    email: "pedro@exemplo.com",
    telefone: "(11) 97777-6666",
    endereco: "Rua das Estrelas, 789",
    data_cadastro: "2023-03-10"
  },
  {
    id: "4",
    nome: "Ana Costa",
    cpf: "789.123.456-00",
    email: "ana@exemplo.com",
    telefone: "(11) 96666-5555",
    endereco: "Av. Central, 321",
    data_cadastro: "2023-04-05"
  }
];

// Função para sincronizar o localStorage com os dados atuais
const sincronizarLocalStorage = () => {
  localStorage.setItem('clientes', JSON.stringify(clientes));
};

// Verificar se há dados no localStorage ao carregar o módulo
const inicializarDados = () => {
  const clientesLocalStorage = localStorage.getItem('clientes');
  if (clientesLocalStorage) {
    // Limpar o array atual
    clientes.splice(0, clientes.length);
    // Adicionar os itens do localStorage
    JSON.parse(clientesLocalStorage).forEach(cliente => clientes.push(cliente));
  } else {
    // Se não existir no localStorage, salva o array inicial
    sincronizarLocalStorage();
  }
};

// Inicializar dados ao carregar o módulo
inicializarDados();

export const Cliente = {
  list: async () => {
    return [...clientes];
  },
  
  create: async (cliente) => {
    const novoCliente = {
      ...cliente,
      id: Date.now().toString(),
    };
    clientes.push(novoCliente);
    sincronizarLocalStorage();
    return novoCliente;
  },
  
  update: async (id, dadosAtualizados) => {
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      clientes[index] = { ...clientes[index], ...dadosAtualizados };
      sincronizarLocalStorage();
      return clientes[index];
    }
    throw new Error("Cliente não encontrado");
  },
  
  delete: async (id) => {
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      const clienteRemovido = clientes.splice(index, 1)[0];
      sincronizarLocalStorage();
      return clienteRemovido;
    }
    throw new Error("Cliente não encontrado");
  }
};