import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/bank-transactions/import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankAccountId, csvContent } = body;

    if (!bankAccountId || !csvContent) {
      return NextResponse.json({ error: 'bankAccountId and csvContent are required' }, { status: 400 });
    }

    const account = await db.bankAccount.findUnique({ where: { id: bankAccountId } });
    if (!account) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Parse CSV - support comma, semicolon, tab delimited
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have a header and at least one data row' }, { status: 400 });
    }

    // Detect delimiter
    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.split(';').length > headerLine.split(',').length) {
      delimiter = ';';
    } else if (headerLine.split('\t').length > headerLine.split(',').length) {
      delimiter = '\t';
    }

    const headers = parseCSVLine(headerLine, delimiter).map((h) => h.toLowerCase().trim().replace(/['"]/g, ''));

    // Map common column names to our fields
    const colMap = {
      date: findColumnIndex(headers, ['date', 'datum', 'datumed', 'valutadatum', 'transaction date', 'posting date']),
      description: findColumnIndex(headers, ['description', 'opis', 'description', 'purpose', 'svrha placanja', 'text']),
      amount: findColumnIndex(headers, ['amount', 'iznos', 'amount', 'total', 'value', 'ukupan iznos']),
      reference: findColumnIndex(headers, ['reference', 'poziv na broj', 'reference number', 'payment reference', 'ref']),
      counterpart: findColumnIndex(headers, ['counterpart', 'partner', 'counterpart', 'sender', 'receiver', 'beneficiary', 'payer', 'name', 'nalogodavac', 'primaoc']),
      debitAmount: findColumnIndex(headers, ['debit', 'duguje', 'debit', 'withdrawal', 'outflow', 'potrosnja']),
      creditAmount: findColumnIndex(headers, ['credit', 'potrazuje', 'credit', 'deposit', 'inflow', 'uplata']),
    };

    if (colMap.date === -1) {
      return NextResponse.json({ error: 'Could not find date column in CSV. Supported names: date, datum, valutadatum' }, { status: 400 });
    }

    const imported = [];
    const errors = [];
    let runningBalance = account.balance;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const cols = parseCSVLine(line, delimiter);

        const rawDate = (cols[colMap.date] || '').trim().replace(/['"]/g, '');
        const date = parseDate(rawDate);
        if (!date) {
          errors.push(`Row ${i + 1}: Invalid date "${rawDate}"`);
          continue;
        }

        // Determine amount: prefer single amount column, fall back to debit/credit
        let amount = 0;
        if (colMap.amount !== -1 && colMap.debitAmount === -1) {
          const rawAmount = (cols[colMap.amount] || '').trim().replace(/['"]/g, '').replace(/\s/g, '');
          amount = parseFloat(rawAmount.replace(',', '.'));
          if (isNaN(amount)) {
            errors.push(`Row ${i + 1}: Invalid amount`);
            continue;
          }
        } else if (colMap.debitAmount !== -1 || colMap.creditAmount !== -1) {
          const debit = colMap.debitAmount !== -1
            ? parseFloat((cols[colMap.debitAmount] || '0').trim().replace(/['"]/g, '').replace(/\s/g, '').replace(',', '.'))
            : 0;
          const credit = colMap.creditAmount !== -1
            ? parseFloat((cols[colMap.creditAmount] || '0').trim().replace(/['"]/g, '').replace(/\s/g, '').replace(',', '.'))
            : 0;
          amount = credit - debit; // inflow positive, outflow negative
          if (isNaN(amount)) {
            errors.push(`Row ${i + 1}: Invalid debit/credit amounts`);
            continue;
          }
        }

        runningBalance += amount;

        const description = colMap.description !== -1 ? (cols[colMap.description] || '').trim().replace(/['"]/g, '') : '';
        const reference = colMap.reference !== -1 ? (cols[colMap.reference] || '').trim().replace(/['"]/g, '') : null;
        const counterpart = colMap.counterpart !== -1 ? (cols[colMap.counterpart] || '').trim().replace(/['"]/g, '') : null;

        // Auto-categorize
        let category: string | null = null;
        if (amount > 0) {
          category = 'prihod';
        } else {
          category = 'rashod';
        }

        const transaction = await db.bankTransaction.create({
          data: {
            bankAccountId,
            date,
            amount,
            description,
            reference: reference || null,
            counterpart: counterpart || null,
            category,
          },
        });

        imported.push(transaction);
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Update account balance and last sync date
    await db.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        balance: runningBalance,
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      imported: imported.length,
      failed: errors.length,
      errors: errors.slice(0, 20), // limit error messages
      newBalance: runningBalance,
    });
  } catch (error) {
    console.error('Error importing bank transactions:', error);
    return NextResponse.json({ error: 'Failed to import bank transactions' }, { status: 500 });
  }
}

// Helper: parse a CSV line respecting quoted fields
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Helper: find column index by possible names
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.findIndex((h) => h === name || h.includes(name));
    if (idx !== -1) return idx;
  }
  return -1;
}

// Helper: parse date in multiple formats
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try DD.MM.YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  // Try YYYY-MM-DD
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    return new Date(dateStr);
  }

  // Try DD/MM/YYYY
  const dmyMatch2 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch2) {
    const [, d, m, y] = dmyMatch2;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  // Try MM/DD/YYYY
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  // Fallback
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}
