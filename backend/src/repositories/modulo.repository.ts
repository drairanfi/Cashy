import { prisma } from '../config/prisma.js';
import type { ModuloClave } from '../schemas/modulo.schema.js';

export const moduloRepository = {
  findByUsuario: (usuarioId: string) => prisma.moduloUsuario.findMany({ where: { usuarioId } }),

  findActivoClaves: async (usuarioId: string) => {
    const filas = await prisma.moduloUsuario.findMany({
      where: { usuarioId, activo: true },
      select: { clave: true },
    });
    return new Set(filas.map((fila) => fila.clave));
  },

  setActivo: (usuarioId: string, clave: ModuloClave, activo: boolean) =>
    prisma.moduloUsuario.upsert({
      where: { usuarioId_clave: { usuarioId, clave } },
      create: { usuarioId, clave, activo },
      update: { activo },
    }),

  removeDatosYDesactivar: (usuarioId: string, clave: ModuloClave) =>
    prisma.$transaction([
      borrarDatos(usuarioId, clave),
      prisma.moduloUsuario.upsert({
        where: { usuarioId_clave: { usuarioId, clave } },
        create: { usuarioId, clave, activo: false },
        update: { activo: false },
      }),
    ]),
};

function borrarDatos(usuarioId: string, clave: ModuloClave) {
  switch (clave) {
    case 'gastos':
      return prisma.gasto.deleteMany({ where: { usuarioId } });
    case 'comida':
      return prisma.comida.deleteMany({ where: { usuarioId } });
    case 'gimnasio':
      return prisma.gimnasio.deleteMany({ where: { usuarioId } });
    case 'ahorros':
      return prisma.ahorro.deleteMany({ where: { usuarioId } });
    case 'recurrentes':
      return prisma.reglaRecurrente.deleteMany({ where: { usuarioId } });
    case 'deudas':
      return prisma.deuda.deleteMany({ where: { usuarioId } });
    case 'metas':
      return prisma.meta.deleteMany({ where: { usuarioId } });
  }
}
