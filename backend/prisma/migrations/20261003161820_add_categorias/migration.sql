-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Categoria_usuarioId_idx" ON "Categoria"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_usuarioId_nombre_key" ON "Categoria"("usuarioId", "nombre");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
