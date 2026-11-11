import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function criarPedido(dados: {
  produtoId: number;
  quantidade: number;
  total: number;
  clienteEmail: string;
  status: string;
  notificacaoStatus: string;
}) {
  return prisma.pedido.create({
    data: dados
  });
}

export async function listarPedidos() {
  return prisma.pedido.findMany({
    orderBy: {
      id: "asc"
    }
  });
}

export async function buscarPedido(id: number) {
  return prisma.pedido.findUnique({
    where: { id }
  });
}

export async function atualizarNotificacao(
  id: number,
  notificacaoStatus: string
) {
  return prisma.pedido.update({
    where: { id },
    data: { notificacaoStatus }
  });
}