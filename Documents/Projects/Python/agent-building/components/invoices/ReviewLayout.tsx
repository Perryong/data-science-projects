import React from 'react';

interface ReviewLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function ReviewLayout({ left, right }: ReviewLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      <div className="w-[40%] flex-shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
        {left}
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
        {right}
      </div>
    </div>
  );
}
