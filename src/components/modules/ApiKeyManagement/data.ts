// ApiKeyManagement module – static data & pure helpers

// ---- Framer Motion animation variants ----

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ---- Pure helpers ----

export function maskKey(key: string): string {
  if (!key) return '';
  if (key.includes('...')) return key; // already masked
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const expires = new Date(dateStr);
  const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
