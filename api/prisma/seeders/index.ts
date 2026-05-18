import type { SeedPrisma } from '../lib/prisma-client';
import { seedUsers } from './users.seed';

export type Seeder = (prisma: SeedPrisma) => Promise<void>;

export const seeders: Seeder[] = [seedUsers];

export async function runSeeders(prisma: SeedPrisma) {
  for (const seeder of seeders) {
    await seeder(prisma);
  }
}
