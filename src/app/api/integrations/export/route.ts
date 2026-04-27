import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Escape a CSV field: wrap in quotes if it contains comma, quote, or newline.
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string.
 */
function toCSV(rows: Record<string, unknown>[], columns: string[], includeHeaders: boolean): string {
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(columns.map(escapeCSVField).join(','));
  }

  for (const row of rows) {
    lines.push(columns.map((col) => escapeCSVField(row[col])).join(','));
  }

  return lines.join('\n');
}

/**
 * Query all data for a given entity type and return rows with selected columns.
 */
async function getExportData(
  entityType: string,
  columns: string[]
): Promise<{ rows: Record<string, unknown>[]; availableColumns: string[] }> {
  switch (entityType) {
    case 'partners': {
      const records = await db.partner.findMany({ orderBy: { name: 'asc' } });
      const availableColumns = [
        'name', 'pib', 'maticniBr', 'address', 'city', 'zipCode',
        'phone', 'email', 'type', 'account', 'bank', 'notes',
      ];
      return {
        rows: records.map((r) => {
          const row: Record<string, unknown> = {};
          for (const col of columns) {
            if (col in r) row[col] = (r as Record<string, unknown>)[col];
          }
          return row;
        }),
        availableColumns,
      };
    }

    case 'products': {
      const records = await db.product.findMany({ orderBy: { name: 'asc' } });
      const availableColumns = [
        'name', 'sku', 'barcode', 'category', 'unit',
        'purchasePrice', 'sellingPrice', 'minStock', 'currentStock',
        'description', 'isActive',
      ];
      return {
        rows: records.map((r) => {
          const row: Record<string, unknown> = {};
          for (const col of columns) {
            if (col in r) row[col] = (r as Record<string, unknown>)[col];
          }
          return row;
        }),
        availableColumns,
      };
    }

    case 'transactions': {
      const records = await db.transaction.findMany({
        orderBy: { date: 'desc' },
        include: { partner: { select: { name: true } } },
      });
      const availableColumns = [
        'date', 'type', 'category', 'amount', 'description',
        'documentRef', 'partnerName',
      ];
      return {
        rows: records.map((r) => {
          const row: Record<string, unknown> = {};
          for (const col of columns) {
            if (col === 'partnerName') {
              row[col] = r.partner?.name || '';
            } else if (col === 'date') {
              row[col] = r.date.toISOString().split('T')[0];
            } else if (col in r) {
              row[col] = (r as Record<string, unknown>)[col];
            }
          }
          return row;
        }),
        availableColumns,
      };
    }

    case 'contacts': {
      const records = await db.contact.findMany({ orderBy: { lastName: 'asc' } });
      const availableColumns = [
        'firstName', 'lastName', 'email', 'phone', 'position',
        'company', 'notes', 'tags', 'isClient', 'isSupplier', 'isLead',
      ];
      return {
        rows: records.map((r) => {
          const row: Record<string, unknown> = {};
          for (const col of columns) {
            if (col in r) row[col] = (r as Record<string, unknown>)[col];
          }
          return row;
        }),
        availableColumns,
      };
    }

    default:
      return { rows: [], availableColumns: [] };
  }
}

// POST /api/integrations/export — Generate CSV export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, columns, includeHeaders } = body;

    if (!entityType) {
      return NextResponse.json({ error: 'entityType is required' }, { status: 400 });
    }

    const validEntityTypes = ['partners', 'products', 'transactions', 'contacts'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Supported: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch export data
    const { rows, availableColumns } = await getExportData(
      entityType,
      columns || availableColumns
    );

    // If no specific columns provided, use all available columns
    const exportColumns = columns && columns.length > 0 ? columns : availableColumns;
    const headers = includeHeaders !== false; // Default to true

    // Generate CSV
    const csvContent = toCSV(rows, exportColumns, headers);

    // Create an IntegrationJob record for the export
    await db.integrationJob.create({
      data: {
        type: 'export',
        entityType,
        source: 'custom',
        status: 'completed',
        totalRows: rows.length,
        successRows: rows.length,
        failedRows: 0,
        mapping: JSON.stringify(Object.fromEntries(exportColumns.map((c) => [c, c]))),
      },
    });

    // Return CSV as downloadable response
    const filename = `${entityType}_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error during export:', error);
    return NextResponse.json(
      { error: 'Failed to perform export' },
      { status: 500 }
    );
  }
}
