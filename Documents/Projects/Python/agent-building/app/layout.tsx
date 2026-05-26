import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invoice OCR',
  description: 'Automated invoice data extraction',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <span className="font-semibold text-gray-800 text-base">Invoice OCR</span>
          <Link
            href="/invoices"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
          >
            Invoices
          </Link>
          <Link
            href="/invoices/upload"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
          >
            Upload
          </Link>
          <Link
            href="/invoices/export"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
          >
            Export
          </Link>
        </nav>
        <main className="px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
