-- CreateTable
CREATE TABLE "RegistroModuloPersonalizado" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "cuentaId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroModuloPersonalizado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroModuloPersonalizado_moduloId_idx" ON "RegistroModuloPersonalizado"("moduloId");

-- CreateIndex
CREATE INDEX "RegistroModuloPersonalizado_usuarioId_idx" ON "RegistroModuloPersonalizado"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroModuloPersonalizado_cuentaId_idx" ON "RegistroModuloPersonalizado"("cuentaId");

-- AddForeignKey
ALTER TABLE "RegistroModuloPersonalizado" ADD CONSTRAINT "RegistroModuloPersonalizado_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "ModuloPersonalizado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
