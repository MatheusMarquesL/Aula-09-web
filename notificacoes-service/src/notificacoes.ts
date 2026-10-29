import { Notificacao } from "./types";

export const notificacoes: Notificacao[] = [];

export function proximoId(): number {
  return Math.max(
    0,
    ...notificacoes.map((notificacao) => notificacao.id)
  ) + 1;
}