import express from "express";
import router from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 3002;

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Notificações rodando na porta ${PORT}`);
});