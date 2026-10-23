-- Usuarios que ya tienen metas de ahorro las mantienen activas
INSERT INTO "ModuloUsuario" ("id", "usuarioId", "clave", "activo", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'metas', true, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Meta" m WHERE m."usuarioId" = u."id")
ON CONFLICT ("usuarioId", "clave") DO NOTHING;
