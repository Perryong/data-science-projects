import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { prisma } from '@/lib/prisma';
import { SupplierCode, DocumentType } from '@prisma/client';

type Confidence = 'certain' | 'ambiguous';

interface ClassificationResult<T> {
  candidates: T[];
  confidence: Confidence;
}

export interface ClassificationOutcome {
  needsUserConfirmation: boolean;
  supplierCandidates: SupplierCode[];
  documentTypeCandidates: DocumentType[];
  classifiedSupplierId?: number;
  classifiedDocumentType?: DocumentType;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

export async function extractTextFromPdf(fileUrl: string): Promise<string> {
  const filename = path.basename(fileUrl);
  const fullPath = path.join(UPLOAD_DIR, filename);
  const buffer = await fs.readFile(fullPath);
  const result = await pdfParse(buffer);
  return result.text;
}

export function classifySupplier(text: string): ClassificationResult<SupplierCode> {
  const upper = text.toUpperCase();
  const candidates: SupplierCode[] = [];
  if (upper.includes('POLYTAINER INDUSTRIES')) candidates.push('POLYTAINER');
  if (upper.includes('SAN SOON SENG') || upper.includes('SSSFI') || upper.includes('THREE-A RESOURCES')) candidates.push('SSS');
  if (upper.includes('DDW') || upper.includes('D.D. WILLIAMSON') || upper.includes('THE COLOR HOUSE')) candidates.push('DDW');
  return {
    candidates,
    confidence: candidates.length === 1 ? 'certain' : 'ambiguous',
  };
}

export function classifyDdwDocumentType(text: string): ClassificationResult<DocumentType> {
  const upper = text.toUpperCase();
  const candidates: DocumentType[] = [];
  if (upper.includes('CERTIFICATE OF ANALYSIS') || upper.includes('ANALYTICAL RESULTS')) candidates.push('COA');
  if (upper.includes('PACKING LIST') || upper.includes('PACK SLIP')) candidates.push('PACK_SLIP');
  if (upper.includes('DELIVERY DOCKET') || upper.includes('DELIVERY NOTE')) candidates.push('DELIVERY_DOCKET');
  if (candidates.length === 0) candidates.push('INVOICE');
  return {
    candidates,
    confidence: candidates.length === 1 ? 'certain' : 'ambiguous',
  };
}

export async function classifyDocument(documentId: number): Promise<ClassificationOutcome> {
  const doc = await prisma.invoiceDocument.findUniqueOrThrow({ where: { id: documentId } });
  const text = await extractTextFromPdf(doc.fileUrl);
  const supplierResult = classifySupplier(text);

  if (supplierResult.confidence === 'ambiguous' || supplierResult.candidates.length === 0) {
    await prisma.invoiceDocument.update({ where: { id: documentId }, data: { status: 'NEEDS_REVIEW' } });
    return { needsUserConfirmation: true, supplierCandidates: supplierResult.candidates, documentTypeCandidates: [] };
  }

  const supplierCode = supplierResult.candidates[0];
  const supplier = await prisma.supplier.findUniqueOrThrow({ where: { code: supplierCode } });

  let documentType: DocumentType = 'INVOICE';
  let needsConfirmation = false;
  let docTypeCandidates: DocumentType[] = ['INVOICE'];

  if (supplierCode === 'DDW') {
    const typeResult = classifyDdwDocumentType(text);
    docTypeCandidates = typeResult.candidates;
    if (typeResult.confidence === 'ambiguous') {
      needsConfirmation = true;
    } else {
      documentType = typeResult.candidates[0];
    }
  }

  if (needsConfirmation) {
    await prisma.invoiceDocument.update({ where: { id: documentId }, data: { supplierId: supplier.id, status: 'NEEDS_REVIEW' } });
    return { needsUserConfirmation: true, supplierCandidates: [supplierCode], documentTypeCandidates: docTypeCandidates };
  }

  await prisma.invoiceDocument.update({
    where: { id: documentId },
    data: { supplierId: supplier.id, documentType, status: 'PENDING' },
  });

  return {
    needsUserConfirmation: false,
    supplierCandidates: [supplierCode],
    documentTypeCandidates: [documentType],
    classifiedSupplierId: supplier.id,
    classifiedDocumentType: documentType,
  };
}
