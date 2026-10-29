import { Router } from "express";
import { notificacoes, proximoId } from "./notificacoes";

const router = Router();

router.post("/notificacoes", (req, res) => {
  const correlationId =
    req.get("x-correlation-id") || "sem-correlation-id";

  res.setHeader("x-correlation-id", correlationId);

  const { pedidoId, destino, mensagem } = req.body;

  if (
    !Number.isInteger(pedidoId) ||
    pedidoId <= 0 ||
    typeof destino !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino) ||
    typeof mensagem !== "string" ||
    mensagem.trim() === ""
  ) {
    return res.status(400).json({
      mensagem: "Dados da notificação são inválidos",
      codigo: "NOTIFICACAO_INVALIDA"
    });
  }

  const notificacao = {
    id: proximoId(),
    pedidoId,
    destino,
    mensagem: mensagem.trim(),
    status: "registrada",
    correlationId
  };

  notificacoes.push(notificacao);

  console.log(
    `[${correlationId}] notificacoes POST /notificacoes status=201`
  );

  return res.status(201).json(notificacao);
});

router.get("/notificacoes", (_req, res) => {
  return res.status(200).json(notificacoes);
});

export default router;