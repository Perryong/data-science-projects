# Invoice OCR

Automated invoice data extraction using Claude AI for Polytainer, SSS, and DDW suppliers.

## Setup

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL and Redis)

### Steps

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `ANTHROPIC_API_KEY`.

3. Start infrastructure:
   ```bash
   docker compose up -d
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Seed supplier records:
   ```bash
   npm run db:seed
   ```

7. Start the development server and worker:
   ```bash
   npm run dev
   ```

The app runs at http://localhost:3000.

## Architecture

- **`services/`** — all business logic
- **`app/api/`** — thin Next.js API route handlers
- **`workers/`** — BullMQ worker for background extraction jobs
- **`lib/`** — shared utilities (Prisma client, rate limiter, field definitions)
- **`prisma/`** — schema and migrations

## Known Limitations

- **File storage**: PDFs are stored on the local filesystem under `./uploads/`. Files are lost if the container is restarted without a volume mount. For production, replace with S3 or equivalent object storage.
- **Rate limiter**: The in-process sliding-window rate limiter (`lib/rateLimiter.ts`) is single-process only. In a multi-process or distributed deployment, replace with a Redis-backed rate limiter.
- **PDF text extraction**: `pdf-parse` cannot extract text from scanned/image-only PDFs. Those will require an OCR preprocessing step.
