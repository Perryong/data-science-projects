import React from 'react';

interface FieldInputProps {
  fieldName: string;
  fieldValue: string | null;
  correctedValue: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isCorrected: boolean;
  onChange: (value: string) => void;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  LOW: 'border-red-500 bg-red-50',
  MEDIUM: 'border-yellow-400 bg-yellow-50',
  HIGH: 'border-gray-300 bg-white',
};

export function FieldInput({
  fieldName,
  fieldValue,
  correctedValue,
  confidence,
  isCorrected,
  onChange,
}: FieldInputProps) {
  const inputId = `field-${fieldName.replace(/\s+/g, '-').toLowerCase()}`;
  const displayValue = correctedValue ?? fieldValue ?? '';
  const borderStyle = CONFIDENCE_STYLES[confidence] ?? CONFIDENCE_STYLES.HIGH;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-medium text-gray-600">
          {fieldName}
        </label>
        <div className="flex items-center gap-2">
          {isCorrected && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Corrected
            </span>
          )}
          {confidence !== 'HIGH' && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                confidence === 'LOW'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-yellow-100 text-yellow-600'
              }`}
            >
              {confidence}
            </span>
          )}
        </div>
      </div>
      <input
        id={inputId}
        type="text"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderStyle}`}
      />
    </div>
  );
}
