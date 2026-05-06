export const formatCurrency = (val: number) =>
  `${val.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD`;

export const statusColor = (status: string) => {
  switch (status) {
    case "active":
    case "isporučena":
    case "završena":
    case "objavljen":
    case "rešeno":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "pending":
    case "nacrt":
    case "otvoren":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "potvrđena":
    case "u_pripremi":
    case "poslata":
    case "u_toku":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "suspended":
    case "stornirana":
    case "skriven":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    case "rejected":
    case "odbijeno":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "Na čekanju",
    active: "Aktivan",
    suspended: "Suspendovan",
    rejected: "Odbijen",
    nacrt: "Nacrt",
    potvrđena: "Potvrđena",
    u_pripremi: "U pripremi",
    poslata: "Poslata",
    u_isporuci: "U isporuci",
    isporučena: "Isporučena",
    završena: "Završena",
    stornirana: "Stornirana",
    otvoren: "Otvoren",
    u_toku: "U toku",
    rešeno: "Rešeno",
    odbijeno: "Odbijeno",
    objavljen: "Objavljen",
    na_cekanju: "Na čekanju",
    skriven: "Skriven",
  };
  return map[status] || status;
};

export const disputeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    quality: "Kvalitet",
    delivery: "Isporuka",
    wrong_item: "Pogrešna stavka",
    damaged: "Oštećeno",
    not_received: "Nije primljeno",
    other: "Ostalo",
  };
  return map[type] || type;
};

export const priorityLabel = (p: string) => {
  const map: Record<string, string> = {
    nizak: "Nizak",
    srednji: "Srednji",
    visok: "Visok",
    hitan: "Hitan",
  };
  return map[p] || p;
};

export const emptyVendor = {
  partnerId: "",
  description: "",
  deliveryTime: "",
  minOrderAmount: 0,
  commissionRate: 5,
  categories: "",
  paymentTerms: "odmah",
  shippingFree: false,
};

export const emptyOrder = {
  vendorId: "",
  retailerName: "",
  retailerEmail: "",
  retailerPhone: "",
  retailerAddress: "",
  retailerCity: "",
  notes: "",
};

export const emptyReview = {
  vendorId: "",
  authorName: "",
  rating: 5,
  title: "",
  comment: "",
};

export const emptyDispute = {
  vendorId: "",
  orderId: "",
  type: "other",
  description: "",
  priority: "srednji",
};

export const emptyProduct = {
  name: "",
  vendorId: "",
  sku: "",
  category: "",
  description: "",
  price: 0,
  compareAtPrice: 0,
  costPrice: 0,
  unit: "kom",
  stock: 0,
  minOrderQty: 1,
  weight: 0,
  imageUrl: "",
  isFeatured: false,
};

export const emptyCoupon = {
  code: "",
  description: "",
  discountType: "procenat",
  discountValue: 10,
  minOrderAmount: 0,
  maxUses: 100,
  validFrom: "",
  validTo: "",
  vendorId: "",
  category: "",
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Avg",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export const ORDER_COLORS: Record<string, string> = {
  nacrt: "bg-yellow-500",
  potvrđena: "bg-blue-500",
  poslata: "bg-indigo-500",
  isporučena: "bg-green-500",
  stornirana: "bg-red-500",
  u_isporuci: "bg-cyan-500",
  završena: "bg-emerald-600",
};
