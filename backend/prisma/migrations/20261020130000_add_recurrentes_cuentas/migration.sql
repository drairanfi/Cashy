-- CreateTable
CREATE TABLE "ReglaRecurrente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" TEXT,
    "frecuencia" TEXT NOT NULL,
    "intervalo" INTEGER NOT NULL DEFAULT 1,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReglaRecurrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocurrencia" (
    "id" TEXT NOT NULL,
    "reglaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ocurrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "saldoInicial" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "cuentaId" TEXT;

-- AlterTable
ALTER TABLE "Comida" ADD COLUMN     "cuentaId" TEXT;

-- AlterTable
ALTER TABLE "Gimnasio" ADD COLUMN     "cuentaId" TEXT;

-- CreateIndex
CREATE INDEX "ReglaRecurrente_usuarioId_idx" ON "ReglaRecurrente"("usuarioId");

-- CreateIndex
CREATE INDEX "Ocurrencia_reglaId_idx" ON "Ocurrencia"("reglaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ocurrencia_reglaId_fecha_key" ON "Ocurrencia"("reglaId", "fecha");

-- CreateIndex
CREATE INDEX "Cuenta_usuarioId_idx" ON "Cuenta"("usuarioId");

-- CreateIndex
CREATE INDEX "Gasto_cuentaId_idx" ON "Gasto"("cuentaId");

-- CreateIndex
CREATE INDEX "Comida_cuentaId_idx" ON "Comida"("cuentaId");

-- CreateIndex
CREATE INDEX "Gimnasio_cuentaId_idx" ON "Gimnasio"("cuentaId");

-- AddForeignKey
ALTER TABLE "ReglaRecurrente" ADD CONSTRAINT "ReglaRecurrente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocurrencia" ADD CONSTRAINT "Ocurrencia_reglaId_fkey" FOREIGN KEY ("reglaId") REFERENCES "ReglaRecurrente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
