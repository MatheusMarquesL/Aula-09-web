
export interface Pedido {
  id: number;
  produtoId: number;
  quantidade: number;
  total: number;
  clienteEmail: string;
  status: string;
  notificacaoStatus: string;
}

export interface ReservaResposta {
  reservado: number;
  estoqueRestante: number;
  produto: {
    id: number;
    nome: string;
    preco: number;
  };
}
