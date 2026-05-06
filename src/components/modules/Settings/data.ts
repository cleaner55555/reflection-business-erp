export const MODULES_DEFAULTS: Omit<ModuleDef, "enabled">[] = [
  {
    key: "module_finansije_enabled",
    name: "Finansije",
    descriptionKey: "settings.mod_finansije",
    icon: "💰",
  },
  {
    key: "module_fakture_enabled",
    name: "Fakture",
    descriptionKey: "settings.mod_fakture",
    icon: "📄",
  },
  {
    key: "module_magacin_enabled",
    name: "Magacin",
    descriptionKey: "settings.mod_magacin",
    icon: "🏭",
  },
  {
    key: "module_partneri_enabled",
    name: "Partneri",
    descriptionKey: "settings.mod_partneri",
    icon: "🤝",
  },
  {
    key: "module_nabavka_enabled",
    name: "Nabavka",
    descriptionKey: "settings.mod_nabavka",
    icon: "🛒",
  },
  {
    key: "module_crm_enabled",
    name: "CRM",
    descriptionKey: "settings.mod_crm",
    icon: "❤️",
  },
  {
    key: "module_kalendar_enabled",
    name: "Kalendar",
    descriptionKey: "settings.mod_kalendar",
    icon: "📅",
  },
  {
    key: "module_zaposleni_enabled",
    name: "Zaposleni",
    descriptionKey: "settings.mod_zaposleni",
    icon: "👥",
  },
  {
    key: "module_projekti_enabled",
    name: "Projekti",
    descriptionKey: "settings.mod_projekti",
    icon: "📁",
  },
  {
    key: "module_sredstva_enabled",
    name: "Osnovna sredstva",
    descriptionKey: "settings.mod_sredstva",
    icon: "🏗️",
  },
  {
    key: "module_dokumenta_enabled",
    name: "Dokumenta",
    descriptionKey: "settings.mod_dokumenta",
    icon: "📂",
  },
  {
    key: "module_knjigovodstvo_enabled",
    name: "Knjigovodstvo",
    descriptionKey: "settings.mod_knjigovodstvo",
    icon: "📒",
  },
  {
    key: "module_protokol_enabled",
    name: "Protokol",
    descriptionKey: "settings.mod_protokol",
    icon: "📬",
  },
  {
    key: "module_edukacija_enabled",
    name: "Edukacija",
    descriptionKey: "settings.mod_edukacija",
    icon: "🎓",
  },
  {
    key: "module_vozni_park_enabled",
    name: "Vozni park",
    descriptionKey: "settings.mod_vozni_park",
    icon: "🚗",
  },
  {
    key: "module_rent_a_car_enabled",
    name: "Rent a car",
    descriptionKey: "settings.mod_rent_a_car",
    icon: "🚙",
  },
  {
    key: "module_kafe_restoran_enabled",
    name: "Kafe restoran",
    descriptionKey: "settings.mod_kafe_restoran",
    icon: "☕",
  },
  {
    key: "module_email_marketing_enabled",
    name: "Email Marketing",
    descriptionKey: "settings.mod_email_marketing",
    icon: "✉️",
  },
];

export const COMPANY_DEFAULTS: CompanySettings = {
  company_name: "",
  company_pib: "",
  company_maticni_broj: "",
  company_address: "",
  company_city: "",
  company_zip: "",
  company_phone: "",
  company_email: "",
  company_website: "",
  company_bank_account: "",
};

export const DEFAULT_ACTIVE_LANGUAGES = ["sr", "sr-latn", "en"];

export const GENERAL_DEFAULTS: GeneralSettings = {
  default_currency: "RSD",
  default_tax_rate: "20",
  default_payment_method: "racun",
  fiscal_year_start: "1",
  language: "sr",
  active_languages: JSON.stringify(DEFAULT_ACTIVE_LANGUAGES),
};
