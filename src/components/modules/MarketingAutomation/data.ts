export const triggerConfig: Record<string, { label: string; color: string }> = {
  new_lead: { label: "Novi lead", color: "bg-green-100 text-green-700" },
  cart_abandoned: {
    label: "Napuštena korpa",
    color: "bg-amber-100 text-amber-700",
  },
  purchase: { label: "Kupovina", color: "bg-blue-100 text-blue-700" },
  invoice_overdue: {
    label: "Prekoračen rok",
    color: "bg-red-100 text-red-700",
  },
  subscription_expired: {
    label: "Istek pretplate",
    color: "bg-purple-100 text-purple-700",
  },
  birthday: { label: "Rođendan", color: "bg-pink-100 text-pink-700" },
  inactivity: { label: "Neaktivnost", color: "bg-gray-100 text-gray-700" },
  custom: { label: "Custom", color: "bg-teal-100 text-teal-700" },
};

export const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktivna", color: "bg-green-100 text-green-700" },
  paused: { label: "Pauzirana", color: "bg-amber-100 text-amber-700" },
  draft: { label: "Nacrt", color: "bg-gray-100 text-gray-700" },
  error: { label: "Greška", color: "bg-red-100 text-red-700" },
};

export const { activeCompanyId } = useAppStore();
