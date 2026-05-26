import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.supplier.upsert({
    where: { code: 'POLYTAINER' },
    update: {},
    create: { name: 'Polytainer Industries Sdn Bhd', code: 'POLYTAINER' },
  });
  await prisma.supplier.upsert({
    where: { code: 'SSS' },
    update: {},
    create: { name: 'San Soon Seng Food Industries Sdn Bhd', code: 'SSS' },
  });
  await prisma.supplier.upsert({
    where: { code: 'DDW' },
    update: {},
    create: { name: 'DDW Colours Sdn Bhd', code: 'DDW' },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
