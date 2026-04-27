import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const ENTITY_FIELDS: Record<string, string[]> = {
  partners: [
    'name', 'pib', 'maticniBr', 'address', 'city', 'zipCode',
    'phone', 'email', 'type', 'account', 'bank', 'notes',
  ],
  products: [
    'name', 'sku', 'barcode', 'category', 'unit',
    'purchasePrice', 'sellingPrice', 'minStock', 'currentStock',
    'description', 'isActive',
  ],
  transactions: [
    'date', 'type', 'category', 'amount', 'description',
    'documentRef', 'partnerId',
  ],
  contacts: [
    'firstName', 'lastName', 'email', 'phone', 'position',
    'company', 'partnerId', 'notes', 'tags', 'isClient', 'isSupplier', 'isLead',
  ],
};

const ENTITY_LABELS: Record<string, string> = {
  partners: 'Partneri',
  products: 'Proizvodi',
  transactions: 'Transakcije',
  contacts: 'Kontakti',
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  name: 'Naziv (obavezno)',
  pib: 'PIB - Poreski identifikacioni broj (obavezno, jedinstven)',
  maticniBr: 'Matični broj',
  address: 'Adresa',
  city: 'Grad',
  zipCode: 'Poštanski broj',
  phone: 'Telefon',
  email: 'Email adresa',
  type: 'Tip (kupac/dobavljac/partner)',
  account: 'Žiro račun',
  bank: 'Banka',
  notes: 'Napomene',
  sku: 'Šifra (obavezno, jedinstvena)',
  barcode: 'Barkod',
  category: 'Kategorija',
  unit: 'Jedinica mere (kom/kg/l/m/pak)',
  purchasePrice: 'Nabavna cena (broj)',
  sellingPrice: 'Prodajna cena (broj)',
  minStock: 'Minimalna zaliha (broj)',
  currentStock: 'Trenutna zaliha (broj)',
  description: 'Opis',
  isActive: 'Aktivan (true/false)',
  date: 'Datum (format: YYYY-MM-DD)',
  amount: 'Iznos (broj)',
  description: 'Opis',
  documentRef: 'Broj dokumenta',
  partnerId: 'ID partnera',
  firstName: 'Ime',
  lastName: 'Prezime',
  position: 'Pozicija',
  company: 'Kompanija',
  tags: 'Tagovi',
  isClient: 'Da li je klijent (true/false)',
  isSupplier: 'Da li je dobavljač (true/false)',
  isLead: 'Da li je potencijalni klijent (true/false)',
};

// POST /api/integrations/ai-map — AI-suggested column mappings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columns, entityType } = body;

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'columns array is required' },
        { status: 400 }
      );
    }

    if (!entityType || !ENTITY_FIELDS[entityType]) {
      return NextResponse.json(
        { error: `Invalid entityType. Supported: ${Object.keys(ENTITY_FIELDS).join(', ')}` },
        { status: 400 }
      );
    }

    const targetFields = ENTITY_FIELDS[entityType];
    const entityLabel = ENTITY_LABELS[entityType];

    // Build field descriptions for the AI prompt
    const fieldList = targetFields
      .map((f) => `  - ${f}: ${FIELD_DESCRIPTIONS[f] || f}`)
      .join('\n');

    const prompt = `You are a data mapping assistant for a Serbian ERP system called "Reflection Business".

The user wants to import data into the "${entityLabel}" (${entityType}) module.
Available target fields in the system:
${fieldList}

The user's CSV file has these column headers:
${columns.map((c: string) => `  - "${c}"`).join('\n')}

Your task: Map each source column to the best matching target field.
Rules:
- Only map columns that have a clear semantic match
- Do NOT force mappings that don't make sense
- Use the Serbian column name context (e.g., "Naziv" → name, "PIB" → pib, "Šifra" → sku)
- Return ONLY a valid JSON object with source column as key and target field as value
- Columns that cannot be mapped should be omitted from the result

Example response format:
{"Naziv": "name", "PIB": "pib", "Telefon": "phone"}

Return ONLY the JSON object, no explanation, no markdown formatting.`;

    const response = await ZAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data mapping assistant. Always respond with valid JSON only, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content || '{}';

    // Clean up any markdown formatting from the response
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const mapping: Record<string, string> = JSON.parse(cleaned);

    // Validate that all mapped target fields are valid
    const validMapping: Record<string, string> = {};
    for (const [sourceCol, targetField] of Object.entries(mapping)) {
      if (targetFields.includes(targetField)) {
        validMapping[sourceCol] = targetField;
      }
    }

    return NextResponse.json({ mapping: validMapping });
  } catch (error) {
    console.error('Error in AI column mapping:', error);
    return NextResponse.json(
      { error: 'Failed to generate column mapping' },
      { status: 500 }
    );
  }
}
