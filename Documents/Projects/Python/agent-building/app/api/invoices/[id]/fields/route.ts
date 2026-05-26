import { NextRequest, NextResponse } from 'next/server';
import { updateFieldCorrections, updateAnalyticalResults, InvoiceNotFoundError } from '@/services/invoiceService';
import { z } from 'zod';

const analyticalResultSchema = z.object({
  testId: z.string(),
  minValue: z.string().nullable().optional(),
  maxValue: z.string().nullable().optional(),
  testedValue: z.string().nullable().optional(),
  rowIndex: z.number().int(),
});

const schema = z.object({
  corrections: z.array(z.object({ fieldName: z.string(), correctedValue: z.string() })).optional(),
  analyticalResults: z.array(analyticalResultSchema).optional(),
}).refine(
  data => (data.corrections?.length ?? 0) > 0 || data.analyticalResults !== undefined,
  { message: 'At least corrections or analyticalResults must be provided' }
);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid request body' }, { status: 400 });
  }

  const documentId = parseInt(params.id, 10);

  try {
    let updatedFields = 0;
    if (parsed.data.corrections && parsed.data.corrections.length > 0) {
      updatedFields = await updateFieldCorrections(documentId, parsed.data.corrections);
    }
    if (parsed.data.analyticalResults !== undefined) {
      await updateAnalyticalResults(documentId, parsed.data.analyticalResults);
    }
    return NextResponse.json({ updated: updatedFields });
  } catch (e) {
    if (e instanceof InvoiceNotFoundError) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to save corrections' }, { status: 500 });
  }
}
