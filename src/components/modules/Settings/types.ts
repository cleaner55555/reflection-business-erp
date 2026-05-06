export interface ModuleDef {
  key: string;
  name: string;
  descriptionKey: string;
  icon: string;
  enabled: boolean;
}

export interface CompanySettings {
  company_name: string;
  company_pib: string;
  company_maticni_broj: string;
  company_address: string;
  company_city: string;
  company_zip: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_bank_account: string;
}

export interface GeneralSettings {
  default_currency: string;
  default_tax_rate: string;
  default_payment_method: string;
  fiscal_year_start: string;
  language: string;
  active_languages: string; // JSON array of language codes, e.g. '["sr","sr-latn","en"]'
}

export interface AppSettingResponse {
  id: string;
  key: string;
  value: string;
  label: string | null;
  type: string;
  group: string;
}
