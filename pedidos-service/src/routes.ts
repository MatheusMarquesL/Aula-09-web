import { Router } from "express";
import { randomUUID } from "node:crypto";

import {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarNotificacao
} from "./pedidos";

import { ReservaResposta } from "./types";

const router = Router();

const CATALOG_URL = process.env.CATALOG_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_URL;

if (!CATALOG_URL || !NOTIFICATION_URL) {
  throw new Error("CATALOG_URL e NOTIFICATION_URL devem ser configuradas");
}

async function chamarServico(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

// Criar pedido
router.post("/pedidos", async (req, res) => {
  const correlationId = req.get("x-correlation-id") || randomUUID();

  res.setHeader("x-correlation-id", correlationId);

  res.on("finish", () => {
    console.log(
      `[${correlationId}] pedidos resultado status=${res.statusCode}`
    );
  });

  const { produtoId, quantidade, clienteEmail } = req.body;

  console.log(`[${correlationId}] pedidos POST /pedidos`);

  if (
    !Number.isInteger(produtoId) ||
    produtoId <= 0 ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0 ||
    typeof clienteEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail)
  ) {
    return res.status(400).json({
      mensagem: "Dados do pedido são inválidos",
      codigo: "PEDIDO_INVALIDO"
    });
  }

  let respostaReserva: Response;

  try {
    respostaReserva = await chamarServico(
      `${CATALOG_URL}/produtos/${produtoId}/reservas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": correlationId
        },
        body: JSON.stringify({ quantidade })
      }
    );
  } catch (erro) {
    if (erro instanceof Error && erro.name === "AbortError") {
      return res.status(504).json({
        mensagem: "Catálogo demorou para responder",
        codigo: "CATALOGO_TIMEOUT"
      });
    }

    return res.status(502).json({
      mensagem: "Catálogo indisponível",
      codigo: "CATALOGO_INDISPONIVEL"
    });
  }

  console.log(
    `[${correlationId}] catalogo POST reserva status=${respostaReserva.status}`
  );

  if (!respostaReserva.ok) {
    const status = respostaReserva.status;

    if (status === 400 || status === 404 || status === 409) {
      const dados = await respostaReserva.json();
      return res.status(status).json(dados);
    }

    return res.status(502).json({
      mensagem: "Catálogo indisponível",
      codigo: "CATALOGO_INDISPONIVEL"
    });
  }

  const reserva = (await respostaReserva.json()) as ReservaResposta;

  let pedido;

  try {
    pedido = await criarPedido({
      produtoId,
      quantidade,
      total: reserva.produto.preco * quantidade,
      clienteEmail,
      status: "confirmado",
      notificacaoStatus: "pendente"
    });
  } catch (erro) {
    console.error("Erro ao salvar pedido:", erro);

    return res.status(500).json({
      mensagem: "Erro ao salvar pedido",
      codigo: "ERRO_AO_SALVAR_PEDIDO"
    });
  }

  // Enviar notificação
  try {
    const respostaNotificacao = await chamarServico(
      `${NOTIFICATION_URL}/notificacoes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": correlationId
        },
        body: JSON.stringify({
          pedidoId: pedido.id,
          destino: clienteEmail,
          mensagem: `Pedido ${pedido.id} confirmado`
        })
      }
    );

    console.log(
      `[${correlationId}] notificacoes POST /notificacoes status=${respostaNotificacao.status}`
    );

    if (respostaNotificacao.ok) {
      pedido = await atualizarNotificacao(pedido.id, "enviada");
    }
  } catch (erro) {
    console.log(
      `[${correlationId}] notificacoes indisponível ou falha ao atualizar status`
    );
  }

  return res.status(201).json(pedido);
});

// Listar pedidos
router.get("/pedidos", async (_req, res) => {
  try {
    const pedidos = await listarPedidos();

    return res.status(200).json(pedidos);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao listar pedidos"
    });
  }
});

// Buscar pedido por ID
router.get("/pedidos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensagem: "ID inválido"
    });
  }

  try {
    const pedido = await buscarPedido(id);

    if (!pedido) {
      return res.status(404).json({
        mensagem: "Pedido não encontrado"
      });
    }

    return res.status(200).json(pedido);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao buscar pedido"
    });
  }
});

export default router;