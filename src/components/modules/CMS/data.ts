export const statusConfig: Record<string, { label: string; color: string }> = {
  published: {
    label: "Objavljeno",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  draft: {
    label: "Nacrt",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  scheduled: {
    label: "Zakazano",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  archived: {
    label: "Arhivirano",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const statusWorkflow = [
  "draft",
  "scheduled",
  "published",
  "archived",
] as const;

export const CHART_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export const mediaTypeColors: Record<string, string> = {
  image:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  video:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  audio:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  icon: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export const supportedLocales = [
  { code: "sr", name: "Српски", flag: "🇷🇸" },
  { code: "sr-latn", name: "Srpski (latinica)", flag: "🇷🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export const sitemapItems = [
  {
    url: "/o-nama",
    priority: 0.8,
    changefreq: "monthly",
    lastMod: "2025-01-01",
  },
  {
    url: "/kontakt",
    priority: 0.7,
    changefreq: "monthly",
    lastMod: "2025-01-01",
  },
  {
    url: "/blog/seo-strategija-2025",
    priority: 0.9,
    changefreq: "weekly",
    lastMod: "2025-01-15",
  },
  {
    url: "/blog/react-server-components",
    priority: 0.9,
    changefreq: "weekly",
    lastMod: "2025-01-20",
  },
];

export const relationTypeConfig: Record<
  string,
  { label: string; color: string }
> = {
  related: {
    label: "Srodan",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  translation: {
    label: "Prevod",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  series: {
    label: "Serija",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  reference: {
    label: "Referenca",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9šđčćžŠĐČĆŽ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function scoreColor(score: number): string {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function emptyForm() {
  return {
    title: "",
    slug: "",
    typeId: "ct-1",
    categoryId: "",
    authorId: "",
    status: "draft",
    content: "",
    excerpt: "",
    featuredImage: "",
    tags: [] as string[],
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    scheduledAt: "",
    locale: "sr",
  };
}
