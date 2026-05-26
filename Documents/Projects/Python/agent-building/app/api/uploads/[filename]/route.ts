import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

export async function GET(_: NextRequest, { params }: { params: { filename: string } }) {
  // Prevent path traversal
  const safe = path.basename(params.filename);
  const fullPath = path.join(UPLOAD_DIR, safe);
  try {
    const buffer = await fs.readFile(fullPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Document unavailable' }, { status: 404 });
  }
}
