import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Standard Serbian chart of accounts (Kontni plan Republike Srbije)
const SERBIAN_ACCOUNTS = [
  // === KLASS I: DUGOROČNA IMOVINA ===
  { code: '010', name: 'Neotpisani ulozi', type: 'pasivna' },
  { code: '011', name: 'Kapital', type: 'pasivna' },
  { code: '020', name: 'Zadrugarski ulozi', type: 'pasivna' },
  { code: '030', name: 'Rezerve', type: 'pasivna' },
  { code: '040', name: 'Zadržana dobit', type: 'pasivna' },
  { code: '050', name: 'Krediti za investicije', type: 'pasivna' },
  { code: '060', name: 'Dugoročne obaveze za finansiranje', type: 'pasivna' },

  // === KLASS II: DUGOROČNA FINANSIJSKA IMOVINA ===
  { code: '110', name: 'Kapitalni ulozi u duga i hartije', type: 'aktivna' },
  { code: '120', name: 'Dugoročne pozajmice', type: 'aktivna' },
  { code: '130', name: 'Ostala dugoročna finansijska sredstva', type: 'aktivna' },

  // === KLASS III: Osnovna sredstva ===
  { code: '200', name: 'Nedovoljno utrošena sredstva', type: 'aktivna' },
  { code: '210', name: 'Građevinski objekti', type: 'aktivna' },
  { code: '211', name: 'Stambeni objekti', type: 'aktivna' },
  { code: '212', name: 'Poslovni objekti', type: 'aktivna' },
  { code: '220', name: 'Mašine, oprema i vozila', type: 'aktivna' },
  { code: '221', name: 'Mašine i oprema', type: 'aktivna' },
  { code: '222', name: 'Vozila', type: 'aktivna' },
  { code: '230', name: 'Biološka sredstva', type: 'aktivna' },
  { code: '240', name: 'Ostala imovina', type: 'aktivna' },
  { code: '250', name: 'Kumulirana amortizacija', type: 'pasivna' },
  { code: '260', name: 'Izgradnja i nabavka osnovnih sredstava', type: 'aktivna' },

  // === KLASS IV: ZALIHE ===
  { code: '300', name: 'Materijalna zaliha', type: 'aktivna' },
  { code: '310', name: 'Sirovine', type: 'aktivna' },
  { code: '320', name: 'Pomocni materijal', type: 'aktivna' },
  { code: '330', name: 'Gorivo i maziva', type: 'aktivna' },
  { code: '340', name: 'Roba', type: 'aktivna' },
  { code: '350', name: 'Nedovršena proizvodnja', type: 'aktivna' },
  { code: '360', name: 'Gotovi proizvodi', type: 'aktivna' },
  { code: '370', name: 'Ostale zalihe', type: 'aktivna' },
  { code: '380', name: 'Rezervisanje za pad vrednosti zaliha', type: 'pasivna' },

  // === KLASS V: Kratkoročna finansijska imovina ===
  { code: '400', name: 'Kratkoročne hartije od vrednosti', type: 'aktivna' },
  { code: '410', name: 'Potraživanja od kupaca', type: 'aktivna' },
  { code: '411', name: 'Potraživanja od domaćih kupaca', type: 'aktivna' },
  { code: '412', name: 'Potraživanja od inostranih kupaca', type: 'aktivna' },
  { code: '420', name: 'Potraživanja povezana lica', type: 'aktivna' },
  { code: '430', name: 'Ostala potraživanja', type: 'aktivna' },
  { code: '440', name: 'Avansi za nabavku', type: 'aktivna' },
  { code: '450', name: 'Anuiteti', type: 'aktivna' },
  { code: '460', name: 'Gotovina', type: 'aktivna' },
  { code: '461', name: 'Gotovina u blagajni', type: 'aktivna' },
  { code: '462', name: 'Gotovina na računu', type: 'aktivna' },
  { code: '470', name: 'Rezervisanje za potraživanja', type: 'pasivna' },

  // === KLASS VI: OBRTNA IMOVINA ===
  { code: '500', name: 'Troškovi za naredni period', type: 'aktivna' },
  { code: '510', name: 'Priprema proizvodnje', type: 'aktivna' },

  // === KLASS VII: OBAVEZE ===
  { code: '600', name: 'Dugoročne obaveze', type: 'pasivna' },
  { code: '610', name: 'Kratkoročne obaveze', type: 'pasivna' },
  { code: '611', name: 'Obaveze prema dobavljačima', type: 'pasivna' },
  { code: '612', name: 'Obaveze prema domaćim dobavljačima', type: 'pasivna' },
  { code: '613', name: 'Obaveze prema inostranim dobavljačima', type: 'pasivna' },
  { code: '620', name: 'Obaveze iz prometa roba i usluga', type: 'pasivna' },
  { code: '621', name: 'Obaveze prema kupcima (avansi)', type: 'pasivna' },
  { code: '630', name: 'Obaveze prema zaposlenima', type: 'pasivna' },
  { code: '631', name: 'Zarade', type: 'pasivna' },
  { code: '632', name: 'Doprinosi za socijalno osiguranje', type: 'pasivna' },
  { code: '633', name: 'Porez na zarade i doprinose', type: 'pasivna' },
  { code: '640', name: 'Obaveze prema državi', type: 'pasivna' },
  { code: '641', name: 'PDV', type: 'pasivna' },
  { code: '642', name: 'Porez na dobit', type: 'pasivna' },
  { code: '643', name: 'Porez na dodatu vrednost', type: 'pasivna' },
  { code: '650', name: 'Ostale obaveze', type: 'pasivna' },
  { code: '660', name: 'Rezervisanje za obaveze', type: 'pasivna' },
  { code: '670', name: 'Odgode plaćanja', type: 'pasivna' },

  // === KLASS VIII: PRIHODI ===
  { code: '700', name: 'Promet proizvoda', type: 'prihodka' },
  { code: '710', name: 'Promet robe', type: 'prihodka' },
  { code: '711', name: 'Promet robe - domaći', type: 'prihodka' },
  { code: '712', name: 'Promet robe - inostrani', type: 'prihodka' },
  { code: '720', name: 'Promet usluga', type: 'prihodka' },
  { code: '730', name: 'Promet materijala', type: 'prihodka' },
  { code: '740', name: 'Prihodi od nerealizovanih kursa', type: 'prihodka' },
  { code: '750', name: 'Prihodi od ostale prodaje', type: 'prihodka' },
  { code: '760', name: 'Prihodi od finansijskih ulaganja', type: 'prihodka' },
  { code: '770', name: 'Ostali poslovni prihodi', type: 'prihodka' },
  { code: '780', name: 'Vanposlovni prihodi', type: 'prihodka' },
  { code: '790', name: 'Knjigovodstvena korekcija prihoda', type: 'prihodka' },

  // === KLASS IX: RASHODI ===
  { code: '800', name: 'Troškovi materijala', type: 'rashodna' },
  { code: '810', name: 'Troškovi zarada', type: 'rashodna' },
  { code: '811', name: 'Brute zarade', type: 'rashodna' },
  { code: '812', name: 'Doprinosi za socijalno osiguranje', type: 'rashodna' },
  { code: '820', name: 'Troškovi amortizacije', type: 'rashodna' },
  { code: '830', name: 'Troškovi usluga', type: 'rashodna' },
  { code: '831', name: 'Troškovi najma', type: 'rashodna' },
  { code: '832', name: 'Troškovi komunalnih usluga', type: 'rashodna' },
  { code: '833', name: 'Troškovi održavanja', type: 'rashodna' },
  { code: '834', name: 'Troškovi transporta', type: 'rashodna' },
  { code: '835', name: 'Troškovi reklamiranja', type: 'rashodna' },
  { code: '836', name: 'Troškovi putovanja', type: 'rashodna' },
  { code: '837', name: 'Bankarina i provizije', type: 'rashodna' },
  { code: '838', name: 'Ostali troškovi usluga', type: 'rashodna' },
  { code: '840', name: 'Ostali rashodi', type: 'rashodna' },
  { code: '841', name: 'Troškovi osiguranja', type: 'rashodna' },
  { code: '842', name: 'Zamki', type: 'rashodna' },
  { code: '843', name: 'Razlike u kamatama', type: 'rashodna' },
  { code: '844', name: 'Gubitci od realizacije', type: 'rashodna' },
  { code: '845', name: 'Nerealizovani kursni gubitci', type: 'rashodna' },
  { code: '850', name: 'Vanposlovni rashodi', type: 'rashodna' },
  { code: '860', name: 'Porez na dobit', type: 'rashodna' },
  { code: '870', name: 'Knjigovodstvena korekcija rashoda', type: 'rashodna' },

  // === KLASS 0: KONTNA KLASA (ZAVRŠNI KONTO) ===
  { code: '900', name: 'Poslovni rezultat', type: 'kontna' },
  { code: '910', name: 'Rezultat tekućeg perioda', type: 'kontna' },
  { code: '920', name: 'Rezultat prethodnih perioda', type: 'kontna' },
  { code: '990', name: 'Bilans uspeha', type: 'kontna' },
] as const

export async function GET() {
  try {
    // Check if any accounts already exist
    const existing = await db.account.findMany({ select: { code: true } })
    const existingCodes = new Set(existing.map(a => a.code))

    // Filter out already existing accounts
    const toImport = SERBIAN_ACCOUNTS.filter(a => !existingCodes.has(a.code))

    return NextResponse.json({
      totalAccounts: SERBIAN_ACCOUNTS.length,
      existingCount: existingCodes.size,
      toImportCount: toImport.length,
      accounts: toImport,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { skipExisting = true } = body

    const existing = await db.account.findMany({ select: { code: true } })
    const existingCodes = new Set(existing.map(a => a.code))

    const accountsToCreate = skipExisting
      ? SERBIAN_ACCOUNTS.filter(a => !existingCodes.has(a.code))
      : SERBIAN_ACCOUNTS

    if (accountsToCreate.length === 0) {
      return NextResponse.json({
        message: 'Svi kontovi su već uvezeni',
        imported: 0,
        skipped: SERBIAN_ACCOUNTS.length,
      })
    }

    // Create accounts in batches
    let imported = 0
    for (const acc of accountsToCreate) {
      try {
        await db.account.create({
          data: {
            code: acc.code,
            name: acc.name,
            type: acc.type,
            parentCode: acc.code.length > 3 ? acc.code.slice(0, -1) + '0' : null,
          },
        })
        imported++
      } catch {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      message: `Uspešno uvezeno ${imported} konta`,
      imported,
      skipped: accountsToCreate.length - imported,
      totalAvailable: SERBIAN_ACCOUNTS.length,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
