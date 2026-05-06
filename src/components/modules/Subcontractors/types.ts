// ============================================================
// Subcontractors Module – Types
// Serbian business logic (RSD, PIB, MB, PDV, Ugovori)
// ============================================================

/** Subcontractor status */
export type SubcontractorStatus = "aktivan" | "neaktivan" | "suspendovan";

/** Contract status */
export type ContractStatus =
  | "aktivan"
  | "istekao"
  | "prekinut"
  | "na_čekanju"
  | "u_pripremi";

/** Delivery status */
export type DeliveryStatus =
  | "zatražena"
  | "u_toku"
  | "isporučena"
  | "prihvaćena"
  | "odbijena";

/** Payment status */
export type PaymentStatus = "plaćeno" | "delačno" | "neplaćeno" | "prekoračeno";

/** Report period */
export type ReportPeriod = "mesec" | "kvartal" | "godina";

// ------------------------------------------------------------
// Subcontractor
// ------------------------------------------------------------

export interface SubcontractorAddress {
  ulica: string;
  broj: string;
  grad: string;
  poštanskiBroj: string;
  opština?: string;
}

export interface SubcontractorContact {
  ime: string;
  prezime: string;
  funkcija: string;
  telefon: string;
  email: string;
}

export interface SubcontractorBank {
  nazivBanke: string;
  račun: string; // e.g. 265-0000000001234-78
  pozivNaBroj?: string;
}

export interface Subcontractor {
  id: string;
  naziv: string;
  pib: string; // ПИБ – 9 digits
  mb: string; // Матични број – 8 digits
  šifraDelatnosti: string; // SIF – 4 digits
  pdvObveznik: boolean; // Да/Не
  adresa: SubcontractorAddress;
  kontakti: SubcontractorContact[];
  bankovniRačuni: SubcontractorBank[];
  status: SubcontractorStatus;
  ocena: number; // 1-5
  napomene: string;
  datumUnosa: string; // ISO date
  datumIzmene: string; // ISO date
}

export type SubcontractorFormData = Omit<
  Subcontractor,
  "id" | "datumUnosa" | "datumIzmene"
>;

// ------------------------------------------------------------
// Contract (Ugovor)
// ------------------------------------------------------------

export interface Contract {
  id: string;
  podizvođačId: string;
  brojUgovora: string; // e.g. UV-2024-001
  predmetUgovora: string;
  opsegRadova: string;
  vrednost: number; // RSD (gross)
  vrednostNeto: number; // RSD (net)
  pdvStopa: number; // e.g. 20
  datumPotpisa: string; // ISO date
  datumPočetka: string; // ISO date
  datumZavršetka: string; // ISO date
  status: ContractStatus;
  garancijaMeseci: number;
  napomene: string;
  datumUnosa: string;
  datumIzmene: string;
}

export type ContractFormData = Omit<
  Contract,
  "id" | "datumUnosa" | "datumIzmene"
>;

// ------------------------------------------------------------
// Delivery (Isporuka)
// ------------------------------------------------------------

export interface DeliveryItem {
  redniBroj: number;
  opis: string;
  količina: number;
  jedinicaMere: string; // kom, m², m³, kg, t
  jediničnaCena: number; // RSD
  ukupno: number; // RSD
}

export interface Delivery {
  id: string;
  ugovorId: string;
  podizvođačId: string;
  brojIsporuke: string; // e.g. IS-2024-001
  datumIsporuke: string;
  datumPrijema?: string;
  mestoIsporuke: string;
  stavke: DeliveryItem[];
  ukupanIznos: number; // RSD
  status: DeliveryStatus;
  napomene: string;
  datumUnosa: string;
  datumIzmene: string;
}

export type DeliveryFormData = Omit<
  Delivery,
  "id" | "datumUnosa" | "datumIzmene"
>;

// ------------------------------------------------------------
// Payment (Plaćanje / Finansije)
// ------------------------------------------------------------

export interface Payment {
  id: string;
  ugovorId: string;
  podizvođačId: string;
  isporukaId?: string;
  brojFakture: string;
  datumFakture: string;
  datumValute: string; // valuta fakture
  iznosFakture: number; // RSD (gross)
  pdvIznos: number; // RSD
  iznosPlaćen: number; // RSD
  preostaliIznos: number; // RSD
  status: PaymentStatus;
  načinPlaćanja: "gotovina" | "račun" | "kartica" | "avans";
  referentniBroj: string;
  napomene: string;
  datumUnosa: string;
  datumIzmene: string;
}

export type PaymentFormData = Omit<
  Payment,
  "id" | "datumUnosa" | "datumIzmene"
>;

// ------------------------------------------------------------
// Report aggregates
// ------------------------------------------------------------

export interface SpendingBySubcontractor {
  podizvođačId: string;
  naziv: string;
  pib: string;
  ukupnoUgovori: number;
  ukupnoIsporučeno: number;
  ukupnoPlaćeno: number;
  preostalo: number;
  brojUgovora: number;
  brojIsporuka: number;
}

export interface ContractExpiryAlert {
  ugovorId: string;
  brojUgovora: string;
  podizvođačNaziv: string;
  datumZavršetka: string;
  danaDoIsteka: number;
  status: ContractStatus;
  vrednost: number;
}

export interface OverduePayment {
  plaćanjeId: string;
  brojFakture: string;
  podizvođačNaziv: string;
  datumValute: string;
  danaPrekoračenja: number;
  preostaliIznos: number;
  status: PaymentStatus;
}
// ------------------------------------------------------------
// Filter / search types
// ------------------------------------------------------------

export interface SubcontractorFilters {
  pretraga: string;
  status: SubcontractorStatus | "sve";
  grad: string;
  pdvObveznik: boolean | null;
}

export interface ContractFilters {
  pretraga: string;
  status: ContractStatus | "sve";
  podizvođačId: string;
  datumOd: string;
  datumDo: string;
}

export interface DeliveryFilters {
  pretraga: string;
  status: DeliveryStatus | "sve";
  podizvođačId: string;
  datumOd: string;
  datumDo: string;
}

export interface PaymentFilters {
  pretraga: string;
  status: PaymentStatus | "sve";
  podizvođačId: string;
  datumOd: string;
  datumDo: string;
}
