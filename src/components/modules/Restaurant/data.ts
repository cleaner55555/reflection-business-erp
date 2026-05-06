export const TABLE_STATUS_BADGE: Record<string, string> = {
  slobodan: "bg-emerald-50 text-emerald-700 border-emerald-200",
  zauzet: "bg-red-50 text-red-700 border-red-200",
  rezervisan: "bg-amber-50 text-amber-700 border-amber-200",
};

export const TABLE_STATUS_LABEL: Record<string, string> = {
  slobodan: "Slobodan",
  zauzet: "Zauzet",
  rezervisan: "Rezervisan",
};

export const TABLE_STATUS_DOT: Record<string, string> = {
  slobodan: "bg-emerald-500",
  zauzet: "bg-red-500",
  rezervisan: "bg-amber-500",
};

export const ORDER_STATUS_BADGE: Record<string, string> = {
  u_toku: "bg-blue-50 text-blue-700 border-blue-200",
  spremno: "bg-amber-50 text-amber-700 border-amber-200",
  usluženo: "bg-teal-50 text-teal-700 border-teal-200",
  plaćeno: "bg-emerald-50 text-emerald-700 border-emerald-200",
  otkazano: "bg-red-50 text-red-700 border-red-200",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  u_toku: "U toku",
  spremno: "Spremno",
  usluženo: "Usluženo",
  plaćeno: "Plaćeno",
  otkazano: "Otkazano",
};

export const ORDER_TYPE_LABEL: Record<string, string> = {
  restoran: "Restoran",
  porudzbina: "Porudžbina",
  dostava: "Dostava",
};

export const ORDER_TYPE_BADGE: Record<string, string> = {
  restoran: "bg-slate-100 text-slate-700 border-slate-200",
  porudzbina: "bg-violet-50 text-violet-700 border-violet-200",
  dostava: "bg-orange-50 text-orange-700 border-orange-200",
};

export const ITEM_STATUS_LABEL: Record<string, string> = {
  naručeno: "Naručeno",
  u_pripremi: "U pripremi",
  spremno: "Spremno",
  usluženo: "Usluženo",
};

export const ITEM_STATUS_BADGE: Record<string, string> = {
  naručeno: "bg-blue-50 text-blue-600 border-blue-200",
  u_pripremi: "bg-amber-50 text-amber-600 border-amber-200",
  spremno: "bg-teal-50 text-teal-600 border-teal-200",
  usluženo: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export const ORDER_STATUS_FLOW = ["u_toku", "spremno", "usluženo", "plaćeno"];

export const LOCATION_LABELS: Record<string, string> = {
  sprat: "Sprat",
  terasa: "Terasa",
  basta: "Bašta",
  bar: "Bar",
  sala: "Sala",
};
