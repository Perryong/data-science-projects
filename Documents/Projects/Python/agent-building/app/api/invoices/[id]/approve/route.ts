import { NextRequest, NextResponse } from 'next/server';
import { approveDocument, InvoiceNotFoundError, InvalidStatusTransitionError } from '@/services/invoiceService';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await approveDocument(parseInt(params.id, 10));
    return NextResponse.json({ id: doc.id, status: doc.status, approvedAt: doc.approvedAt });
  } catch (e) {
    if (e instanceof InvoiceNotFoundError) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    if (e instanceof InvalidStatusTransitionError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to approve document' }, { status: 500 });
  }
}
