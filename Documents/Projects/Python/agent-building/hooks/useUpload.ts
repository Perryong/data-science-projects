'use client';

import { useState, useCallback } from 'react';

export type UploadFileState = 'pending' | 'uploading' | 'success' | 'error' | 'duplicate';

export interface UploadFile {
  file: File;
  progress: number;
  state: UploadFileState;
  documentId?: number;
  errorMessage?: string;
}

interface UploadResponse {
  uploaded: Array<{ id: number; originalFilename: string; status: string }>;
  duplicates: Array<{ originalFilename: string; existingId: number }>;
  rejected: Array<{ originalFilename: string; reason: string }>;
}

export function useUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const updateFile = (index: number, patch: Partial<UploadFile>) => {
    setFiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const upload = useCallback((newFiles: File[]) => {
    const startIndex = files.length;
    const initialEntries: UploadFile[] = newFiles.map(f => ({
      file: f,
      progress: 0,
      state: 'pending',
    }));
    setFiles(prev => [...prev, ...initialEntries]);

    newFiles.forEach((file, relIndex) => {
      const index = startIndex + relIndex;

      // Set to uploading
      setFiles(prev => {
        const next = [...prev];
        next[index] = { ...next[index], state: 'uploading', progress: 0 };
        return next;
      });

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('files', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setFiles(prev => {
            const next = [...prev];
            next[index] = { ...next[index], progress: pct };
            return next;
          });
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const res = JSON.parse(xhr.responseText) as UploadResponse;
          const filename = file.name;

          const uploaded = res.uploaded.find(u => u.originalFilename === filename);
          if (uploaded) {
            setFiles(prev => {
              const next = [...prev];
              next[index] = { ...next[index], state: 'success', progress: 100, documentId: uploaded.id };
              return next;
            });
            return;
          }

          const duplicate = res.duplicates.find(d => d.originalFilename === filename);
          if (duplicate) {
            setFiles(prev => {
              const next = [...prev];
              next[index] = { ...next[index], state: 'duplicate', progress: 100, documentId: duplicate.existingId };
              return next;
            });
            return;
          }

          const rejected = res.rejected.find(r => r.originalFilename === filename);
          setFiles(prev => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              state: 'error',
              progress: 0,
              errorMessage: rejected?.reason ?? 'Upload failed',
            };
            return next;
          });
        } catch {
          setFiles(prev => {
            const next = [...prev];
            next[index] = { ...next[index], state: 'error', progress: 0, errorMessage: 'Upload failed' };
            return next;
          });
        }
      });

      xhr.addEventListener('error', () => {
        setFiles(prev => {
          const next = [...prev];
          next[index] = { ...next[index], state: 'error', progress: 0, errorMessage: 'Network error' };
          return next;
        });
      });

      xhr.open('POST', '/api/invoices/upload');
      xhr.send(formData);
    });
  }, [files.length]);

  const reset = useCallback(() => {
    setFiles([]);
  }, []);

  // Suppress unused variable warning — updateFile is used inline
  void updateFile;

  return { files, upload, reset };
}
