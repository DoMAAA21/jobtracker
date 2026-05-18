import 'dotenv/config';
import { createSeedPrismaClient } from './lib/prisma-client';
import { runSeeders } from './seeders';

async function main() {
  const prisma = createSeedPrismaClient();

  try {
    console.log('Running database seeders...');
    await runSeeders(prisma);
    console.log('All seeders finished.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
