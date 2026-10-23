-- CreateTable
CREATE TABLE "ModuloUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuloUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuloUsuario_usuarioId_clave_key" ON "ModuloUsuario"("usuarioId", "clave");

-- CreateIndex
CREATE INDEX "ModuloUsuario_usuarioId_idx" ON "ModuloUsuario"("usuarioId");

-- AddForeignKey
ALTER TABLE "ModuloUsuario" ADD CONSTRAINT "ModuloUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Usuarios que ya tienen datos en un módulo lo mantienen activo
INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'comida', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Comida" c WHERE c."usuarioId" = u."id");

INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'gimnasio', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Gimnasio" g WHERE g."usuarioId" = u."id");

INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'ahorros', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Ahorro" a WHERE a."usuarioId" = u."id");

INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'recurrentes', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "ReglaRecurrente" r WHERE r."usuarioId" = u."id");
