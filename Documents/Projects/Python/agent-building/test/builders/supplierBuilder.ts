import { prisma } from '@/lib/prisma';
import { SupplierCode } from '@prisma/client';

export async function buildSupplier(overrides: { name?: string; code?: SupplierCode } = {}) {
  return prisma.supplier.upsert({
    where: { code: overrides.code ?? 'POLYTAINER' },
    update: {},
    create: {
      name: overrides.name ?? 'Polytainer Industries Sdn Bhd',
      code: overrides.code ?? 'POLYTAINER',
    },
  });
}
