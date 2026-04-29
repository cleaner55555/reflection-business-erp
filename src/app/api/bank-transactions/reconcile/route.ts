import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ReconcileResult {
  transactionId: string;
  invoiceId: string;
  confidence: number;
  reason: string;
  amount: number;
  invoiceNumber: string;
  partnerName: string;
}

// POST /api/bank-transactions/reconcile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankAccountId } = body;

    if (!bankAccountId) {
      return NextResponse.json({ error: 'bankAccountId is required' }, { status: 400 });
    }

    // Get all unreconciled incoming transactions (positive amounts)
    const transactions = await db.bankTransaction.findMany({
      where: {
        bankAccountId,
        isReconciled: false,
        amount: { gt: 0 },
      },
      include: {
        bankAccount: true,
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        matched: [],
        unmatched: [],
        total: 0,
      });
    }

    // Get all unpaid invoices
    const invoices = await db.invoice.findMany({
      where: {
        status: { in: ['poslata', 'nacrt'] },
        type: 'izlazna',
      },
      include: {
        partner: { select: { name: true, pib: true } },
      },
    });

    const matched: ReconcileResult[] = [];
    const unmatched: string[] = [];

    for (const tx of transactions) {
      let bestMatch: ReconcileResult | null = null;
      let bestConfidence = 0;

      for (const inv of invoices) {
        // Skip already matched invoices
        if (matched.some((m) => m.invoiceId === inv.id)) continue;

        // 1. Check amount match (exact or within 1%)
        const amountDiff = Math.abs(tx.amount - inv.totalAmount);
        const amountThreshold = inv.totalAmount * 0.01;
        const exactAmountMatch = amountDiff < 0.01;
        const closeAmountMatch = amountDiff <= amountThreshold;

        if (!closeAmountMatch) continue;

        let confidence = 50;
        const reasons: string[] = [];

        if (exactAmountMatch) {
          confidence += 20;
          reasons.push('exact_amount');
        } else {
          confidence += 10;
          reasons.push('close_amount');
        }

        // 2. Check if invoice number appears in transaction description
        if (tx.description && inv.number && tx.description.includes(inv.number)) {
          confidence += 25;
          reasons.push('invoice_number_in_desc');
        }

        // 3. Check if partner PIB appears in transaction description
        if (tx.description && inv.partner?.pib && tx.description.includes(inv.partner.pib)) {
          confidence += 20;
          reasons.push('pib_in_desc');
        }

        // 4. Check if partner name appears in transaction description or counterpart
        const partnerName = inv.partner?.name?.toLowerCase() || '';
        if (partnerName) {
          if (tx.description && tx.description.toLowerCase().includes(partnerName)) {
            confidence += 15;
            reasons.push('partner_name_in_desc');
          }
          if (tx.counterpart && tx.counterpart.toLowerCase().includes(partnerName)) {
            confidence += 15;
            reasons.push('partner_name_in_counterpart');
          }
        }

        // 5. Check if payment reference contains invoice info
        if (tx.reference && inv.number && tx.reference.includes(inv.number)) {
          confidence += 20;
          reasons.push('invoice_number_in_reference');
        }

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = {
            transactionId: tx.id,
            invoiceId: inv.id,
            confidence,
            reason: reasons.join(', '),
            amount: tx.amount,
            invoiceNumber: inv.number,
            partnerName: inv.partner?.name || '',
          };
        }
      }

      if (bestMatch && bestConfidence >= 60) {
        matched.push(bestMatch);
      } else {
        unmatched.push(tx.id);
      }
    }

    // Apply matches with high confidence (>= 85)
    const autoApplied = [];
    const suggestedMatches = [];

    for (const match of matched) {
      if (match.confidence >= 85) {
        // Auto-apply: link transaction to invoice and mark invoice as paid
        await db.bankTransaction.update({
          where: { id: match.transactionId },
          data: {
            isReconciled: true,
            invoiceId: match.invoiceId,
          },
        });

        await db.invoice.update({
          where: { id: match.invoiceId },
          data: { status: 'placena' },
        });

        // Create internal transaction record
        await db.transaction.create({
          data: {
            date: new Date(),
            type: 'prihod',
            category: 'promet',
            amount: match.amount,
            description: `Banka: plaćena faktura ${match.invoiceNumber} - ${match.partnerName}`,
            documentRef: match.invoiceNumber,
          },
        });

        autoApplied.push(match);
      } else {
        suggestedMatches.push(match);
      }
    }

    return NextResponse.json({
      autoApplied,
      suggestedMatches,
      unmatched,
      total: transactions.length,
      autoMatched: autoApplied.length,
      manualNeeded: suggestedMatches.length,
    });
  } catch (error) {
    console.error('Error reconciling bank transactions:', error);
    return NextResponse.json({ error: 'Failed to reconcile bank transactions' }, { status: 500 });
  }
}
