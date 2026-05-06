export const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Na čekanju", color: "bg-amber-100 text-amber-700" },
  in_progress: { label: "U toku", color: "bg-blue-100 text-blue-700" },
  passed: { label: "Prošlo", color: "bg-green-100 text-green-700" },
  failed: { label: "Palo", color: "bg-red-100 text-red-700" },
};

export const typeLabels: Record<string, string> = {
  incoming: "Dolazna kontrola",
  in_process: "Kontrola u toku",
  final: "Finalna kontrola",
  audit: "Audit",
};

export const { activeCompanyId } = useAppStore();
