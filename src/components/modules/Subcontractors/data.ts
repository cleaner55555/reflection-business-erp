// ============================================================
// Subcontractors Module – Mock Data & Utility Functions
// Serbian business logic (RSD, PIB, MB, PDV, Ugovori)
// ============================================================

import type {
  Subcontractor,
  Contract,
  Delivery,
  Payment,
  SpendingBySubcontractor,
  ContractExpiryAlert,
  OverduePayment,
} from "./types";

// ------------------------------------------------------------
// Mock Subcontractors
// ------------------------------------------------------------

export const initialSubcontractors: Subcontractor[] = [
  {
    id: "sub-001",
    naziv: "Graditelj d.o.o. Beograd",
    pib: "108765432",
    mb: "21045678",
    šifraDelatnosti: "4311",
    pdvObveznik: true,
    adresa: {
      ulica: "Bulevar Mihajla Pupina",
      broj: "10a",
      grad: "Beograd",
      poštanskiBroj: "11070",
      opština: "Palilula",
    },
    kontakti: [
      {
        ime: "Milan",
        prezime: "Jovanović",
        funkcija: "Direktor",
        telefon: "+381 11 234 5678",
        email: "milan.jovanovic@graditelj.rs",
      },
      {
        ime: "Jelena",
        prezime: "Petrović",
        funkcija: "Finansijski savetnik",
        telefon: "+381 11 234 5679",
        email: "jelena.petrovic@graditelj.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "Intesa Sanpaolo",
        račun: "265-1234567890123-45",
        pozivNaBroj: "97-1234567",
      },
    ],
    status: "aktivan",
    ocena: 4,
    napomene: "Dugogodišnji partner na infrastrukturnim projektima.",
    datumUnosa: "2023-03-15T08:00:00Z",
    datumIzmene: "2024-11-10T14:30:00Z",
  },
  {
    id: "sub-002",
    naziv: "Instalater Plus d.o.o. Niš",
    pib: "109876543",
    mb: "21156789",
    šifraDelatnosti: "4322",
    pdvObveznik: true,
    adresa: {
      ulica: "Vojvode Mišića",
      broj: "25",
      grad: "Niš",
      poštanskiBroj: "18000",
    },
    kontakti: [
      {
        ime: "Nikola",
        prezime: "Stanković",
        funkcija: "Tehničar",
        telefon: "+381 18 345 678",
        email: "nikola@instalaterplus.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "Eurobank",
        račun: "265-9876543210987-65",
        pozivNaBroj: "97-7654321",
      },
    ],
    status: "aktivan",
    ocena: 5,
    napomene: "Specijalizovani za vodovodne i instalacije.",
    datumUnosa: "2023-06-01T09:00:00Z",
    datumIzmene: "2024-10-20T11:00:00Z",
  },
  {
    id: "sub-003",
    naziv: "Elektro Mreža d.o.o. Novi Sad",
    pib: "105432167",
    mb: "20987654",
    šifraDelatnosti: "4321",
    pdvObveznik: true,
    adresa: {
      ulica: "Bulevar oslobođenja",
      broj: "88",
      grad: "Novi Sad",
      poštanskiBroj: "21000",
    },
    kontakti: [
      {
        ime: "Dragan",
        prezime: "Milić",
        funkcija: "Inženjer",
        telefon: "+381 21 456 789",
        email: "dragan.milic@elektromreza.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "OTP Banka",
        račun: "265-1111222233334-55",
        pozivNaBroj: "97-1122334",
      },
    ],
    status: "aktivan",
    ocena: 3,
    napomene: "Električne instalacije i mreže.",
    datumUnosa: "2023-09-12T10:00:00Z",
    datumIzmene: "2024-09-05T16:00:00Z",
  },
  {
    id: "sub-004",
    naziv: "FasadTrade d.o.o. Subotica",
    pib: "107654321",
    mb: "20876543",
    šifraDelatnosti: "4334",
    pdvObveznik: false,
    adresa: {
      ulica: "Trg Slobode",
      broj: "7",
      grad: "Subotica",
      poštanskiBroj: "24000",
    },
    kontakti: [
      {
        ime: "Siniša",
        prezime: "Todorović",
        funkcija: "Vlasnik",
        telefon: "+381 24 567 890",
        email: "siniša@fasadtrade.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "Komercijalna Banka",
        račun: "265-4444555566667-88",
        pozivNaBroj: "97-4455667",
      },
    ],
    status: "neaktivan",
    ocena: 2,
    napomene: "Fasaderski radovi — ugašena aktivnost.",
    datumUnosa: "2022-01-20T12:00:00Z",
    datumIzmene: "2024-08-15T09:00:00Z",
  },
  {
    id: "sub-005",
    naziv: "Krovopokrivač PRO d.o.o. Kragujevac",
    pib: "106543219",
    mb: "20765432",
    šifraDelatnosti: "4391",
    pdvObveznik: true,
    adresa: {
      ulica: "Đure Jakšića",
      broj: "3",
      grad: "Kragujevac",
      poštanskiBroj: "34000",
    },
    kontakti: [
      {
        ime: "Milorad",
        prezime: "Lazić",
        funkcija: "Šef radova",
        telefon: "+381 34 678 901",
        email: "milorad@krovoprovac.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "AIK Banka",
        račun: "265-7777888899990-11",
        pozivNaBroj: "97-7788990",
      },
    ],
    status: "aktivan",
    ocena: 4,
    napomene: "Krovni radovi i hidroizolacija.",
    datumUnosa: "2024-01-10T11:00:00Z",
    datumIzmene: "2024-11-01T10:00:00Z",
  },
  {
    id: "sub-006",
    naziv: "BetonMix d.o.o. Čačak",
    pib: "104321678",
    mb: "20654321",
    šifraDelatnosti: "2363",
    pdvObveznik: true,
    adresa: {
      ulica: "Žička",
      broj: "12",
      grad: "Čačak",
      poštanskiBroj: "32000",
    },
    kontakti: [
      {
        ime: "Goran",
        prezime: "Radosavljević",
        funkcija: "Direktor",
        telefon: "+381 32 789 012",
        email: "goran@betonmix.rs",
      },
    ],
    bankovniRačuni: [
      {
        nazivBanke: "UniCredit Bank",
        račun: "265-2222333344445-66",
        pozivNaBroj: "97-2233445",
      },
    ],
    status: "suspendovan",
    ocena: 1,
    napomene: "Suspendovan zbog kašnjenja sa isporukama.",
    datumUnosa: "2023-11-05T08:00:00Z",
    datumIzmene: "2024-07-22T15:00:00Z",
  },
];
// ------------------------------------------------------------
// Mock Contracts
// ------------------------------------------------------------

export const initialContracts: Contract[] = [
  {
    id: "ugv-001",
    podizvođačId: "sub-001",
    brojUgovora: "UV-2024-001",
    predmetUgovora: "Izgradnja parkinga objekat A",
    opsegRadova:
      "Izrada temelja, armiranobetonska konstrukcija parkinga, asfaltiranje, hidroizolacija",
    vrednost: 12500000,
    vrednostNeto: 10416666.67,
    pdvStopa: 20,
    datumPotpisa: "2024-01-15",
    datumPočetka: "2024-02-01",
    datumZavršetka: "2024-12-31",
    status: "aktivan",
    garancijaMeseci: 24,
    napomene: "Mogućnost produženja za 3 meseca po potrebi.",
    datumUnosa: "2024-01-16T08:00:00Z",
    datumIzmene: "2024-10-01T12:00:00Z",
  },
  {
    id: "ugv-002",
    podizvođačId: "sub-002",
    brojUgovora: "UV-2024-002",
    predmetUgovora: "Vodovodne instalacije zgrada B1–B5",
    opsegRadova:
      "Kompletna vodovodna mreža, sanitarna oprema, kanalizacija za 5 stambenih zgrada",
    vrednost: 8750000,
    vrednostNeto: 7291666.67,
    pdvStopa: 20,
    datumPotpisa: "2024-03-10",
    datumPočetka: "2024-04-01",
    datumZavršetka: "2025-03-31",
    status: "aktivan",
    garancijaMeseci: 36,
    napomene: "",
    datumUnosa: "2024-03-11T09:00:00Z",
    datumIzmene: "2024-09-20T14:00:00Z",
  },
  {
    id: "ugv-003",
    podizvođačId: "sub-003",
    brojUgovora: "UV-2024-003",
    predmetUgovora: "Električne instalacije poslovni centar",
    opsegRadova: "Jačinska i slaba struja, rasveta, video nadzor, UPS sistem",
    vrednost: 5200000,
    vrednostNeto: 4333333.33,
    pdvStopa: 20,
    datumPotpisa: "2024-05-20",
    datumPočetka: "2024-06-01",
    datumZavršetka: "2024-11-30",
    status: "aktivan",
    garancijaMeseci: 24,
    napomene: "Hitna isporuka materijala za centralni UPS.",
    datumUnosa: "2024-05-21T10:00:00Z",
    datumIzmene: "2024-11-05T16:00:00Z",
  },
  {
    id: "ugv-004",
    podizvođačId: "sub-005",
    brojUgovora: "UV-2024-004",
    predmetUgovora: "Zamena krovnog pokrivača hala 1–3",
    opsegRadova:
      "Uklanjanje starog pokrivača, postavljanje novog metalnog krova, limarija, provodnja",
    vrednost: 3100000,
    vrednostNeto: 2583333.33,
    pdvStopa: 20,
    datumPotpisa: "2024-02-28",
    datumPočetka: "2024-03-15",
    datumZavršetka: "2024-08-15",
    status: "istekao",
    garancijaMeseci: 60,
    napomene: "Završeno pre roka.",
    datumUnosa: "2024-03-01T08:00:00Z",
    datumIzmene: "2024-08-10T11:00:00Z",
  },
  {
    id: "ugv-005",
    podizvođačId: "sub-001",
    brojUgovora: "UV-2024-005",
    predmetUgovora: "Adaptacija enterijera restoran",
    opsegRadova:
      "Rušenje, novi zidovi, podovi, gips karton, bojenje, keramičke pločice",
    vrednost: 4800000,
    vrednostNeto: 4000000,
    pdvStopa: 20,
    datumPotpisa: "2024-07-01",
    datumPočetka: "2024-07-15",
    datumZavršetka: "2024-10-15",
    status: "prekinut",
    garancijaMeseci: 12,
    napomene: "Prekinut usled nepoštovanja rokova od strane izvođača.",
    datumUnosa: "2024-07-02T09:00:00Z",
    datumIzmene: "2024-09-30T13:00:00Z",
  },
  {
    id: "ugv-006",
    podizvođačId: "sub-002",
    brojUgovora: "UV-2025-001",
    predmetUgovora: "Održavanje instalacija stambeni kompleks",
    opsegRadova: "Periodično održavanje, hitne intervencije, zamena delova",
    vrednost: 2400000,
    vrednostNeto: 2000000,
    pdvStopa: 20,
    datumPotpisa: "2024-12-01",
    datumPočetka: "2025-01-01",
    datumZavršetka: "2025-12-31",
    status: "na_čekanju",
    garancijaMeseci: 0,
    napomene: "Čeka se potvrda finansiranja.",
    datumUnosa: "2024-12-02T08:00:00Z",
    datumIzmene: "2024-12-02T08:00:00Z",
  },
];
// ------------------------------------------------------------
// Mock Deliveries
// ------------------------------------------------------------

export const initialDeliveries: Delivery[] = [
  {
    id: "isp-001",
    ugovorId: "ugv-001",
    podizvođačId: "sub-001",
    brojIsporuke: "IS-2024-001",
    datumIsporuke: "2024-04-15",
    datumPrijema: "2024-04-15",
    mestoIsporuke: "Beograd — građevinska zona A",
    stavke: [
      {
        redniBroj: 1,
        opis: "Beton B30 za temelje",
        količina: 50,
        jedinicaMere: "m³",
        jediničnaCena: 9500,
        ukupno: 475000,
      },
      {
        redniBroj: 2,
        opis: "Armatura Ø12",
        količina: 2000,
        jedinicaMere: "kg",
        jediničnaCena: 120,
        ukupno: 240000,
      },
    ],
    ukupanIznos: 715000,
    status: "prihvaćena",
    napomene: "Sve stavke prihvaćene na gradilištu.",
    datumUnosa: "2024-04-15T10:00:00Z",
    datumIzmene: "2024-04-16T08:00:00Z",
  },
  {
    id: "isp-002",
    ugovorId: "ugv-001",
    podizvođačId: "sub-001",
    brojIsporuke: "IS-2024-002",
    datumIsporuke: "2024-07-20",
    mestoIsporuke: "Beograd — građevinska zona A",
    stavke: [
      {
        redniBroj: 1,
        opis: "Asfalt AB 11 za parking",
        količina: 80,
        jedinicaMere: "t",
        jediničnaCena: 15000,
        ukupno: 1200000,
      },
    ],
    ukupanIznos: 1200000,
    status: "u_toku",
    napomene: "Isporuka u toku — delimično prevezeno.",
    datumUnosa: "2024-07-20T09:00:00Z",
    datumIzmene: "2024-07-22T14:00:00Z",
  },
  {
    id: "isp-003",
    ugovorId: "ugv-002",
    podizvođačId: "sub-002",
    brojIsporuke: "IS-2024-003",
    datumIsporuke: "2024-05-10",
    datumPrijema: "2024-05-12",
    mestoIsporuke: "Niš — stambeni kompleks B1",
    stavke: [
      {
        redniBroj: 1,
        opis: "HDPE cevi Ø110",
        količina: 500,
        jedinicaMere: "m",
        jediničnaCena: 800,
        ukupno: 400000,
      },
      {
        redniBroj: 2,
        opis: "PVC cevi Ø50",
        količina: 300,
        jedinicaMere: "m",
        jediničnaCena: 350,
        ukupno: 105000,
      },
      {
        redniBroj: 3,
        opis: "Fitingi (razno)",
        količina: 1,
        jedinicaMere: "kom",
        jediničnaCena: 45000,
        ukupno: 45000,
      },
    ],
    ukupanIznos: 550000,
    status: "prihvaćena",
    napomene: "Kompletna isporuka za fazu 1.",
    datumUnosa: "2024-05-10T11:00:00Z",
    datumIzmene: "2024-05-13T09:00:00Z",
  },
  {
    id: "isp-004",
    ugovorId: "ugv-003",
    podizvođačId: "sub-003",
    brojIsporuke: "IS-2024-004",
    datumIsporuke: "2024-08-05",
    datumPrijema: "2024-08-07",
    mestoIsporuke: "Novi Sad — poslovni centar",
    stavke: [
      {
        redniBroj: 1,
        opis: "Kablovi YKY 4x25",
        količina: 2000,
        jedinicaMere: "m",
        jediničnaCena: 450,
        ukupno: 900000,
      },
      {
        redniBroj: 2,
        opis: "Razvodne kutije",
        količina: 80,
        jedinicaMere: "kom",
        jediničnaCena: 1200,
        ukupno: 96000,
      },
    ],
    ukupanIznos: 996000,
    status: "prihvaćena",
    napomene: "",
    datumUnosa: "2024-08-05T10:00:00Z",
    datumIzmene: "2024-08-08T12:00:00Z",
  },
  {
    id: "isp-005",
    ugovorId: "ugv-003",
    podizvođačId: "sub-003",
    brojIsporuke: "IS-2024-005",
    datumIsporuke: "2024-11-15",
    mestoIsporuke: "Novi Sad — poslovni centar",
    stavke: [
      {
        redniBroj: 1,
        opis: "UPS APC Smart-UPS 3000VA",
        količina: 4,
        jedinicaMere: "kom",
        jediničnaCena: 180000,
        ukupno: 720000,
      },
    ],
    ukupanIznos: 720000,
    status: "zatražena",
    napomene: "Hitna narudžba — čeka se potvrda isporuke.",
    datumUnosa: "2024-11-14T16:00:00Z",
    datumIzmene: "2024-11-14T16:00:00Z",
  },
];
// ------------------------------------------------------------
// Mock Payments
// ------------------------------------------------------------

export const initialPayments: Payment[] = [
  {
    id: "plc-001",
    ugovorId: "ugv-001",
    podizvođačId: "sub-001",
    isporukaId: "isp-001",
    brojFakture: "F-2024-0150",
    datumFakture: "2024-04-20",
    datumValute: "2024-05-20",
    iznosFakture: 858000,
    pdvIznos: 143000,
    iznosPlaćen: 858000,
    preostaliIznos: 0,
    status: "plaćeno",
    načinPlaćanja: "račun",
    referentniBroj: "240051234567890123",
    napomene: "Plaćeno po vremenu.",
    datumUnosa: "2024-04-21T08:00:00Z",
    datumIzmene: "2024-05-18T10:00:00Z",
  },
  {
    id: "plc-002",
    ugovorId: "ugv-001",
    podizvođačId: "sub-001",
    isporukaId: "isp-002",
    brojFakture: "F-2024-0180",
    datumFakture: "2024-07-25",
    datumValute: "2024-08-25",
    iznosFakture: 1440000,
    pdvIznos: 240000,
    iznosPlaćen: 720000,
    preostaliIznos: 720000,
    status: "delačno",
    načinPlaćanja: "račun",
    referentniBroj: "240059876543210987",
    napomene: "Avans 50% plaćen, ostatak nakon završetka.",
    datumUnosa: "2024-07-26T09:00:00Z",
    datumIzmene: "2024-08-10T14:00:00Z",
  },
  {
    id: "plc-003",
    ugovorId: "ugv-002",
    podizvođačId: "sub-002",
    isporukaId: "isp-003",
    brojFakture: "F-2024-0122",
    datumFakture: "2024-05-15",
    datumValute: "2024-06-15",
    iznosFakture: 660000,
    pdvIznos: 110000,
    iznosPlaćen: 660000,
    preostaliIznos: 0,
    status: "plaćeno",
    načinPlaćanja: "račun",
    referentniBroj: "240056789012345678",
    napomene: "",
    datumUnosa: "2024-05-16T08:00:00Z",
    datumIzmene: "2024-06-12T11:00:00Z",
  },
  {
    id: "plc-004",
    ugovorId: "ugv-003",
    podizvođačId: "sub-003",
    isporukaId: "isp-004",
    brojFakture: "F-2024-0195",
    datumFakture: "2024-08-10",
    datumValute: "2024-09-10",
    iznosFakture: 1195200,
    pdvIznos: 199200,
    iznosPlaćen: 0,
    preostaliIznos: 1195200,
    status: "prekoračeno",
    načinPlaćanja: "račun",
    referentniBroj: "240041112223334445",
    napomene: "Prekoračena valuta — poslat podsetnik.",
    datumUnosa: "2024-08-11T10:00:00Z",
    datumIzmene: "2024-11-01T09:00:00Z",
  },
  {
    id: "plc-005",
    ugovorId: "ugv-004",
    podizvođačId: "sub-005",
    brojFakture: "F-2024-0088",
    datumFakture: "2024-08-20",
    datumValute: "2024-09-20",
    iznosFakture: 3720000,
    pdvIznos: 620000,
    iznosPlaćen: 3720000,
    preostaliIznos: 0,
    status: "plaćeno",
    načinPlaćanja: "račun",
    referentniBroj: "240054445556667778",
    napomene: "Završna faktura — ugovor zatvoren.",
    datumUnosa: "2024-08-21T08:00:00Z",
    datumIzmene: "2024-09-18T15:00:00Z",
  },
];
// ------------------------------------------------------------
// Status label mappings (Serbian)
// ------------------------------------------------------------

export const subcontractorStatusLabels: Record<string, string> = {
  aktivan: "Aktivan",
  neaktivan: "Neaktivan",
  suspendovan: "Suspendovan",
};

export const subcontractorStatusColors: Record<string, string> = {
  aktivan:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  neaktivan: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  suspendovan: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export const contractStatusLabels: Record<string, string> = {
  aktivan: "Aktivan",
  istekao: "Istekao",
  prekinut: "Prekinut",
  na_čekanju: "Na čekaњу",
  u_pripremi: "U pripremi",
};

export const contractStatusColors: Record<string, string> = {
  aktivan:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  istekao: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  prekinut: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  na_čekanju:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  u_pripremi: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
};

export const deliveryStatusLabels: Record<string, string> = {
  zatražena: "Zatražena",
  u_toku: "U toku",
  isporučena: "Isporučena",
  prihvaćena: "Prihvaćena",
  odbijena: "Odbijena",
};

export const deliveryStatusColors: Record<string, string> = {
  zatražena: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  u_toku: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  isporučena: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  prihvaćena:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  odbijena: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export const paymentStatusLabels: Record<string, string> = {
  plaćeno: "Plaćeno",
  delačno: "Delimično",
  neplaćeno: "Neplaćeno",
  prekoračeno: "Prekoračeno",
};

export const paymentStatusColors: Record<string, string> = {
  plaćeno:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  delačno: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  neplaćeno:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  prekoračeno: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export const paymentMethodLabels: Record<string, string> = {
  gotovina: "Gotovina",
  račun: "Transakcioni račun",
  kartica: "Kartica",
  avans: "Avans",
};

export const unitLabels: Record<string, string> = {
  kom: "kom",
  "m²": "m²",
  "m³": "m³",
  kg: "kg",
  t: "t",
  m: "m",
  l: "l",
};

// ------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------

/** Format currency in RSD */
export function formatRSD(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format date to Serbian locale */
export function formatDatum(dateStr: string): string {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

/** Calculate days between two dates */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = d2.getTime() - d1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Get today's ISO date */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Generate unique ID */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
// ------------------------------------------------------------
// Report calculations
// ------------------------------------------------------------

export function calculateSpendingBySubcontractor(
  subcontractors: Subcontractor[],
  contracts: Contract[],
  payments: Payment[],
  deliveries: Delivery[],
): SpendingBySubcontractor[] {
  return subcontractors.map((sub) => {
    const subContracts = contracts.filter((c) => c.podizvođačId === sub.id);
    const subPayments = payments.filter((p) => p.podizvođačId === sub.id);
    const subDeliveries = deliveries.filter((d) => d.podizvođačId === sub.id);

    const ukupnoUgovori = subContracts.reduce((sum, c) => sum + c.vrednost, 0);
    const ukupnoIsporučeno = subDeliveries.reduce(
      (sum, d) => sum + d.ukupanIznos,
      0,
    );
    const ukupnoPlaćeno = subPayments.reduce(
      (sum, p) => sum + p.iznosPlaćen,
      0,
    );
    const preostalo = subPayments.reduce((sum, p) => sum + p.preostaliIznos, 0);

    return {
      podizvođačId: sub.id,
      naziv: sub.naziv,
      pib: sub.pib,
      ukupnoUgovori,
      ukupnoIsporučeno,
      ukupnoPlaćeno,
      preostalo,
      brojUgovora: subContracts.length,
      brojIsporuka: subDeliveries.length,
    };
  });
}

export function calculateContractExpiryAlerts(
  contracts: Contract[],
  subcontractors: Subcontractor[],
): ContractExpiryAlert[] {
  const today = new Date();
  return contracts
    .filter((c) => c.status === "aktivan")
    .map((c) => {
      const endDate = new Date(c.datumZavršetka);
      const daysRemaining = daysBetween(today.toISOString(), c.datumZavršetka);
      const sub = subcontractors.find((s) => s.id === c.podizvođačId);
      return {
        ugovorId: c.id,
        brojUgovora: c.brojUgovora,
        podizvođačNaziv: sub?.naziv || "Nepoznato",
        datumZavršetka: c.datumZavršetka,
        danaDoIsteka: daysRemaining,
        status: c.status,
        vrednost: c.vrednost,
      };
    })
    .sort((a, b) => a.danaDoIsteka - b.danaDoIsteka);
}

export function calculateOverduePayments(
  payments: Payment[],
  subcontractors: Subcontractor[],
): OverduePayment[] {
  const today = new Date();
  return payments
    .filter((p) => {
      const dueDate = new Date(p.datumValute);
      return p.status !== "plaćeno" && dueDate < today;
    })
    .map((p) => {
      const sub = subcontractors.find((s) => s.id === p.podizvođačId);
      return {
        plaćanjeId: p.id,
        brojFakture: p.brojFakture,
        podizvođačNaziv: sub?.naziv || "Nepoznato",
        datumValute: p.datumValute,
        danaPrekoračenja: daysBetween(p.datumValute, today.toISOString()),
        preostaliIznos: p.preostaliIznos,
        status: p.status,
      };
    })
    .sort((a, b) => b.danaPrekoračenja - a.danaPrekoračenja);
}
// ------------------------------------------------------------
// Empty form defaults
// ------------------------------------------------------------

export const emptySubcontractorForm = {
  naziv: "",
  pib: "",
  mb: "",
  šifraDelatnosti: "",
  pdvObveznik: true,
  adresa: { ulica: "", broj: "", grad: "", poštanskiBroj: "", opština: "" },
  kontakti: [{ ime: "", prezime: "", funkcija: "", telefon: "", email: "" }],
  bankovniRačuni: [{ nazivBanke: "", račun: "", pozivNaBroj: "" }],
  status: "aktivan" as const,
  ocena: 3,
  napomene: "",
};

export const emptyContractForm = {
  podizvođačId: "",
  brojUgovora: "",
  predmetUgovora: "",
  opsegRadova: "",
  vrednost: 0,
  vrednostNeto: 0,
  pdvStopa: 20,
  datumPotpisa: "",
  datumPočetka: "",
  datumZavršetka: "",
  status: "u_pripremi" as const,
  garancijaMeseci: 12,
  napomene: "",
};

export const emptyDeliveryForm = {
  ugovorId: "",
  podizvođačId: "",
  brojIsporuke: "",
  datumIsporuke: "",
  datumPrijema: "",
  mestoIsporuke: "",
  stavke: [
    {
      redniBroj: 1,
      opis: "",
      količina: 0,
      jedinicaMere: "kom",
      jediničnaCena: 0,
      ukupno: 0,
    },
  ],
  ukupanIznos: 0,
  status: "zatražena" as const,
  napomene: "",
};

export const emptyPaymentForm = {
  ugovorId: "",
  podizvođačId: "",
  isporukaId: "",
  brojFakture: "",
  datumFakture: "",
  datumValute: "",
  iznosFakture: 0,
  pdvIznos: 0,
  iznosPlaćen: 0,
  preostaliIznos: 0,
  status: "neplaćeno" as const,
  načinPlaćanja: "račun" as const,
  referentniBroj: "",
  napomene: "",
};
