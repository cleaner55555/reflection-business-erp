export interface Contact {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  position: string | null; company: string | null; notes: string | null; tags: string | null
  isClient: boolean; isSupplier: boolean; isLead: boolean; createdAt: string
  partner?: { id: string; name: string }

export interface Partner {
  id: string; name: string; pib: string | null; type: string
}

export interface Deal {
  id: string; title: string; value: number; stage: string; probability: number
  score: number; lostReason: string | null; source: string; tags: string | null
  expectedRevenue: number
  assignedTo: string | null; closeDate: string | null; notes: string | null; createdAt: string
  contact?: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }

export interface CrmActivity {
  id: string; type: string; title: string; description: string | null
  dueDate: string | null; completed: boolean; createdAt: string
  contact?: { id: string; firstName: string; lastName: string }
