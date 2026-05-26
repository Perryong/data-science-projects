import { Worker, Job } from 'bullmq';
import { connection } from './queue';
import { classifyDocument } from '@/services/classificationService';
import { runExtraction, resolveShipmentLink } from '@/services/extractionService';
import { prisma } from '@/lib/prisma';

interface ExtractionJobPayload {
  documentId: number;
}

async function processJob(job: Job<ExtractionJobPayload>) {
  const { documentId } = job.data;
  const outcome = await classifyDocument(documentId);
  if (outcome.needsUserConfirmation) return; // status set to NEEDS_REVIEW; user must confirm
  await runExtraction(documentId);
  await resolveShipmentLink(documentId);
}

export const worker = new Worker<ExtractionJobPayload>(
  'invoice-extraction',
  processJob,
  {
    connection,
    concurrency: 2,
  }
);

worker.on('failed', async (job, err) => {
  if (job && job.attemptsMade >= 3) {
    await prisma.invoiceDocument.update({
      where: { id: job.data.documentId },
      data: {
        status: 'FAILED',
        extractionError: `Extraction failed after 3 attempts: ${err.message}`,
      },
    });
  }
});
