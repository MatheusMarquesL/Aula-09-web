import { Router } from "express";

import {
  listarProdutos,
  buscarProduto,
  criarProduto,
  reservarProduto
} from "./produtos";

const router = Router();

router.get("/produtos", async (_req, res) => {
  try {
    const produtos = await listarProdutos();

    return res.status(200).json(produtos);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao listar produtos"
    });
  }
});

router.get("/produtos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensagem: "ID inválido"
    });
  }

  try {
    const produto = await buscarProduto(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado"
      });
    }

    return res.status(200).json(produto);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao buscar produto"
    });
  }
});

router.post("/produtos", async (req, res) => {
  const { nome, preco, estoque } = req.body;

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof preco !== "number" ||
    !Number.isFinite(preco) ||
    preco <= 0 ||
    typeof estoque !== "number" ||
    !Number.isInteger(estoque) ||
    estoque < 0
  ) {
    return res.status(400).json({
      mensagem: "Dados do produto são inválidos"
    });
  }

  try {
    const novoProduto = await criarProduto(
      nome.trim(),
      preco,
      estoque
    );

    return res.status(201).json(novoProduto);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar produto"
    });
  }
});

router.post("/produtos/:id/reservas", async (req, res) => {
  const id = Number(req.params.id);
  const { quantidade } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0
  ) {
    return res.status(400).json({
      mensagem: "Dados da reserva são inválidos"
    });
  }

  try {
    const resultado = await reservarProduto(id, quantidade);

    if (resultado.tipo === "nao_encontrado") {
      return res.status(404).json({
        mensagem: "Produto não encontrado"
      });
    }

    if (resultado.tipo === "estoque_insuficiente") {
      return res.status(409).json({
        mensagem: "Estoque insuficiente",
        codigo: "ESTOQUE_INSUFICIENTE"
      });
    }

    return res.status(200).json({
      reservado: resultado.reservado,
      estoqueRestante: resultado.estoqueRestante,
      produto: resultado.produto
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao reservar estoque"
    });
  }
});

export default router;