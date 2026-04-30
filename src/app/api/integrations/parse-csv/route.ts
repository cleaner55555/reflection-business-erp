import { NextRequest, NextResponse } from 'next/server';

/**
 * Auto-detect CSV delimiter by analyzing the first line.
 * Checks frequency of comma, semicolon, and tab characters.
 */
function detectDelimiter(firstLine: string): string {
  const counts = {
    ',': (firstLine.match(/,/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
  };

  let best = ',';
  let bestCount = 0;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > bestCount) {
      bestCount = count;
      best = delim;
    }
  }

  return best;
}

/**
 * Simple CSV row parser that handles quoted fields.
 * Supports comma, semicolon, and tab delimiters.
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === delimiter) {
        fields.push(current.trim());
        current = '';
        i++;
        continue;
      }
      current += ch;
      i++;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse a CSV string into rows of objects keyed by header names.
 */
function parseCSVText(csvText: string): {
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
} {
  // Normalize line endings
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const delimiter = detectDelimiter(lines[0]);
  const columns = parseCSVLine(lines[0], delimiter);
  const dataLines = lines.slice(1);
  const rows: Record<string, string>[] = [];

  for (const line of dataLines) {
    const values = parseCSVLine(line, delimiter);
    const row: Record<string, string> = {};
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = values[i] || '';
    }
    rows.push(row);
  }

  return {
    columns,
    rows,
    totalRows: rows.length,
  };
}

// POST /api/integrations/parse-csv — Parse uploaded CSV file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Provide a CSV file in the "file" field.' },
        { status: 400 }
      );
    }

    // Validate file type
    const acceptedTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/csv',
      'text/x-csv',
      'text/tab-separated-values',
    ];
    const fileName = file.name.toLowerCase();

    if (
      !acceptedTypes.includes(file.type) &&
      !fileName.endsWith('.csv') &&
      !fileName.endsWith('.tsv') &&
      !fileName.endsWith('.txt')
    ) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV, TSV, or TXT file.' },
        { status: 400 }
      );
    }

    // Read file content as text
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(arrayBuffer);

    const { columns, rows, totalRows } = parseCSVText(csvText);

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse any columns from the file. Check the file format.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      columns,
      rows,
      totalRows,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    return NextResponse.json(
      { error: 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}
