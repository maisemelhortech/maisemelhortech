const vendas = [
  {
    id: "1",
    cliente_id: "1",
    data: "2023-05-15T10:30:00Z",
    items: [
      {
        produto_id: "1",
        quantidade: 2,
        preco_unitario: 4.99
      },
      {
        produto_id: "2",
        quantidade: 5,
        preco_unitario: 2.49
      }
    ],
    total: 22.43,
    metodo_pagamento: "Cartão de Crédito",
    status: "Concluída",
    hash_compra: "AB12CD34EF56GH78IJ90"
  }
];

export const Venda = {
  list: async () => {
    return [...vendas];
  },
  
  create: async (venda) => {
    const novaVenda = {
      ...venda,
      id: Date.now().toString(),
    };
    vendas.push(novaVenda);
    return novaVenda;
  },
  
  update: async (id, dadosAtualizados) => {
    const index = vendas.findIndex(v => v.id === id);
    if (index !== -1) {
      vendas[index] = { ...vendas[index], ...dadosAtualizados };
      return vendas[index];
    }
    throw new Error("Venda não encontrada");
  },
  
  delete: async (id) => {
    const index = vendas.findIndex(v => v.id === id);
    if (index !== -1) {
      const vendaRemovida = vendas.splice(index, 1)[0];
      return vendaRemovida;
    }
    throw new Error("Venda não encontrada");
  }
};