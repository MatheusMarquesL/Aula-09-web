
import express from "express";
import router from "./routes";

const app = express();
const PORT = 3001;

app.use(express.json());

app.use((req, res, next) => {
  const correlationId =
    req.get("x-correlation-id") || "sem-correlation-id";

  res.on("finish", () => {
    console.log(
      `[${correlationId}] catalogo ${req.method} ${req.originalUrl} status=${res.statusCode}`
    );
  });

  next();
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Catálogo/Estoque rodando na porta ${PORT}`);
});
