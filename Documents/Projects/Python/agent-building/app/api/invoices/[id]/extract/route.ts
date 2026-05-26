import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import { prisma } from '@/lib/prisma';
import { extractionQueue } from '@/workers/queue';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  const id = parseInt(params.id, 10);
  const doc = await prisma.invoiceDocument.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  await prisma.invoiceDocument.update({ where: { id }, data: { status: 'PENDING', extractionError: null } });
  const job = await extractionQueue.add('extract', { documentId: id });
  return NextResponse.json({ jobId: job.id, status: 'PENDING' }, { status: 202 });
}
