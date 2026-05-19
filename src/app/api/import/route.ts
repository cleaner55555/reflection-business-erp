import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  parseCSV,
  parseXLSX,
  mapImportColumns,
  transformImportRow,
  type ExportDataType,
  type ImportMode,
} from '@/lib/export-utils';

// POST /api/import
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as ExportDataType;
    const mode = (formData.get('mode') as ImportMode) || 'create';
    const file = formData.get('file') as File | null;

    // Validate type
    const validTypes: ExportDataType[] = ['invoices', 'contacts', 'products', 'employees'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Nevažeći tip. Podržani: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes: ImportMode[] = ['create', 'update', 'upsert'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: `Nevažeći režim. Podržani: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'Fajl je obavezan.' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Podržani formati su CSV i XLSX.' },
        { status: 400 }
      );
    }

    // Get companyId from header
    const companyId = request.headers.get('x-company-id');

    // Parse file
    let rows: Record<string, string>[];
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      rows = parseCSV(text);
    } else {
      const buffer = await file.arrayBuffer();
      rows = await parseXLSX(buffer);
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Fajl ne sadrži podatke ili ima prazne redove.' },
        { status: 400 }
      );
    }

    // Get headers and map columns
    const headers = Object.keys(rows[0]);
    const columnMappings = mapImportColumns(headers, type);

    if (Object.keys(columnMappings).length === 0) {
      return NextResponse.json(
        { error: 'Nije moguće mapirati kolone. Proverite zaglavlja fajla.' },
        { status: 400 }
      );
    }

    // Process rows
    const result = await processImport(type, rows, columnMappings, mode, companyId);

    return NextResponse.json({
      message: 'Uvoz završen.',
      ...result,
      totalRows: rows.length,
      columnMappings,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Greška pri uvozu podataka.' },
      { status: 500 }
    );
  }
}

// ============ Import Processing ============

async function processImport(
  type: ExportDataType,
  rows: Record<string, string>[],
  columnMappings: Record<string, string>,
  mode: ImportMode,
  companyId: string | null
): Promise<{ created: number; updated: number; errors: Array<{ row: number; message: string }> }> {
  let created = 0;
  let updated = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = transformImportRow(row, columnMappings, type);

    try {
      const result = await importRow(type, data, mode, companyId);
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepoznata greška';
      errors.push({ row: i + 2, message }); // +2 for header row + 1-based index
    }
  }

  return { created, updated, errors: errors.slice(0, 100) }; // Cap errors at 100
}

type ImportResult = 'created' | 'updated' | 'skipped';

async function importRow(
  type: ExportDataType,
  data: Record<string, unknown>,
  mode: ImportMode,
  companyId: string | null
): Promise<ImportResult> {
  const baseData = companyId ? { companyId, ...data } : data;

  switch (type) {
    case 'contacts': {
      const firstName = data.firstName as string;
      const lastName = data.lastName as string;
      if (!firstName || !lastName) {
        throw new Error('Ime i prezime su obavezna.');
      }
      await db.contact.create({ data: baseData });
      return 'created';
    }

    case 'products': {
      const name = data.name as string;
      const sku = data.sku as string;
      if (!name || !sku) {
        throw new Error('Naziv i šifra (SKU) su obavezni.');
      }

      // Check for existing product (by sku within company)
      const existingSku = sku;
      let existing: { id: string } | null = null;
      if (companyId) {
        // Find by unique constraint (companyId + sku)
        existing = await db.product.findFirst({
          where: { companyId, sku: existingSku },
        });
      }

      if (existing) {
        if (mode === 'create') {
          throw new Error(`Proizvod sa šifrom "${sku}" već postoji.`);
        }
        if (mode === 'update' || mode === 'upsert') {
          await db.product.update({ where: { id: existing.id }, data });
          return 'updated';
        }
      } else {
        if (mode === 'update') {
          throw new Error(`Proizvod sa šifrom "${sku}" ne postoji za ažuriranje.`);
        }
        await db.product.create({ data: baseData });
        return 'created';
      }
      return 'skipped';
    }

    case 'employees': {
      const firstName = data.firstName as string;
      const lastName = data.lastName as string;
      if (!firstName || !lastName) {
        throw new Error('Ime i prezime su obavezna.');
      }
      await db.employee.create({ data: baseData });
      return 'created';
    }

    case 'invoices': {
      const number = data.number as string;
      const partnerId = data.partnerId as string;
      if (!number) {
        throw new Error('Broj fakture je obavezan.');
      }

      // For invoices, mode 'update'/'upsert' requires existing invoice
      let existing: { id: string } | null = null;
      if (companyId) {
        existing = await db.invoice.findFirst({
          where: { companyId, number },
        });
      }

      if (existing) {
        if (mode === 'create') {
          throw new Error(`Faktura sa brojem "${number}" već postoji.`);
        }
        if (mode === 'update' || mode === 'upsert') {
          // Remove fields that shouldn't be updated
          const { id, createdAt, updatedAt, partner, items, ...updateData } = data as Record<string, unknown>;
          await db.invoice.update({ where: { id: existing.id }, data: updateData });
          return 'updated';
        }
      } else {
        if (mode === 'update') {
          throw new Error(`Faktura sa brojem "${number}" ne postoji za ažuriranje.`);
        }
        // For new invoices, partnerId and dueDate are required
        if (!partnerId) {
          throw new Error('Partner ID je obavezan za novu fakturu.');
        }
        if (!data.dueDate) {
          throw new Error('Datum valute je obavezan za novu fakturu.');
        }
        await db.invoice.create({
          data: {
            ...baseData,
            dueDate: new Date(data.dueDate as string),
            date: data.date ? new Date(data.date as string) : undefined,
            totalAmount: Number(data.totalAmount) || 0,
            taxAmount: Number(data.taxAmount) || 0,
            baseAmount: Number(data.baseAmount) || 0,
          },
        });
        return 'created';
      }
      return 'skipped';
    }

    default:
      throw new Error(`Nepodržan tip: ${type}`);
  }
}
