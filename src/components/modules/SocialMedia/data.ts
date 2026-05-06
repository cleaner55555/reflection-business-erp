import type { PostFormData } from "./types";

export const platformConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  facebook: {
    label: "Facebook",
    color: "bg-blue-100 text-blue-700",
    icon: "📘",
  },
  instagram: {
    label: "Instagram",
    color: "bg-pink-100 text-pink-700",
    icon: "📸",
  },
  linkedin: { label: "LinkedIn", color: "bg-sky-100 text-sky-700", icon: "💼" },
  twitter: {
    label: "X (Twitter)",
    color: "bg-gray-100 text-gray-700",
    icon: "🐦",
  },
  tiktok: { label: "TikTok", color: "bg-gray-900 text-white", icon: "🎵" },
  youtube: { label: "YouTube", color: "bg-red-100 text-red-700", icon: "🎬" },
};

export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Nacrt", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "Zakazano", color: "bg-amber-100 text-amber-700" },
  published: { label: "Objavljeno", color: "bg-green-100 text-green-700" },
  failed: { label: "Greška", color: "bg-red-100 text-red-700" },
};

export const emptyForm: PostFormData = {
  platform: "facebook",
  content: "",
  scheduledDate: "",
  status: "draft",
};
