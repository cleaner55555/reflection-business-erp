import { NextResponse } from 'next/server';

interface ColumnMapping {
  [sourceCol: string]: string;
}

interface Template {
  source: string;
  sourceLabel: string;
  entityType: string;
  entityTypeLabel: string;
  mapping: ColumnMapping;
}

const templates: Template[] = [
  // ───── Biznis Navigator ─────
  {
    source: 'biznis_navigator',
    sourceLabel: 'Biznis Navigator',
    entityType: 'partners',
    entityTypeLabel: 'Partneri',
    mapping: {
      'Naziv': 'name',
      'PIB': 'pib',
      'Matični broj': 'maticniBr',
      'Adresa': 'address',
      'Grad': 'city',
      'Poštanski broj': 'zipCode',
      'Telefon': 'phone',
      'Email': 'email',
      'Tip': 'type',
      'Žiro račun': 'account',
      'Banka': 'bank',
    },
  },
  {
    source: 'biznis_navigator',
    sourceLabel: 'Biznis Navigator',
    entityType: 'products',
    entityTypeLabel: 'Proizvodi',
    mapping: {
      'Naziv': 'name',
      'Šifra': 'sku',
      'Barkod': 'barcode',
      'Kategorija': 'category',
      'Jedinica mere': 'unit',
      'Nabavna cena': 'purchasePrice',
      'Prodajna cena': 'sellingPrice',
      'Minimalna zaliha': 'minStock',
      'Opis': 'description',
    },
  },

  // ───── Pantheon ─────
  {
    source: 'pantheon',
    sourceLabel: 'Pantheon',
    entityType: 'partners',
    entityTypeLabel: 'Partneri',
    mapping: {
      'Naziv partnera': 'name',
      'PIB': 'pib',
      'Matični broj': 'maticniBr',
      'Ulica i broj': 'address',
      'Mesto': 'city',
      'Poštanski broj': 'zipCode',
      'Telefon': 'phone',
      'E-pošta': 'email',
      'Vrsta partnera': 'type',
      'Tekući račun': 'account',
      'Banka': 'bank',
    },
  },
  {
    source: 'pantheon',
    sourceLabel: 'Pantheon',
    entityType: 'products',
    entityTypeLabel: 'Proizvodi',
    mapping: {
      'Naziv artikla': 'name',
      'Šifra artikla': 'sku',
      'Barkod': 'barcode',
      'Grupa artikla': 'category',
      'JM': 'unit',
      'Nabavna cena': 'purchasePrice',
      'Prodajna cena': 'sellingPrice',
      'Minimalna količina': 'minStock',
      'Napomena': 'description',
    },
  },

  // ───── Minimax ─────
  {
    source: 'minimax',
    sourceLabel: 'Minimax',
    entityType: 'partners',
    entityTypeLabel: 'Partneri',
    mapping: {
      'Naziv': 'name',
      'PIB': 'pib',
      'MB': 'maticniBr',
      'Ulica': 'address',
      'Grad': 'city',
      'PTT': 'zipCode',
      'Telefon': 'phone',
      'Email': 'email',
      'Tip': 'type',
      'Broj računa': 'account',
      'Naziv banke': 'bank',
    },
  },
  {
    source: 'minimax',
    sourceLabel: 'Minimax',
    entityType: 'products',
    entityTypeLabel: 'Proizvodi',
    mapping: {
      'Naziv robe': 'name',
      'Šifra': 'sku',
      'Črtna koda': 'barcode',
      'Vrsta robe': 'category',
      'Enota mere': 'unit',
      'Nabavna cena': 'purchasePrice',
      'Prodajna cena': 'sellingPrice',
      'Min zaliha': 'minStock',
      'Opis': 'description',
    },
  },

  // ───── eFakture ─────
  {
    source: 'eFakture',
    sourceLabel: 'eFakture',
    entityType: 'partners',
    entityTypeLabel: 'Partneri',
    mapping: {
      'Ime kompanije': 'name',
      'PIB': 'pib',
      'Matični broj': 'maticniBr',
      'Adresa': 'address',
      'Grad': 'city',
      'Poštanski broj': 'zipCode',
      'Kontakt telefon': 'phone',
      'E-mail': 'email',
    },
  },
  {
    source: 'eFakture',
    sourceLabel: 'eFakture',
    entityType: 'transactions',
    entityTypeLabel: 'Transakcije',
    mapping: {
      'Datum': 'date',
      'Tip': 'type',
      'Kategorija': 'category',
      'Iznos': 'amount',
      'Opis': 'description',
      'Broj dokumenta': 'documentRef',
    },
  },

  // ───── Custom CSV ─────
  {
    source: 'custom',
    sourceLabel: 'Custom CSV',
    entityType: 'partners',
    entityTypeLabel: 'Partneri',
    mapping: {},
  },
  {
    source: 'custom',
    sourceLabel: 'Custom CSV',
    entityType: 'products',
    entityTypeLabel: 'Proizvodi',
    mapping: {},
  },
  {
    source: 'custom',
    sourceLabel: 'Custom CSV',
    entityType: 'transactions',
    entityTypeLabel: 'Transakcije',
    mapping: {},
  },
  {
    source: 'custom',
    sourceLabel: 'Custom CSV',
    entityType: 'contacts',
    entityTypeLabel: 'Kontakti',
    mapping: {},
  },
];

// GET /api/integrations/templates — Return predefined ERP templates
export async function GET() {
  try {
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching integration templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
