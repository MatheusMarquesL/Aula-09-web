
import { Router } from "express";
import { produtos, buscarProduto } from "./produtos";

const router = Router();

router.get("/produtos", (_req, res) => {
  res.status(200).json(produtos);
});

router.get("/produtos/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensagem: "ID inválido"
    });
  }

  const produto = buscarProduto(id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado"
    });
  }

  return res.status(200).json(produto);
});

router.post("/produtos", (req, res) => {
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

  const novoProduto = {
    id: Math.max(0, ...produtos.map((produto) => produto.id)) + 1,
    nome: nome.trim(),
    preco,
    estoque
  };

  produtos.push(novoProduto);

  return res.status(201).json(novoProduto);
});



router.post("/produtos/:id/reservas", (req, res) => {
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

  const produto = buscarProduto(id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado"
    });
  }

  
  if (produto.estoque < quantidade) {
    return res.status(409).json({
      mensagem: "Estoque insuficiente",
      codigo: "ESTOQUE_INSUFICIENTE"
    });
  }


  produto.estoque -= quantidade;

  return res.status(200).json({
    reservado: quantidade,
    estoqueRestante: produto.estoque,
    produto: {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco
    }
  });
});


export default router;
