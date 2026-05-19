'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { saveAs } from 'file-saver';
import type { ExportDataType, ExportFormat } from '@/lib/export-utils';

interface ExportButtonProps {
  dataType: ExportDataType;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  filters?: Record<string, string>;
  columns?: string[];
}

export default function ExportButton({
  dataType,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  filters,
  columns,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const getAuthToken = useAppStore((s) => s.getAuthToken);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (activeCompanyId) headers['x-company-id'] = activeCompanyId;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = { type: dataType, format };
      if (filters) body.filters = filters;
      if (columns) body.columns = columns;

      const response = await fetch('/api/export', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Greška pri izvozu.' }));
        throw new Error(error.error || 'Greška pri izvozu.');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_${dataType}_${new Date().toISOString().split('T')[0]}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?(?:;|$)/);
        if (match) filename = match[1];
      }

      // Download file
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Greška pri izvozu podataka.');
    } finally {
      setExporting(null);
    }
  };

  const isExporting = exporting !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          Izvezi
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={exporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          CSV format
          {exporting === 'csv' && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={exporting !== null}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel (XLSX)
          {exporting === 'xlsx' && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF dokument
          {exporting === 'pdf' && <Loader2 className="h-3 w-3 ml-auto animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
