export interface Webhook {
  id: string;
  companyId: string;
  name: string;
  url: string;
  events: string;
  secret?: string | null;
  headers?: string | null;
  isActive: boolean;
  lastTriggeredAt?: string | null;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}
