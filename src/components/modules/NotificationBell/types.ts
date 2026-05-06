export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  priority: string;
  actionUrl?: string | null;
  createdAt: string;
}
