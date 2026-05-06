export const channelTypeConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  general: { label: "Opšte", color: "bg-gray-100 text-gray-700", icon: "#" },
  project: { label: "Projekat", color: "bg-blue-100 text-blue-700", icon: "#" },
  team: { label: "Tim", color: "bg-green-100 text-green-700", icon: "#" },
  private: {
    label: "Privatno",
    color: "bg-purple-100 text-purple-700",
    icon: "🔒",
  },
  announcement: {
    label: "Obaveštenje",
    color: "bg-amber-100 text-amber-700",
    icon: "📢",
  },
};

export const emptyForm = { name: "", description: "", type: "general" };
