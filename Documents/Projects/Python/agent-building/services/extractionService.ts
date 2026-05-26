import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { FIELD_DEFINITIONS } from '@/lib/fieldDefinitions';
import { SupplierCode, DocumentType, Confidence } from '@prisma/client';
import { extractTextFromPdf } from './classificationService';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function buildExtractionPrompt(
  supplierCode: SupplierCode,
  documentType: DocumentType,
  pdfText: string
): string {
  const key = `${supplierCode}_${documentType}`;
  const fields = FIELD_DEFINITIONS[key] ?? [];
  const isCoa = supplierCode === 'DDW' && documentType === 'COA';

  const fieldList = fields.map(f => `- "${f}"`).join('\n');

  const analyticalInstruction = isCoa
    ? `\nAlso extract "analyticalResults" as an array of objects, each with keys: "testId", "minValue", "maxValue", "testedValue". Include every row from the analytical/test results table.`
    : '';

  return `You are a document data extraction assistant. Extract structured data from the following ${supplierCode} ${documentType.replace('_', ' ')} document text.

Return ONLY a valid JSON object with these exact field names as keys:
${fieldList}${analyticalInstruction}

For each field:
- Set the value to the extracted text, or null if not found
- Add a "_confidence" suffix key for each field with value "HIGH", "MEDIUM", or "LOW"
  - HIGH: value clearly found and matches expected format
  - MEDIUM: value found but format looks unusual
  - LOW: value not found (use null for the value)

Example output structure (do not copy values):
{
  "Invoice Number": "INV-001",
  "Invoice Number_confidence": "HIGH",
  ...${isCoa ? ',\n  "analyticalResults": [{"testId": "pH", "minValue": "3.0", "maxValue": "4.0", "testedValue": "3.5"}]' : ''}
}

Document text:
---
${pdfText.slice(0, 50000)}
---

Return only the JSON object. No explanation, no markdown code fences.`;
}

const analyticalResultSchema = z.object({
  testId: z.string(),
  minValue: z.string().nullable().optional(),
  maxValue: z.string().nullable().optional(),
  testedValue: z.string().nullable().optional(),
});

export async function callClaudeApi(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude API');
  return block.text;
}

export function parseClaudeResponse(
  rawText: string,
  supplierCode: SupplierCode,
  documentType: DocumentType
): {
  fields: Array<{ fieldName: string; fieldValue: string | null; confidence: Confidence }>;
  analyticalResults: Array<{
    testId: string;
    minValue?: string | null;
    maxValue?: string | null;
    testedValue?: string | null;
    rowIndex: number;
  }>;
} {
  const key = `${supplierCode}_${documentType}`;
  const expectedFields = FIELD_DEFINITIONS[key] ?? [];
  let parsed: Record<string, unknown> = {};

  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Fallback: all fields null, LOW confidence
  }

  const fields = expectedFields.map(fieldName => {
    const value = parsed[fieldName];
    const rawConf = parsed[`${fieldName}_confidence`];
    const confidence: Confidence =
      rawConf === 'HIGH' ? 'HIGH' : rawConf === 'MEDIUM' ? 'MEDIUM' : 'LOW';
    return {
      fieldName,
      fieldValue: typeof value === 'string' ? value : null,
      confidence,
    };
  });

  let analyticalResults: ReturnType<typeof parseClaudeResponse>['analyticalResults'] = [];
  if (supplierCode === 'DDW' && documentType === 'COA') {
    const rawResults = parsed['analyticalResults'];
    if (Array.isArray(rawResults)) {
      analyticalResults = rawResults
        .map((row, index) => {
          const safe = analyticalResultSchema.safeParse(row);
          if (!safe.success) return null;
          return { ...safe.data, rowIndex: index };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
    }
  }

  return { fields, analyticalResults };
}

// Maps each doc type to the field name that holds the Customer PO Number
const PO_NUMBER_FIELD: Partial<Record<string, string>> = {
  POLYTAINER_INVOICE: 'Customer PO Number',
  SSS_INVOICE: 'Customer PO Number',
  DDW_INVOICE: 'Customer PO Number',
  DDW_PACK_SLIP: 'Customer PO Number',
  DDW_COA: 'Customer Purchase Order',
  DDW_DELIVERY_DOCKET: 'Customer PO Number',
};

// Maps each doc type to the field name that holds the Order Number (DDW only)
const ORDER_NUMBER_FIELD: Partial<Record<string, string>> = {
  DDW_INVOICE: 'Order Number',
  DDW_PACK_SLIP: 'Order Number',
  DDW_COA: 'Order Number',
};

export async function storeExtractionResults(
  documentId: number,
  supplierCode: SupplierCode,
  documentType: DocumentType,
  parsed: ReturnType<typeof parseClaudeResponse>
): Promise<void> {
  const key = `${supplierCode}_${documentType}`;
  const poFieldName = PO_NUMBER_FIELD[key];
  const orderFieldName = ORDER_NUMBER_FIELD[key];

  const poField = poFieldName ? parsed.fields.find(f => f.fieldName === poFieldName) : undefined;
  const orderField = orderFieldName ? parsed.fields.find(f => f.fieldName === orderFieldName) : undefined;

  const poNumber = poField?.fieldValue ?? null;
  const orderNumber = orderField?.fieldValue ?? null;

  await prisma.$transaction(async (tx) => {
    for (const field of parsed.fields) {
      await tx.extractedField.upsert({
        where: { invoiceDocumentId_fieldName: { invoiceDocumentId: documentId, fieldName: field.fieldName } },
        update: { fieldValue: field.fieldValue, confidence: field.confidence, correctedValue: null, isCorrected: false },
        create: { invoiceDocumentId: documentId, ...field },
      });
    }
    await tx.analyticalResult.deleteMany({ where: { invoiceDocumentId: documentId } });
    if (parsed.analyticalResults.length > 0) {
      await tx.analyticalResult.createMany({
        data: parsed.analyticalResults.map(r => ({ invoiceDocumentId: documentId, ...r })),
      });
    }
    await tx.invoiceDocument.update({
      where: { id: documentId },
      data: {
        status: 'EXTRACTED',
        extractedAt: new Date(),
        extractionError: null,
        ...(poNumber !== null && { poNumber }),
        ...(orderNumber !== null && { orderNumber }),
      },
    });
  });
}

export async function runExtraction(documentId: number): Promise<void> {
  await prisma.invoiceDocument.update({ where: { id: documentId }, data: { status: 'EXTRACTING' } });

  let doc: Awaited<ReturnType<typeof prisma.invoiceDocument.findUniqueOrThrow>>;
  try {
    doc = await prisma.invoiceDocument.findUniqueOrThrow({
      where: { id: documentId },
      include: { supplier: true },
    });
  } catch (e) {
    await prisma.invoiceDocument.update({ where: { id: documentId }, data: { status: 'FAILED', extractionError: 'Document not found' } });
    throw e;
  }

  if (!doc.supplierId || !doc.documentType) {
    await prisma.invoiceDocument.update({ where: { id: documentId }, data: { status: 'NEEDS_REVIEW', extractionError: 'Classification required before extraction' } });
    return;
  }

  try {
    const pdfText = await extractTextFromPdf(doc.fileUrl);
    const supplier = await prisma.supplier.findUniqueOrThrow({ where: { id: doc.supplierId } });
    const prompt = buildExtractionPrompt(supplier.code, doc.documentType, pdfText);
    const rawResponse = await callClaudeApi(prompt);
    const parsedResult = parseClaudeResponse(rawResponse, supplier.code, doc.documentType);
    await storeExtractionResults(documentId, supplier.code, doc.documentType, parsedResult);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown extraction error';
    await prisma.invoiceDocument.update({
      where: { id: documentId },
      data: { status: 'FAILED', extractionError: message },
    });
    throw e;
  }
}

export async function resolveShipmentLink(documentId: number): Promise<void> {
  const doc = await prisma.invoiceDocument.findUniqueOrThrow({ where: { id: documentId }, include: { supplier: true } });
  if (!doc.supplierId || doc.supplier?.code !== 'DDW' || !doc.poNumber || !doc.orderNumber) return;

  const shipment = await prisma.shipmentRecord.upsert({
    where: { poNumber_orderNumber: { poNumber: doc.poNumber, orderNumber: doc.orderNumber } },
    update: {},
    create: { poNumber: doc.poNumber, orderNumber: doc.orderNumber, supplierId: doc.supplierId },
  });

  await prisma.invoiceDocument.update({ where: { id: documentId }, data: { shipmentRecordId: shipment.id } });
}
