-- CreateTable
CREATE TABLE "Deuda" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "montoTotal" DECIMAL(12,2) NOT NULL,
    "cantidadCuotas" INTEGER NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "primeraFecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" TEXT NOT NULL,
    "deudaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deuda_usuarioId_idx" ON "Deuda"("usuarioId");

-- CreateIndex
CREATE INDEX "Cuota_deudaId_idx" ON "Cuota"("deudaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cuota_deudaId_numero_key" ON "Cuota"("deudaId", "numero");

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
