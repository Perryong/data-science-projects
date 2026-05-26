import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractionQueue } from '@/workers/queue';
import { z } from 'zod';
import { SupplierCode, DocumentType } from '@prisma/client';

const schema = z.object({
  supplierCode: z.enum(['POLYTAINER', 'SSS', 'DDW']),
  documentType: z.enum(['INVOICE', 'PACK_SLIP', 'COA', 'DELIVERY_DOCKET']),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'supplierCode and documentType are required' }, { status: 400 });
  }

  const id = parseInt(params.id, 10);
  const doc = await prisma.invoiceDocument.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const supplier = await prisma.supplier.findUnique({
    where: { code: parsed.data.supplierCode as SupplierCode },
  });
  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }

  await prisma.invoiceDocument.update({
    where: { id },
    data: {
      supplierId: supplier.id,
      documentType: parsed.data.documentType as DocumentType,
      status: 'PENDING',
      extractionError: null,
    },
  });

  await extractionQueue.add('extract', { documentId: id });

  return NextResponse.json({ status: 'PENDING' }, { status: 200 });
}
