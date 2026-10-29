
import { Pedido } from "./types";

export const pedidos: Pedido[] = [];

export function buscarPedido(id: number): Pedido | undefined {
  return pedidos.find((pedido) => pedido.id === id);
}

export function proximoId(): number {
  return Math.max(0, ...pedidos.map((pedido) => pedido.id)) + 1;
}
