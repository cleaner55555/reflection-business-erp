import { NextRequest, NextResponse } from 'next/server';

// EPC QR Code generator for Serbian invoices (SEPA)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const iban = searchParams.get('iban') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const recipient = searchParams.get('recipient') || '';
  const reference = searchParams.get('reference') || '';
  const purpose = searchParams.get('purpose') || '';

  if (!iban || !amount) {
    return NextResponse.json({ error: 'iban and amount are required' }, { status: 400 });
  }

  // Generate EPC QR string format
  // Format: Service Tag + Version + Encoding + IBAN + Amount + Purpose + Recipient + Reference
  const serviceTag = 'BCD';
  const version = '002';
  const encoding = '1'; // UTF-8
  const identification = 'SCT'; // SEPA Credit Transfer
  
  const formattedAmount = amount.toFixed(2);

  // Build EPC string
  const epcData = [
    serviceTag,
    version,
    encoding,
    identification,
    iban.replace(/\s/g, ''),
    '', // BIC (optional)
    formattedAmount,
    'EUR', // Currency
    '', // Type (optional)
    '', // Structured reference
    '', // Remittance info (unstructured)
    recipient.substring(0, 70),
    '', // Creditor city
    '', // Creditor country
  ];

  const epcString = epcData.join('\n');

  return NextResponse.json({
    epcString,
    iban,
    amount,
    recipient,
    reference,
    purpose,
    formattedAmount,
  });
}
