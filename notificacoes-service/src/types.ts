export interface Notificacao {
  id: number;
  pedidoId: number;
  destino: string;
  mensagem: string;
  status: string;
  correlationId: string;
}