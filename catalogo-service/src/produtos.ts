import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listarProdutos() {
  return prisma.produto.findMany();
}

export async function buscarProduto(id: number) {
  return prisma.produto.findUnique({
    where: { id }
  });
}

export async function criarProduto(
  nome: string,
  preco: number,
  estoque: number
) {
  return prisma.produto.create({
    data: {
      nome,
      preco,
      estoque
    }
  });
}

export async function reservarProduto(
  id: number,
  quantidade: number
) {
  const resultado = await prisma.produto.updateMany({
    where: {
      id,
      estoque: {
        gte: quantidade
      }
    },
    data: {
      estoque: {
        decrement: quantidade
      }
    }
  });

  if (resultado.count === 0) {
    const produto = await buscarProduto(id);

    if (!produto) {
      return { tipo: "nao_encontrado" as const };
    }

    return { tipo: "estoque_insuficiente" as const };
  }

  const produto = await buscarProduto(id);

  return {
    tipo: "sucesso" as const,
    reservado: quantidade,
    estoqueRestante: produto!.estoque,
    produto: {
      id: produto!.id,
      nome: produto!.nome,
      preco: produto!.preco
    }
  };
}