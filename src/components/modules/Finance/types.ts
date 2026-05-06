export interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  documentRef: string | null;
  partnerId: string | null;
  createdAt: string;
}

export interface CashEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  partnerName: string | null;
  paymentMethod: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  type: string;
  description: string;
  documentNumber: string | null;
  partnerName: string | null;
  debit: number;
  credit: number;
}
