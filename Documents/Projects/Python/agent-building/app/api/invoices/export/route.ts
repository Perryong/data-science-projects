import { NextRequest, NextResponse } from 'next/server';
import { getApprovedDocuments } from '@/services/invoiceService';
import { serialiseToCsv, serialiseToJson, buildExportFilename, logExport } from '@/services/exportService';
import { SupplierCode, ExportFormat } from '@prisma/client';

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format')?.toUpperCase() as ExportFormat | null;
  const supplier = request.nextUrl.searchParams.get('supplier') as SupplierCode | null;
  if (!format || !['CSV', 'JSON'].includes(format)) {
    return NextResponse.json({ error: 'format must be csv or json' }, { status: 400 });
  }
  const documents = await getApprovedDocuments({ supplierCode: supplier ?? undefined });
  if (documents.length === 0) {
    return NextResponse.json({ error: 'No approved records match the selected filter' }, { status: 400 });
  }
  await logExport(format, documents.map(d => d.id));
  const filename = buildExportFilename(format, supplier ?? undefined);
  if (format === 'CSV') {
    const csv = serialiseToCsv(documents);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }
  const json = serialiseToJson(documents);
  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
