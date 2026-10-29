
import express from "express";
import router from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Pedidos rodando na porta ${PORT}`);
});
