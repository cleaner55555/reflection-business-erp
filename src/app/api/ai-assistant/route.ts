import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `Ti si AI asistent za Reflection Business ERP sistem. Tvoja uloga je da pomažeš korisnicima da upravljaju njihovim poslovnim podacima, analiziraju izveštaje, rade sa fakturama, upravljaju zalihama i obavljaju druge poslovne zadatke.

Korisnik može da te pita o:
- Fakturama (izrada, pregled, plaćanje, status)
- Zalihama i proizvodima (stanje, kretanje, naručivanje)
- Partnerima i klijentima (kontakti, istorija saradnje)
- Finansijskim izveštajima (prihodi, rashodi, bilans)
- CRM aktivnostima (poslovne prilike, kontakti, zadaci)
- Magacinskom poslovanju (prijem, izdavanje, inventura)
- Kamatama i platama
- Opštim ERP funkcionalnostima

Uvek odgovaraj na srpskom jeziku, profesionalno i jasno. Ako korisnik traži podatke koje ne možeš da pristupiš direktno, objasni mu kako može da pristupi tim podacima kroz sistem. Budi kratak i konkretan u odgovorima.`;

// POST /api/ai-assistant — Handle AI chat messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (context && typeof context === 'string') {
      messages.push({ role: 'system', content: `Kontekst korisnika: ${context}` });
    }

    messages.push({ role: 'user', content: message });

    const response = await ZAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    const reply = response.choices?.[0]?.message?.content || 'Izvinjavam se, došlo je do greške pri generisanju odgovora.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error calling AI assistant:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}
