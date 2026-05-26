'use client';

import { useEffect } from 'react';

interface UnsavedChangesGuardProps {
  isDirty: boolean;
}

export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers show a generic message; this value is ignored
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return null;
}
