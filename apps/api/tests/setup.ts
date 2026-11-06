import { execSync } from 'node:child_process';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/db';

beforeAll(() => {
  try {
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test.db',
      },
      stdio: 'ignore',
    });
  } catch (err) {
    console.error('Falha ao rodar migrate deploy para test.db:', err);
  }
});

beforeEach(async () => {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.vocabItem.deleteMany({});
  await prisma.errorRecord.deleteMany({});
  await prisma.pronunciationTest.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.moduleProgress.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.streak.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});
