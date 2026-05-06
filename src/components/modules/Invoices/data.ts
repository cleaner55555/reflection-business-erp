export const COMPANY = {
  name: "Reflection Business",
  address: "Bulevar Mihajla Pupina 10a",
  city: "Beograd, 11070",
  pib: "123456789",
  maticniBr: "21012345",
  account: "265-12345678-12",
  bank: "Banca Intesa Beograd",
  phone: "+381 11 123 4567",
  email: "office@reflectionbusiness.rs",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  not_sent: "Nije poslata",
  sent: "Poslata",
  accepted: "Prihvaćena",
  rejected: "Odbijena",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  not_sent: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function calcItemBase(item: {
  quantity: number;
  unitPrice: number;
  discountPct?: number;
}) {
  const subtotal = item.quantity * item.unitPrice;
  const discount = subtotal * ((item.discountPct || 0) / 100);
  return subtotal - discount;
}

export function calcItemTax(item: {
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
}) {
  return calcItemBase(item) * ((item.taxRate || 20) / 100);
}

export function calcItemTotal(item: {
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
}) {
  return calcItemBase(item) + calcItemTax(item);
}

export function getSefStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    not_sent: "Nije poslata",
    sent: "Poslata",
    accepted: "Prihvaćena",
    rejected: "Odbijena",
  };
  return labels[status || "not_sent"] || status || "Nije poslata";
}

export function getSefStatusColor(status: string | null): string {
  const colors: Record<string, string> = {
    not_sent: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    colors[status || "not_sent"] ||
    "bg-slate-100 text-slate-600 border-slate-200"
  );
}

export function numberToSerbian(amount: number): string {
  if (amount === 0) return "nula dinara";

  const units = [
    "",
    "jedan",
    "dva",
    "tri",
    "četiri",
    "pet",
    "šest",
    "sedam",
    "osam",
    "devet",
  ];
  const teens = [
    "deset",
    "jedanaest",
    "dvanaest",
    "trinaest",
    "četrnaest",
    "petnaest",
    "šesnaest",
    "sedamnaest",
    "osamnaest",
    "devetnaest",
  ];
  const tensArr = [
    "",
    "",
    "dvadeset",
    "trideset",
    "četrdeset",
    "pedeset",
    "šezdeset",
    "sedamdeset",
    "osamdeset",
    "devedeset",
  ];
  const hundreds = [
    "",
    "sto",
    "dvesto",
    "tristo",
    "četristo",
    "petsto",
    "šestosto",
    "sedamsto",
    "osamsto",
    "devetsto",
  ];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    let result = "";
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;
    if (h > 0) result += hundreds[h];
    if (remainder === 0) return result;
    if (remainder < 10) result += (result ? " " : "") + units[u];
    else if (remainder < 20)
      result += (result ? " " : "") + teens[remainder - 10];
    else {
      result += (result ? " " : "") + tensArr[t];
      if (u > 0) result += (result ? " " : "") + units[u];
    }
    return result;
  }

  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);
  if (intPart === 0 && decPart > 0) return `${decPart} ${getParaWord(decPart)}`;

  let result = "";
  const millions = Math.floor(intPart / 1000000);
  if (millions > 0) {
    result +=
      millions === 1
        ? "jedan milion"
        : convertChunk(millions) + " " + getMillionWord(millions);
  }
  const thousands = Math.floor((intPart % 1000000) / 1000);
  if (thousands > 0) {
    if (result) result += " ";
    result +=
      thousands === 1
        ? "jedna hiljada"
        : thousands < 5
          ? convertChunk(thousands) + " hiljade"
          : convertChunk(thousands) + " hiljada";
  }
  const remaining = intPart % 1000;
  if (remaining > 0) {
    if (result) result += " ";
    result += convertChunk(remaining) + " " + getDinarWord(remaining);
  }
  if (decPart > 0) {
    if (result) result += " i ";
    result += `${decPart} ${getParaWord(decPart)}`;
  }
  return result;
}

export function getDinarWord(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return "dinara";
  if (lastOne >= 2 && lastOne <= 4) return "dinara";
  if (lastOne === 1) return "dinar";
  return "dinara";
}

export function getMillionWord(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return "miliona";
  if (lastOne >= 2 && lastOne <= 4) return "miliona";
  return "miliona";
}

export function getParaWord(n: number): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return "para";
  if (lastOne >= 2 && lastOne <= 4) return "pare";
  if (lastOne === 1) return "para";
  return "para";
}
