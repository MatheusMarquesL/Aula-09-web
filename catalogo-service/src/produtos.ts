
import { Produto } from "./types";

export const produtos: Produto[] = [
  {
    id: 1,
    nome: "Teclado",
    preco: 150,
    estoque: 8
  },
  {
    id: 2,
    nome: "Mouse",
    preco: 80,
    estoque: 10
  },
  {
    id: 3,
    nome: "Monitor",
    preco: 200,
    estoque: 5
  }
];

export function buscarProduto(id: number): Produto | undefined {
  return produtos.find((produto) => produto.id === id);
}
