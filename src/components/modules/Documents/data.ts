// Static data for Documents module
export const DOCUMENT_TYPES = [
  {
    value: "ugovor",
    label: "Ugovor",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "faktura",
    label: "Faktura",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "potvrda",
    label: "Potvrda",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "obavestenje",
    label: "Obaveštenje",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    value: "izvestaj",
    label: "Izveštaj",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    value: "ostalo",
    label: "Ostalo",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
] as const;

export function getDocumentTypeBadge(type: string) {
  return DOCUMENT_TYPES.find((t) => t.value === type) || DOCUMENT_TYPES[5];
}
