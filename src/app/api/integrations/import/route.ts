import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

/**
 * Map a raw CSV row to a Partner record using the provided column mapping.
 */
function mapPartner(row: Record<string, string>, mapping: Record<string, string>) {
  const record: Record<string, unknown> = {};
  const fieldMap: Record<string, (val: string) => unknown> = {
    name: (v) => v,
    pib: (v) => v,
    maticniBr: (v) => v || null,
    address: (v) => v || null,
    city: (v) => v || null,
    zipCode: (v) => v || null,
    phone: (v) => v || null,
    email: (v) => v || null,
    type: (v) => v || 'kupac',
    account: (v) => v || null,
    bank: (v) => v || null,
    notes: (v) => v || null,
  };

  for (const [sourceCol, targetField] of Object.entries(mapping)) {
    const value = row[sourceCol];
    if (value !== undefined && fieldMap[targetField]) {
      record[targetField] = fieldMap[targetField](value);
    }
  }

  return record;
}

/**
 * Map a raw CSV row to a Product record using the provided column mapping.
 */
function mapProduct(row: Record<string, string>, mapping: Record<string, string>) {
  const record: Record<string, unknown> = {};
  const fieldMap: Record<string, (val: string) => unknown> = {
    name: (v) => v,
    sku: (v) => v,
    barcode: (v) => v || null,
    category: (v) => v || null,
    unit: (v) => v || 'kom',
    purchasePrice: (v) => parseFloat(v) || 0,
    sellingPrice: (v) => parseFloat(v) || 0,
    minStock: (v) => parseInt(v, 10) || 0,
    currentStock: (v) => parseInt(v, 10) || 0,
    description: (v) => v || null,
    isActive: (v) => {
      const lower = v.toLowerCase().trim();
      return lower === 'false' || lower === 'ne' || lower === '0' ? false : true;
    },
  };

  for (const [sourceCol, targetField] of Object.entries(mapping)) {
    const value = row[sourceCol];
    if (value !== undefined && fieldMap[targetField]) {
      record[targetField] = fieldMap[targetField](value);
    }
  }

  return record;
}

/**
 * Map a raw CSV row to a Transaction record using the provided column mapping.
 */
function mapTransaction(row: Record<string, string>, mapping: Record<string, string>) {
  const record: Record<string, unknown> = {};
  const fieldMap: Record<string, (val: string) => unknown> = {
    date: (v) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    },
    type: (v) => v || 'rashod',
    category: (v) => v || 'ostalo',
    amount: (v) => parseFloat(v) || 0,
    description: (v) => v || '',
    documentRef: (v) => v || null,
    partnerId: (v) => v || null,
  };

  for (const [sourceCol, targetField] of Object.entries(mapping)) {
    const value = row[sourceCol];
    if (value !== undefined && fieldMap[targetField]) {
      record[targetField] = fieldMap[targetField](value);
    }
  }

  return record;
}

/**
 * Map a raw CSV row to a Contact record using the provided column mapping.
 */
function mapContact(row: Record<string, string>, mapping: Record<string, string>) {
  const record: Record<string, unknown> = {};
  const fieldMap: Record<string, (val: string) => unknown> = {
    firstName: (v) => v,
    lastName: (v) => v,
    email: (v) => v || null,
    phone: (v) => v || null,
    position: (v) => v || null,
    company: (v) => v || null,
    partnerId: (v) => v || null,
    notes: (v) => v || null,
    tags: (v) => v || null,
    isClient: (v) => {
      const lower = v.toLowerCase().trim();
      return lower === 'true' || lower === 'da' || lower === '1' ? true : false;
    },
    isSupplier: (v) => {
      const lower = v.toLowerCase().trim();
      return lower === 'true' || lower === 'da' || lower === '1' ? true : false;
    },
    isLead: (v) => {
      const lower = v.toLowerCase().trim();
      return lower === 'false' || lower === 'ne' || lower === '0' ? false : true;
    },
  };

  for (const [sourceCol, targetField] of Object.entries(mapping)) {
    const value = row[sourceCol];
    if (value !== undefined && fieldMap[targetField]) {
      record[targetField] = fieldMap[targetField](value);
    }
  }

  return record;
}

/**
 * Import a single entity row into the database.
 * Handles duplicate detection and updates based on options.
 */
async function importRow(
  entityType: string,
  data: Record<string, unknown>,
  options: ImportOptions
): Promise<{ success: boolean; error?: ImportError }> {
  try {
    switch (entityType) {
      case 'partners': {
        const pib = data.pib as string;
        const name = data.name as string;

        if (!name || !pib) {
          return {
            success: false,
            error: { row: 0, field: 'name/pib', message: 'Name and PIB are required' },
          };
        }

        const existing = await db.partner.findUnique({ where: { pib } });
        if (existing) {
          if (options.skipDuplicates) {
            return { success: true }; // Skip silently
          }
          if (options.updateExisting) {
            await db.partner.update({ where: { pib }, data });
            return { success: true };
          }
          return {
            success: false,
            error: { row: 0, field: 'pib', message: `Partner with PIB "${pib}" already exists` },
          };
        }

        await db.partner.create({ data });
        return { success: true };
      }

      case 'products': {
        const sku = data.sku as string;
        const name = data.name as string;

        if (!name || !sku) {
          return {
            success: false,
            error: { row: 0, field: 'name/sku', message: 'Name and SKU are required' },
          };
        }

        const existing = await db.product.findUnique({ where: { sku } });
        if (existing) {
          if (options.skipDuplicates) {
            return { success: true };
          }
          if (options.updateExisting) {
            await db.product.update({ where: { sku }, data });
            return { success: true };
          }
          return {
            success: false,
            error: { row: 0, field: 'sku', message: `Product with SKU "${sku}" already exists` },
          };
        }

        await db.product.create({ data });
        return { success: true };
      }

      case 'transactions': {
        const description = data.description as string;
        if (!description) {
          return {
            success: false,
            error: { row: 0, field: 'description', message: 'Description is required' },
          };
        }

        await db.transaction.create({ data });
        return { success: true };
      }

      case 'contacts': {
        const firstName = data.firstName as string;
        const lastName = data.lastName as string;

        if (!firstName || !lastName) {
          return {
            success: false,
            error: { row: 0, field: 'firstName/lastName', message: 'First name and last name are required' },
          };
        }

        await db.contact.create({ data });
        return { success: true };
      }

      default:
        return {
          success: false,
          error: { row: 0, field: 'entityType', message: `Unknown entity type: ${entityType}` },
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: { row: 0, field: 'unknown', message },
    };
  }
}

/**
 * Get the appropriate mapper function for the entity type.
 */
function getMapper(
  entityType: string
): (row: Record<string, string>, mapping: Record<string, string>) => Record<string, unknown> {
  switch (entityType) {
    case 'partners':
      return mapPartner;
    case 'products':
      return mapProduct;
    case 'transactions':
      return mapTransaction;
    case 'contacts':
      return mapContact;
    default:
      return () => ({});
  }
}

// POST /api/integrations/import — Perform data import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, source, mapping, rows, options, fileName } = body;

    // Validate required fields
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

    if (!mapping || typeof mapping !== 'object') {
      return NextResponse.json({ error: 'mapping object is required' }, { status: 400 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'rows array is required and must not be empty' }, { status: 400 });
    }

    const importOptions: ImportOptions = {
      skipDuplicates: options?.skipDuplicates ?? false,
      updateExisting: options?.updateExisting ?? false,
    };

    // Create IntegrationJob record
    const job = await db.integrationJob.create({
      data: {
        type: 'import',
        entityType,
        source: source || 'custom',
        status: 'processing',
        totalRows: rows.length,
        mapping: JSON.stringify(mapping),
        options: JSON.stringify(importOptions),
        fileName: fileName || null,
      },
    });

    // Process each row
    const mapper = getMapper(entityType);
    let successCount = 0;
    let failedCount = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, string>;
      const data = mapper(row, mapping);

      const result = await importRow(entityType, data, importOptions);

      if (result.success) {
        successCount++;
      } else if (result.error) {
        failedCount++;
        errors.push({
          row: i + 1, // 1-based index
          field: result.error.field,
          message: result.error.message,
        });
      } else {
        failedCount++;
        errors.push({
          row: i + 1,
          field: 'unknown',
          message: 'Unknown import error',
        });
      }
    }

    // Determine final job status
    let finalStatus: string;
    if (failedCount === 0) {
      finalStatus = 'completed';
    } else if (successCount === 0) {
      finalStatus = 'failed';
    } else {
      finalStatus = 'partial';
    }

    // Update job with results
    const updatedJob = await db.integrationJob.update({
      where: { id: job.id },
      data: {
        status: finalStatus,
        successRows: successCount,
        failedRows: failedCount,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
      },
    });

    return NextResponse.json({
      job: updatedJob,
      summary: {
        totalRows: rows.length,
        successRows: successCount,
        failedRows: failedCount,
        status: finalStatus,
      },
      errors: errors.length > 100 ? errors.slice(0, 100) : errors, // Cap at 100 errors
    });
  } catch (error) {
    console.error('Error during import:', error);
    return NextResponse.json(
      { error: 'Failed to perform import' },
      { status: 500 }
    );
  }
}
