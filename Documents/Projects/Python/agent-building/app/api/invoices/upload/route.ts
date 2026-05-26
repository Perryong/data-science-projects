import { NextRequest, NextResponse } from 'next/server';
import {
  validatePdfFile,
  computeFileHash,
  checkDuplicate,
  storeFile,
  createDocumentRecord,
  UploadValidationError,
} from '@/services/uploadService';
import { extractionQueue } from '@/workers/queue';

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const fileEntries = formData.getAll('files');
  const uploaded: Array<{ id: number; originalFilename: string; status: string }> = [];
  const duplicates: Array<{ originalFilename: string; existingId: number }> = [];
  const rejected: Array<{ originalFilename: string; reason: string }> = [];

  for (const entry of fileEntries) {
    if (!(entry instanceof File)) {
      rejected.push({ originalFilename: 'unknown', reason: 'Not a file' });
      continue;
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    try {
      await validatePdfFile(buffer, entry.name, entry.type);
    } catch (e) {
      rejected.push({
        originalFilename: entry.name,
        reason: e instanceof UploadValidationError ? e.message : 'Validation failed',
      });
      continue;
    }
    const hash = computeFileHash(buffer);
    const existing = await checkDuplicate(hash);
    if (existing) {
      duplicates.push({ originalFilename: entry.name, existingId: existing.id });
      continue;
    }
    const fileUrl = await storeFile(buffer, hash);
    const doc = await createDocumentRecord({ originalFilename: entry.name, fileUrl, fileHash: hash });
    await extractionQueue.add('extract', { documentId: doc.id });
    uploaded.push({ id: doc.id, originalFilename: doc.originalFilename, status: doc.status });
  }

  const status = uploaded.length === 0 && rejected.length > 0 ? 400 : 200;
  return NextResponse.json({ uploaded, duplicates, rejected }, { status });
}
