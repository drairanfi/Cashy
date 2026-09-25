import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('demo1234', 10);

  await prisma.usuario.upsert({
    where: { email: 'demo@cashy.app' },
    update: {},
    create: {
      email: 'demo@cashy.app',
      password,
      nombre: 'Usuario Demo',
    },
  });

  console.log('Seed OK: demo@cashy.app / demo1234 (sin datos precargados)');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());