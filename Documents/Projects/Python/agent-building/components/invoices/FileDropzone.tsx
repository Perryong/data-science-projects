import React, { useRef, useState, useCallback } from 'react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileDropzone({ onFilesSelected }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    },
    [onFilesSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        onFilesSelected(selected);
      }
      // Reset so the same file can be re-selected
      e.target.value = '';
    },
    [onFilesSelected]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload PDF files"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 py-12 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <svg
        className={`mb-3 h-10 w-10 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="text-sm font-medium text-gray-700">
        {isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF files here, or click to select'}
      </p>
      <p className="mt-1 text-xs text-gray-500">PDF files only, multiple files supported</p>
    </div>
  );
}
