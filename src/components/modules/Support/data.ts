export const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Otvoren", color: "bg-red-100 text-red-700" },
  in_progress: { label: "U toku", color: "bg-amber-100 text-amber-700" },
  waiting: { label: "Čeka odgovor", color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Rešeno", color: "bg-green-100 text-green-700" },
  closed: { label: "Zatvoreno", color: "bg-gray-100 text-gray-700" },
};

export const priorityConfig: Record<string, { label: string; color: string }> =
  {
    low: { label: "Nizak", color: "bg-gray-100 text-gray-700" },
    medium: { label: "Srednji", color: "bg-amber-100 text-amber-700" },
    high: { label: "Visok", color: "bg-orange-100 text-orange-700" },
    critical: { label: "Kritičan", color: "bg-red-100 text-red-700" },
  };

export const categoryLabels: Record<string, string> = {
  technical: "Tehnički",
  billing: "Naplata",
  general: "Opšte",
  feature: "Funkcionalnost",
  bug: "Greška",
};

export const { activeCompanyId } = useAppStore();
