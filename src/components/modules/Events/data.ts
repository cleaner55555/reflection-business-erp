export const EVENT_TYPES = [
  "conference",
  "webinar",
  "workshop",
  "meeting",
  "social",
] as const;

export const EVENT_STATUSES = [
  "draft",
  "published",
  "cancelled",
  "completed",
] as const;

export const REG_STATUSES = [
  "registered",
  "checked_in",
  "cancelled",
  "no_show",
] as const;

export const PAYMENT_STATUSES = ["paid", "pending", "failed"] as const;

export const EQUIPMENT_OPTIONS = [
  "projector",
  "wifi",
  "sound",
  "whiteboard",
  "ac",
  "parking",
] as const;

export const TICKET_TIERS = [
  "general",
  "vip",
  "early_bird",
  "student",
] as const;

export const TYPE_KEYS: Record<string, string> = {
  conference: "events.typeConference",
  webinar: "events.typeWebinar",
  workshop: "events.typeWorkshop",
  meeting: "events.typeMeeting",
  social: "events.typeSocial",
};

export const STATUS_KEYS: Record<string, string> = {
  draft: "events.statusDraft",
  published: "events.statusPublished",
  cancelled: "events.statusCancelled",
  completed: "events.statusCompleted",
};

export const REG_STATUS_KEYS: Record<string, string> = {
  registered: "events.statusRegistered",
  checked_in: "events.statusCheckedIn",
  cancelled: "events.statusRegCancelled",
  no_show: "events.statusNoShow",
};

export const PAYMENT_STATUS_KEYS: Record<string, string> = {
  paid: "events.paymentPaid",
  pending: "events.paymentPending",
  failed: "events.paymentFailed",
};

export const TIER_KEYS: Record<string, string> = {
  general: "events.ticketGeneral",
  vip: "events.ticketVIP",
  early_bird: "events.ticketEarlyBird",
  student: "events.ticketStudent",
};

export const EQUIPMENT_KEYS: Record<string, string> = {
  projector: "events.equipmentProjector",
  wifi: "events.equipmentWifi",
  sound: "events.equipmentSound",
  whiteboard: "events.equipmentWhiteboard",
  ac: "events.equipmentAC",
  parking: "events.equipmentParking",
};

export const TYPE_COLORS: Record<string, string> = {
  conference: "bg-violet-100 text-violet-700",
  webinar: "bg-teal-100 text-teal-700",
  workshop: "bg-amber-100 text-amber-700",
  meeting: "bg-sky-100 text-sky-700",
  social: "bg-rose-100 text-rose-700",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-200 text-slate-700",
};

export const REG_STATUS_COLORS: Record<string, string> = {
  registered: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-amber-100 text-amber-700",
};

export const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export const CHART_COLORS = [
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#0ea5e9",
  "#f43f5e",
];

export const venues = [
  "Beograd Hub",
  "Novi Sad Center",
  "Niš Space",
  "Kragujevac Hall",
  "Subotica Venue",
  "Zlatibor Resort",
];

export const organizers = [
  "Marko Petrović",
  "Ana Jovanović",
  "Jelena Stanković",
  "Nikola Đorđević",
  "Ivana Milić",
];

export const types = EVENT_TYPES;

export const statuses: Array<
  "draft" | "published" | "cancelled" | "completed"
> = ["draft", "published", "cancelled", "completed"];

export const titles = [
  "Tech Summit 2025",
  "AI Workshop",
  "Marketing Meetup",
  "DevOps Conference",
  "Startup Pitch Night",
  "UX Design Sprint",
  "Cloud Architecture Day",
  "Data Science Forum",
  "Agile Retrospective",
  "Product Management Circle",
  "Frontend Masters",
  "Cybersecurity Bootcamp",
];

export const month = (i % 12) + 1;

export const day = ((i * 3) % 28) + 1;

export const cap = [100, 50, 80, 200, 30, 60, 150, 120, 40, 70, 90, 110][i];

export const reg = Math.min(cap, Math.floor(cap * (0.3 + Math.random() * 0.7)));

export const price =
  types[i % 5] === "social"
    ? 0
    : [2500, 1500, 3500, 5000, 0, 2000, 4000, 3000, 1800, 2200, 1000, 4500][i];

export const names = [
  "Luka Matić",
  "Sara Popović",
  "Miloš Tanasijević",
  "Nina Vasić",
  "Stefan Ilić",
  "Milica Savić",
  "Andrej Nikolić",
  "Jovana Radovanović",
  "Đorđe Marković",
  "Maja Stojanović",
  "Petar Janković",
  "Katarina Todorović",
  "Vuk Đurđević",
  "Lana Bojović",
  "Nemanja Kostić",
  "Ivana Pavlović",
  "Aleksandar Stojković",
  "Tijana Simić",
  "Bogdan Zlatanović",
  "Emina Hadžić",
];

export const ticketTypes = ["General", "VIP", "Early Bird", "Student"];

export const ev = events[i % events.length];

export const payStatuses: Array<"paid" | "pending" | "failed"> = [
  "paid",
  "pending",
  "failed",
];

export const regStatuses: Array<
  "registered" | "checked_in" | "cancelled" | "no_show"
> = ["registered", "checked_in", "cancelled", "no_show"];

export const tiers = TICKET_TIERS;

export const prices: Record<string, number> = {
  general: 2500,
  vip: 5000,
  early_bird: 1500,
  student: 1000,
};
