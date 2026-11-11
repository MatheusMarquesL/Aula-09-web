-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "clienteEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notificacaoStatus" TEXT NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
