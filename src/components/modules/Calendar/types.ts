export interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  color: string;
  type: string;
  createdAt: string;
  location?: string | null;
  attendees?: string;
  reminder?: string | null;
  recurrence?: string | null;
  priority?: string;
}
