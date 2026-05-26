import { NextRequest, NextResponse } from 'next/server';
import { listDocuments } from '@/services/invoiceService';
import { SupplierCode } from '@prisma/client';

export async function GET(request: NextRequest) {
  const supplier = request.nextUrl.searchParams.get('supplier') as SupplierCode | null;
  try {
    const documents = await listDocuments({ supplierCode: supplier ?? undefined });
    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
