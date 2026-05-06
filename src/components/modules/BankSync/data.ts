export const CURRENCIES = ["RSD", "EUR", "USD", "GBP", "CHF"] as const;

export const emptyAccountForm = {
  name: "",
  bank: "",
  account: "",
  currency: "RSD",
  isActive: true,
};
