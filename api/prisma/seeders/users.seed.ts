import * as bcrypt from 'bcrypt';
import type { SeedPrisma } from '../lib/prisma-client';

const USER_COUNT = 1000;
const BATCH_SIZE = 100;
const SEED_PASSWORD = 'password';

export async function seedUsers(prisma: SeedPrisma) {
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  console.log(`[users] Seeding ${USER_COUNT} users (password: "${SEED_PASSWORD}")...`);

  let created = 0;

  for (let offset = 0; offset < USER_COUNT; offset += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, USER_COUNT - offset) },
      (_, index) => {
        const n = offset + index + 1;
        return {
          email: `user${n}@example.com`,
          name: `User ${n}`,
          password: hashedPassword,
        };
      },
    );

    const result = await prisma.user.createMany({
      data: batch,
      skipDuplicates: true,
    });

    created += result.count;
  }

  console.log(
    `[users] Done. ${created} created (${USER_COUNT - created} skipped as duplicates).`,
  );
}
