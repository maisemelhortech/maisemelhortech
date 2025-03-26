// Produto.js
const produtos = [ 
  { 
    id: "1", 
    nome: "Leite Integral", 
    categoria: "Bebidas", 
    preco: 4.99, 
    quantidade: 30, 
    codigo: "BEB001", 
    descricao: "Leite integral de alta qualidade", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557124/z3dcj32nyhooxksldyjr.avif" 
  }, 
  { 
    id: "2", 
    nome: "Maçã Gala", 
    categoria: "Hortifruti", 
    preco: 2.49, 
    quantidade: 50, 
    codigo: "HOR001", 
    descricao: "Maçãs frescas direto do produtor", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557121/avkq7njllvf2omvj9inr.avif" 
  }, 
  { 
    id: "3", 
    nome: "Filé de Salmão", 
    categoria: "Peixaria", 
    preco: 39.90, 
    quantidade: 15, 
    codigo: "PEI001", 
    descricao: "Filé de salmão fresco e saboroso", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557115/rygldfqtzoyuksey7fmk.avif" 
  }, 
  { 
    id: "4", 
    nome: "Carvão Vegetal", 
    categoria: "Churrasco", 
    preco: 12.99, 
    quantidade: 25, 
    codigo: "CHU001", 
    descricao: "Carvão de alta qualidade para seu churrasco", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557116/xh3mjmtjqwtlrojhugcq.avif" 
  }, 
  { 
    id: "5", 
    nome: "Brigadeiro", 
    categoria: "Doces", 
    preco: 3.50, 
    quantidade: 100, 
    codigo: "DOC001", 
    descricao: "Brigadeiro caseiro delicioso", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557123/gvwju1fbt9ngtnhxxrit.avif" 
  }, 
  { 
    id: "6", 
    nome: "Shampoo Revitalizante", 
    categoria: "Beleza", 
    preco: 19.99, 
    quantidade: 20, 
    codigo: "BEL001", 
    descricao: "Shampoo para todos os tipos de cabelo", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557118/y8bdyduxl7ezfqn2up1r.avif" 
  }, 
  { 
    id: "7", 
    nome: "Ração para Cães", 
    categoria: "Pet Shop", 
    preco: 29.90, 
    quantidade: 18, 
    codigo: "PTS001", 
    descricao: "Ração completa para cães adultos", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557122/h2ysallkgtdkplcphzte.avif" 
  }, 
  { 
    id: "8", 
    nome: "Detergente Líquido", 
    categoria: "Produtos de Limpeza", 
    preco: 5.49, 
    quantidade: 40, 
    codigo: "PDL001", 
    descricao: "Detergente para limpeza geral", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557121/qmtrzkgqtbyoxdt6ymgg.avif"
  },
  { 
    id: "9", 
    nome: "Pasta de Dente", 
    categoria: "Higiene", 
    preco: 7.99, 
    quantidade: 60, 
    codigo: "HIG001", 
    descricao: "Pasta de dente para higiene bucal Supreme", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557120/s0wqyegmacxuexw4dfgc.avif" 
  }, 
  { 
    id: "10", 
    nome: "Arroz Branco", 
    categoria: "Todos", 
    preco: 6.99, 
    quantidade: 80, 
    codigo: "TOD001", 
    descricao: "Arroz branco tipo 1", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557123/ckpntndzloo7tf29koai.avif" 
  }, 
  { 
    id: "11", 
    nome: "Cerveja Pilsen", 
    categoria: "Bebidas", 
    preco: 3.99, 
    quantidade: 120, 
    codigo: "BEB002", 
    descricao: "Cerveja Pilsen gelada", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557117/u454srxrb9jff5vuuvuj.avif" 
  }, 
  { 
    id: "12", 
    nome: "Banana Prata", 
    categoria: "Hortifruti", 
    preco: 1.99, 
    quantidade: 70, 
    codigo: "HOR002", 
    descricao: "Bananas frescas e saborosas", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557119/ctwz7btdkmteup4q9two.avif" 
  }, 
  { 
    id: "13", 
    nome: "Camarão Rosa", 
    categoria: "Peixaria", 
    preco: 49.90, 
    quantidade: 10, 
    codigo: "PEI002", 
    descricao: "Camarão rosa fresco", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557117/l1hksjvtqhsfslwekqhm.avif" 
  }, 
  { 
    id: "14", 
    nome: "Linguiça Toscana", 
    categoria: "Churrasco", 
    preco: 14.99, 
    quantidade: 30, 
    codigo: "CHU002", 
    descricao: "Linguiça toscana para churrasco", 
    imagem_url: "https://res.cloudinary.com/dqmefjtuz/image/upload/v1742557119/py2pnqrnyebfrudsdyir.avif"
  }
];

// Função para sincronizar o localStorage com os dados atuais
const sincronizarLocalStorage = () => {
  localStorage.setItem('produtos', JSON.stringify(produtos));
};

// Verificar se há dados no localStorage ao carregar o módulo
const inicializarDados = () => {
  const produtosLocalStorage = localStorage.getItem('produtos');
  if (produtosLocalStorage) {
    // Limpar o array atual
    produtos.splice(0, produtos.length);
    // Adicionar os itens do localStorage
    JSON.parse(produtosLocalStorage).forEach(produto => produtos.push(produto));
  } else {
    // Se não existir no localStorage, salva o array inicial
    sincronizarLocalStorage();
  }
};

// Inicializar dados ao carregar o módulo
inicializarDados();

export const Produto = {
  list: async () => {
    return [...produtos];
  },
  
  create: async (produto) => {
    const novoProduto = {
      ...produto,
      id: Date.now().toString(),
    };
    produtos.push(novoProduto);
    sincronizarLocalStorage();
    return novoProduto;
  },
  
  update: async (id, dadosAtualizados) => {
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
      produtos[index] = { ...produtos[index], ...dadosAtualizados };
      sincronizarLocalStorage();
      return produtos[index];
    }
    throw new Error("Produto não encontrado");
  },
  
  delete: async (id) => {
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
      const produtoRemovido = produtos.splice(index, 1)[0];
      sincronizarLocalStorage();
      return produtoRemovido;
    }
    throw new Error("Produto não encontrado");
  }
};