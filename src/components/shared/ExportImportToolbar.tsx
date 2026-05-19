'use client';

import ExportButton from './ExportButton';
import ImportButton from './ImportButton';
import type { ExportDataType } from '@/lib/export-utils';

interface ExportImportToolbarProps {
  dataType: ExportDataType;
  onImportComplete?: () => void;
  filters?: Record<string, string>;
  columns?: string[];
  disabled?: boolean;
}

export default function ExportImportToolbar({
  dataType,
  onImportComplete,
  filters,
  columns,
  disabled = false,
}: ExportImportToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <ExportButton
        dataType={dataType}
        filters={filters}
        columns={columns}
        disabled={disabled}
      />
      <ImportButton
        dataType={dataType}
        onImportComplete={onImportComplete}
        disabled={disabled}
      />
    </div>
  );
}
