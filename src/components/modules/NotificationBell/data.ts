export const now = new Date();

export const date = new Date(dateStr);

export const diffMs = now.getTime() - date.getTime();

export const diffMin = Math.floor(diffMs / 60000);

export const diffH = Math.floor(diffMs / 3600000);

export const diffD = Math.floor(diffMs / 86400000);
