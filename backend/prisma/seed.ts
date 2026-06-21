import 'dotenv/config';
import { UserRoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { seedRecetteData } from './recette-seed';

const prisma = createPrismaClient();

const ROLES: UserRoleName[] = [
  'DIRECTION',
  'ASSISTANTE_ADMINISTRATIVE',
  'CONDUCTEUR_TRAVAUX',
  'CHEF_CHANTIER',
];

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: roleName },
    });
  }

  const roles = await prisma.role.findMany();
  const roleByName = new Map(roles.map((r) => [r.name, r.id]));

  await seedRecetteData(prisma, passwordHash, roleByName);

  console.log('Seed terminé.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
