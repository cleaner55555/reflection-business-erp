// Static data for FieldService module
export const JOB_STATUSES = [
  {
    value: "scheduled",
    label: "Zakazano",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "in_progress",
    label: "U toku",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "completed",
    label: "Završeno",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "cancelled",
    label: "Otkazano",
    color: "bg-red-50 text-red-700 border-red-200",
  },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Nizak", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Srednji", color: "bg-amber-100 text-amber-700" },
  { value: "high", label: "Visok", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Hitan", color: "bg-red-100 text-red-700" },
] as const;

export function getJobStatusBadge(status: string) {
  return JOB_STATUSES.find((s) => s.value === status) || JOB_STATUSES[0];
}
