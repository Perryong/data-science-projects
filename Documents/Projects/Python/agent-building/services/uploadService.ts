// responsibilities: validate, hash, dedup check, store file, create DB record
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { prisma } from '@/lib/prisma';
import { InvoiceDocument } from '@prisma/client';

export class UploadValidationError extends Error {}

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? '50', 10);

export async function validatePdfFile(buffer: Buffer, filename: string, mimetype: string): Promise<void> {
  if (!filename.toLowerCase().endsWith('.pdf') || !['application/pdf', 'application/octet-stream'].includes(mimetype)) {
    throw new UploadValidationError(`Only PDF files are accepted: ${filename}`);
  }
  if (buffer.length === 0) {
    throw new UploadValidationError(`File is empty: ${filename}`);
  }
  if (buffer.length > MAX_SIZE_MB * 1024 * 1024) {
    throw new UploadValidationError(`File exceeds ${MAX_SIZE_MB}MB limit: ${filename}`);
  }
  try {
    await pdfParse(buffer);
  } catch {
    throw new UploadValidationError(`This PDF could not be read. It may be password-protected or corrupt: ${filename}`);
  }
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function checkDuplicate(hash: string): Promise<InvoiceDocument | null> {
  return prisma.invoiceDocument.findUnique({ where: { fileHash: hash } });
}

export async function storeFile(buffer: Buffer, hash: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${hash}.pdf`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);
  return `/uploads/${filename}`;
}

export async function createDocumentRecord(data: {
  originalFilename: string;
  fileUrl: string;
  fileHash: string;
}): Promise<InvoiceDocument> {
  return prisma.invoiceDocument.create({ data });
}
