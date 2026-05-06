export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Na čekanju", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Odobreno", color: "bg-green-100 text-green-700" },
  rejected: { label: "Odbijeno", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Otkazano", color: "bg-gray-100 text-gray-700" },
};

export const typeLabels: Record<string, string> = {
  vacation: "Godišnji odmor",
  sick: "Bolovanje",
  personal: "Slobodan dan",
  maternity: "Porodiljsko",
  unpaid: "Neplaćeni",
  education: "Edukacija",
};

export const { activeCompanyId } = useAppStore();
