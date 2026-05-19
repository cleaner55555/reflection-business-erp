import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateCSV,
  generateXLSX,
  generatePDF,
  getColumnMappings,
  getDataTypeLabel,
  type ExportDataType,
  type ExportFormat,
} from '@/lib/export-utils';

// POST /api/export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, format, filters, columns } = body as {
      type: ExportDataType;
      format: ExportFormat;
      filters?: Record<string, string>;
      columns?: string[];
    };

    // Validate type
    const validTypes: ExportDataType[] = ['invoices', 'contacts', 'products', 'employees', 'projects'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Nevažeći tip. Podržani: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats: ExportFormat[] = ['csv', 'xlsx', 'pdf'];
    if (!format || !validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Nevažeći format. Podržani: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Get companyId from header (set by middleware from JWT)
    const companyId = request.headers.get('x-company-id');

    // Get column definitions
    const allColumns = getColumnMappings(type);

    // Filter columns if specified
    const selectedColumns = columns && columns.length > 0
      ? allColumns.filter((col) => columns.includes(col.key))
      : allColumns;

    // Fetch data from database
    const data = await fetchData(type, companyId, filters);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Nema podataka za izvoz.' },
        { status: 404 }
      );
    }

    // Generate file in requested format
    const label = getDataTypeLabel(type);
    const dateStr = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv': {
        const csv = generateCSV(data, selectedColumns);
        const filename = `${label}_${dateStr}.csv`;
        return new NextResponse(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'xlsx': {
        const buffer = await generateXLSX(data, selectedColumns, label);
        const filename = `${label}_${dateStr}.xlsx`;
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'pdf': {
        const buffer = await generatePDF(data, selectedColumns, `Izvoz - ${label}`);
        const filename = `${label}_${dateStr}.pdf`;
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Nepodržan format.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Greška pri izvozu podataka.' },
      { status: 500 }
    );
  }
}

// ============ Data Fetching ============

async function fetchData(
  type: ExportDataType,
  companyId: string | null,
  filters?: Record<string, string>
): Promise<Record<string, unknown>[]> {
  const where: Record<string, unknown> = {};

  // Apply companyId filter
  if (companyId) {
    where.companyId = companyId;
  }

  // Apply additional filters
  if (filters) {
    const { status, dateFrom, dateTo, search } = filters;

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [];
      switch (type) {
        case 'invoices':
          (where.OR as Record<string, unknown>[]).push(
            { number: { contains: search } },
            { partner: { name: { contains: search } } }
          );
          break;
        case 'contacts':
          (where.OR as Record<string, unknown>[]).push(
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          );
          break;
        case 'products':
          (where.OR as Record<string, unknown>[]).push(
            { name: { contains: search } },
            { sku: { contains: search } }
          );
          break;
        case 'employees':
          (where.OR as Record<string, unknown>[]).push(
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } }
          );
          break;
        case 'projects':
          (where.OR as Record<string, unknown>[]).push(
            { name: { contains: search } },
            { description: { contains: search } }
          );
          break;
      }
    }
  }

  switch (type) {
    case 'invoices': {
      const records = await db.invoice.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { partner: { select: { name: true } } },
      });
      return records.map((r) => ({
        ...r,
        partnerName: r.partner?.name || '',
      }));
    }

    case 'contacts': {
      const records = await db.contact.findMany({
        where,
        orderBy: { lastName: 'asc' },
      });
      return records.map((r) => ({
        ...r,
        companyName: r.companyName || '',
      }));
    }

    case 'products': {
      const records = await db.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      return records;
    }

    case 'employees': {
      const records = await db.employee.findMany({
        where,
        orderBy: { lastName: 'asc' },
      });
      return records;
    }

    case 'projects': {
      const records = await db.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return records;
    }

    default:
      return [];
  }
}
