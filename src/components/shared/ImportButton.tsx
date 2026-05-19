'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileUp, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import type { ExportDataType, ImportMode } from '@/lib/export-utils';

interface ImportButtonProps {
  dataType: ExportDataType;
  onImportComplete?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

interface ImportResult {
  message: string;
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
  totalRows: number;
  columnMappings: Record<string, string>;
}

export default function ImportButton({
  dataType,
  onImportComplete,
  variant = 'outline',
  size = 'sm',
  disabled = false,
}: ImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>('create');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const getAuthToken = useAppStore((s) => s.getAuthToken);

  const resetState = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setMode('create');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleOpen = () => {
    resetState();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (result && (result.created > 0 || result.updated > 0) && onImportComplete) {
      onImportComplete();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const name = selected.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
        setError('Podržani formati su CSV i XLSX.');
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', dataType);
      formData.append('mode', mode);

      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (activeCompanyId) headers['x-company-id'] = activeCompanyId;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/import', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({ error: 'Greška pri uvozu.' }));

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri uvozu.');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri uvozu podataka.');
    } finally {
      setImporting(false);
    }
  };

  const getModeLabel = (m: ImportMode): string => {
    switch (m) {
      case 'create': return 'Kreiraj nove';
      case 'update': return 'Ažuriraj postojeće';
      case 'upsert': return 'Kreiraj ili ažuriraj';
    }
  };

  const getDataTypeLabel = (): string => {
    const labels: Record<ExportDataType, string> = {
      invoices: 'fakture',
      contacts: 'kontakte',
      products: 'proizvode',
      employees: 'zaposlene',
      projects: 'projekte',
    };
    return labels[dataType] || dataType;
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleOpen} disabled={disabled}>
        <Upload className="h-4 w-4 mr-1" />
        Uvezi
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Uvoz {getDataTypeLabel()}</DialogTitle>
            <DialogDescription>
              Učitajte CSV ili XLSX fajl za uvoz {getDataTypeLabel()} u sistem.
            </DialogDescription>
          </DialogHeader>

          {!result && (
            <div className="space-y-4 py-4">
              {/* File input */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileUp className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Kliknite za izbor fajla
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV, XLSX formati
                    </p>
                  </div>
                )}
              </div>

              {/* Import mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Režim uvoza</label>
                <Select value={mode} onValueChange={(v) => setMode(v as ImportMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">{getModeLabel('create')}</SelectItem>
                    <SelectItem value="update">{getModeLabel('update')}</SelectItem>
                    <SelectItem value="upsert">{getModeLabel('upsert')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-md">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{result.message}</p>
                  <p className="text-xs mt-0.5">
                    Ukupno redova: {result.totalRows} | Mapirano kolona: {Object.keys(result.columnMappings).length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold text-emerald-600">{result.created}</p>
                  <p className="text-xs text-muted-foreground">Kreirano</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                  <p className="text-xs text-muted-foreground">Ažurirano</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Greške ({result.errors.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-md border text-xs">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-medium">Red</th>
                          <th className="text-left p-2 font-medium">Greška</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((err, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{err.row}</td>
                            <td className="p-2">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {result ? (
              <Button onClick={handleClose} className="w-full">
                Zatvori
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleClose}>
                  Otkaži
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Uvoz...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-1" />
                      Pokreni uvoz
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
