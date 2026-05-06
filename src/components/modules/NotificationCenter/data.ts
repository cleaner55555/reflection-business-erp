export const map: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-muted text-muted-foreground',
  }

export const labels: Record<string, string> = {
    urgent: t('notifications.priorityUrgent'),
    high: t('notifications.priorityHigh'),
    medium: t('notifications.priorityMedium'),
    low: t('notifications.priorityLow'),
  }

export const now = new Date();

export const date = new Date(dateStr);

export const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

export const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86400000);
