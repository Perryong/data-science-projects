import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, InvoiceNotFoundError } from '@/services/invoiceService';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const document = await getDocumentById(parseInt(params.id, 10));
    return NextResponse.json({ document });
  } catch (e) {
    if (e instanceof InvoiceNotFoundError) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
