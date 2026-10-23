-- Usuarios que ya tienen datos en estos módulos los mantienen activos
INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'gastos', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Gasto" g WHERE g."usuarioId" = u."id")
ON CONFLICT ("usuarioId", "clave") DO NOTHING;

INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'cuentas', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Cuenta" c WHERE c."usuarioId" = u."id")
ON CONFLICT ("usuarioId", "clave") DO NOTHING;

INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'deudas', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Deuda" d WHERE d."usuarioId" = u."id")
ON CONFLICT ("usuarioId", "clave") DO NOTHING;
