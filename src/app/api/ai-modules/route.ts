import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard (Pregled)' },
  { id: 'finansije', label: 'Finansije (novčani tokovi, budžeti)' },
  { id: 'fakture', label: 'Fakture (izlazne, ulazne, predračuni)' },
  { id: 'ponude', label: 'Ponude i predračuni' },
  { id: 'magacin', label: 'Magacin (zalihe, proizvodi)' },
  { id: 'nabavka', label: 'Nabavka (narudžbenice, dobavljači)' },
  { id: 'bank-sync', label: 'Banka (sync, izvodi, plaćanja)' },
  { id: 'pos', label: 'POS Maloprodaja (kase, terminal)' },
  { id: 'shipping', label: 'Shipping i logistika (pošiljke)' },
  { id: 'proizvodnja', label: 'Proizvodnja (radni nalozi, recepture)' },
  { id: 'troškovi', label: 'Troškovi (praćenje režija)' },
  { id: 'pretplate', label: 'Pretplate (ponavljajuće fakture)' },
  { id: 'crm', label: 'CRM (kontakti, prilike, pipeline)' },
  { id: 'partneri', label: 'Partneri (kupci, dobavljači)' },
  { id: 'kalendar', label: 'Kalendar (termini, zadaci)' },
  { id: 'marketplace', label: 'Marketplace (online prodaja)' },
  { id: 'podrska', label: 'Podrška (ticketi, helpdesk)' },
  { id: 'potpisi', label: 'Potpisi (digitalni potpis)' },
  { id: 'zaposleni', label: 'Zaposleni (HR, plata, evidencija)' },
  { id: 'odsustva', label: 'Odsustva (godisnji, bolovanje)' },
  { id: 'regrutacija', label: 'Regrutacija (oglasi, kandidati)' },
  { id: 'preporuke', label: 'Preporuke (referral program)' },
  { id: 'projekti', label: 'Projekti (taskovi, vremenski trag)' },
  { id: 'zakazivanja', label: 'Zakazivanja (termini, kalendar)' },
  { id: 'planer', label: 'Planer (resursi, raspored)' },
  { id: 'sredstva', label: 'Osnovna sredstva (inventar, amortizacija)' },
  { id: 'odrzavanje', label: 'Održavanje (servisi, preventiva)' },
  { id: 'kvalitet', label: 'Kvalitet (kontrola, normativ)' },
  { id: 'dokumenta', label: 'Dokumenta (arhiva, predlošci)' },
  { id: 'knjigovodstvo', label: 'Knjigovodstvo (nalogi, kartice)' },
  { id: 'protokol', label: 'Protokol (korisnički zahtevi)' },
  { id: 'edukacija', label: 'Edukacija (treningi, sertifikati)' },
  { id: 'baza-znanja', label: 'Baza znanja (članci, FAQ)' },
  { id: 'email-marketing', label: 'Email marketing (kampanje)' },
  { id: 'drustvene-mreze', label: 'Društvene mreže (content)' },
  { id: 'sms-marketing', label: 'SMS marketing (kampanje)' },
  { id: 'dogadjaji', label: 'Događaji (organizacija, ticketi)' },
  { id: 'mkt-automatizacija', label: 'MKT automatizacija (workflows)' },
  { id: 'ankete', label: 'Ankete (ispitivanja)' },
  { id: 'vozni-park', label: 'Vožni park (vozila, troškovi)' },
  { id: 'kafe-restoran', label: 'Kafe/Restoran (meni, narudžbe)' },
  { id: 'rent-a-car', label: 'Rent-a-car (rezervacije, vozila)' },
  { id: 'terenski-servis', label: 'Terenski servis (radnici na terenu)' },
  { id: 'chet', label: 'Čet (interni chat)' },
  { id: 'beleske', label: 'Beleške (zadaci, napomene)' },
  { id: 'odobrenja', label: 'Odobrenja (workflow approval)' },
  { id: 'vestine', label: 'Veštine (kompetencije zaposlenih)' },
  { id: 'ugovori', label: 'Ugovori (upravljanje ugovorima)' },
  { id: 'website', label: 'Website builder' },
  { id: 'blog', label: 'Blog' },
  { id: 'voip', label: 'VoIP (telefonija)' },
  { id: 'iot', label: 'IoT (senzori, uredjaji)' },
  { id: 'whatsapp', label: 'WhatsApp (komunikacija)' },
  { id: 'forum', label: 'Forum (diskusije)' },
  { id: 'plm', label: 'PLM (upravljanje životnim ciklusom)' },
  { id: 'ecommerce', label: 'ECommerce (online prodaja)' },
  { id: 'spreadsheet', label: 'Spreadsheet (tabele)' },
  { id: 'cms', label: 'CMS (sadržaj)' },
  { id: 'ocene', label: 'Ocene (performanse)' },
  { id: 'gamifikacija', label: 'Gamifikacija' },
  { id: 'reklamacije', label: 'Reklamacije' },
  { id: 'natečaji', label: 'Natečaji (tenderi)' },
  { id: 'garancije', label: 'Garancije' },
  { id: 'servis', label: 'Servis centar' },
  { id: 'uskladenost', label: 'Usklađenost (compliance)' },
  { id: 'program-lojalnosti', label: 'Program lojalnosti' },
  { id: 'planer-radne-sile', label: 'Planer radne snage' },
  { id: 'posetioci', label: 'Posetioci (evidencija)' },
  { id: 'predlozi', label: 'Predlozi (poboljšanja)' },
  { id: 'taksacija', label: 'Taksacija (procena)' },
  { id: 'fond-zdravlja', label: 'Fond zdravlja' },
  { id: 'geolokacija', label: 'Geolokacija' },
  { id: 'kamere', label: 'Kamere (video nadzor)' },
  { id: 'menadzer-nabavke', label: 'Menadžer nabavke' },
  { id: 'izvestaji', label: 'Izveštaji (analitika)' },
  { id: 'integracije', label: 'Integracije (API, konekcije)' },
  { id: 'zakoni', label: 'Zakoni (pravna regulativa)' },
  { id: 'podesavanja', label: 'Podešavanja (sistem)' },
]

const MODULE_ID_LIST = ALL_MODULES.map(m => m.id).join(', ')

const SYSTEM_PROMPT = `Ti si AI asistent za Reflection Business ERP sistem. Tvoj zadatak je da analiziraš opis poslovanja korisnika i odabereš KOJI MODULE su mu potrebni.

DOSTUPNI MODULI (samo ID-jevi):
${ALL_MODULES.map(m => `- ${m.id}: ${m.label}`).join('\n')}

PRAVILA:
1. UVEK uključi: dashboard, podesavanja, izvestaji
2. Odaberi SAMO module koji su stvarno potrebni za opisano poslovanje
3. Ne odabiraj module koji nisu relevantni — bolje manje nego više
4. Ako korisnik kaže "automehaničarska radnja" → terenski-servis, servis, magacin, partneri, fakture, finansije, garancije, reklamacije, zaposleni, odrzavanje, sredstva, taksacija, zakazivanja, uredjaji
5. Ako korisnik kaže "banka" → finansije, fakture, partneri, troškovi, knjigovodstvo, dokumenta, izveštaji, uskladenost, ugovori, podrska
6. Ako korisnik kaže "veleprodaja" → magacin, fakture, partneri, nabavka, menadzer-nabavke, shipping, proizvodnja, cene, pos, finansije, izveštaji
7. Ako korisnik kaže "maloprodaja" → pos, magacin, fakture, partneri, cene, kasa, finansije, izveštaji
8. Ako korisnik kaže "kafe restoran" → kafe-restoran, magacin, fakture, finansije, zaposleni, zakazivanja, planer
9. Ako korisnik kaže "gradjevina" → projekti, magacin, nabavka, sredstva, troškovi, fakture, partneri, dokumenta, taksacija, geolokacija
10. Ako korisnik kaže "pravna firma" → ugovori, dokumenta, partneri, fakture, knjigovodstvo, kalendar, izveštaji
11. Razumi šta korisnik kuca - može biti na srpskom, engleskom, ili slengu
12. Budi pametan — ako neko kaže "prodajem online" → ecommerce, website, marketing, fakture, partneri

VRATI SAMO JSON (bez code block, bez markdown):
{
  "modules": ["id1", "id2", ...],
  "industry": "Naziv industrije",
  "explanation": "Kratak objašnjaj na srpskom zašto su ti moduli odabrani (2-3 rečenice)"
}

VAŽNO: Vrati SAMO JSON objekat, bez ikakvog dodatnog teksta.`

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Opis je obavezan' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = response.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    let parsed: { modules: string[]; industry: string; explanation: string }
    try {
      // Try direct parse
      parsed = JSON.parse(raw.trim())
    } catch {
      // Try extracting from code block
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        parsed = JSON.parse(match[1].trim())
      } else {
        // Fallback: try to find JSON in text
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          return NextResponse.json({
            error: 'Greška pri analizi. Pokušajte ponovo.',
          }, { status: 500 })
        }
      }
    }

    // Ensure required fields
    if (!parsed.modules || !Array.isArray(parsed.modules)) {
      parsed.modules = []
    }

    // Always include core modules
    const coreModules = ['dashboard', 'podesavanja', 'izvestaji']
    const allSelected = [...new Set([...coreModules, ...parsed.modules])]

    // Validate module IDs
    const validIds = new Set(ALL_MODULES.map(m => m.id))
    const validModules = allSelected.filter(id => validIds.has(id))

    return NextResponse.json({
      modules: validModules,
      industry: parsed.industry || 'Opšte poslovanje',
      explanation: parsed.explanation || 'AI je analizirao vaše potrebe i odabrao relevantne module.',
    })
  } catch (error) {
    console.error('AI module selection error:', error)
    return NextResponse.json({
      error: 'Greška pri analizi. Pokušajte ponovo.',
    }, { status: 500 })
  }
}
