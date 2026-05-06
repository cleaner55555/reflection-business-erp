export const pageTypeConfig: Record<string, { label: string; color: string }> =
  {
    home: { label: "Početna", color: "bg-green-100 text-green-700" },
    about: { label: "O nama", color: "bg-sky-100 text-sky-700" },
    contact: { label: "Kontakt", color: "bg-amber-100 text-amber-700" },
    product: { label: "Proizvodi", color: "bg-purple-100 text-purple-700" },
    blog: { label: "Blog", color: "bg-pink-100 text-pink-700" },
    pricing: { label: "Cenovnik", color: "bg-emerald-100 text-emerald-700" },
    custom: { label: "Prilagođena", color: "bg-gray-100 text-gray-700" },
  };

export const pageStatusConfig: Record<
  string,
  { label: string; color: string }
> = {
  published: { label: "Objavljeno", color: "bg-green-100 text-green-700" },
  draft: { label: "Nacrt", color: "bg-amber-100 text-amber-700" },
  archived: { label: "Arhivirano", color: "bg-gray-200 text-gray-500" },
};

export const sectionTypes: Record<
  string,
  { label: string; icon: React.ElementType; description: string }
> = {
  hero: {
    label: "Hero sekcija",
    icon: Megaphone,
    description: "Veliki naslov, podnaslov i CTA dugme",
  },
  features: {
    label: "Prikaži prednosti",
    icon: Sparkles,
    description: "Grid sa ikonama i opisom",
  },
  testimonials: {
    label: "Utisci korisnika",
    icon: Star,
    description: "Kartice sa recenzijama",
  },
  cta: {
    label: "Poziv na akciju",
    icon: Target,
    description: "CTA sekcija sa dugmadima",
  },
  pricing: {
    label: "Cenovnik",
    icon: Layers,
    description: "Kartice sa planovima",
  },
  faq: {
    label: "Česta pitanja",
    icon: BookOpen,
    description: "Proširiva lista FAQ",
  },
  team: {
    label: "Tim",
    icon: Users,
    description: "Članovi tima sa pozicijama",
  },
  gallery: { label: "Galerija", icon: Image, description: "Grid sa slikama" },
  stats: {
    label: "Statistike",
    icon: BarChart3,
    description: "Brojevi i metrike",
  },
  contact_form: {
    label: "Kontakt forma",
    icon: Mail,
    description: "Forma za kontakt",
  },
};

export const templateOptions: Record<
  string,
  { label: string; sections: string[] }
> = {
  blank: { label: "Prazna stranica", sections: [] },
  landing: {
    label: "Landing stranica",
    sections: ["hero", "features", "testimonials", "cta", "pricing"],
  },
  about: { label: "O nama", sections: ["hero", "stats", "team", "faq", "cta"] },
  contact: { label: "Kontakt", sections: ["hero", "contact_form", "faq"] },
  blog_home: { label: "Blog početna", sections: ["hero", "features"] },
  portfolio: {
    label: "Portfolio",
    sections: ["hero", "gallery", "testimonials", "cta"],
  },
  pricing_page: {
    label: "Stranica cenovnika",
    sections: ["hero", "pricing", "faq", "cta"],
  },
};

export const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open_sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "playfair", label: "Playfair Display" },
  { value: "merriweather", label: "Merriweather" },
];

export const buttonStyleOptions = [
  { value: "rounded", label: "Zaobljeno" },
  { value: "pill", label: "Pilula" },
  { value: "sharp", label: "Oštro" },
  { value: "outline", label: "Kontura" },
];

export const menuIcons = [
  "Home",
  "FileText",
  "ShoppingCart",
  "Phone",
  "Mail",
  "Users",
  "Settings",
  "Star",
  "Heart",
  "BookOpen",
  "BarChart3",
  "Globe2",
  "Package",
  "Shield",
  "Zap",
];

export const componentLibrary: ComponentItem[] = [
  {
    id: "c1",
    name: "Heder navigacija",
    category: "Navigacija",
    description: "Fiksni heder sa logo, meni i CTA dugme",
    icon: Menu,
    sections: ["logo", "nav_links", "cta_button"],
  },
  {
    id: "c2",
    name: "Hero sa pozadinom",
    category: "Hero",
    description: "Veliki hero sa slikom u pozadini i overlay",
    icon: Frame,
    sections: ["background_image", "heading", "subheading", "cta"],
  },
  {
    id: "c3",
    name: "Hero sa video pozadinom",
    category: "Hero",
    description: "Video hero sekcija sa autoplej opcijom",
    icon: RectangleHorizontal,
    sections: ["video_bg", "heading", "subheading", "cta"],
  },
  {
    id: "c4",
    name: "Grid prednosti",
    category: "Sadržaj",
    description: "3 ili 4 kolone sa ikonama i opisom",
    icon: Sparkles,
    sections: ["icon", "title", "description"],
  },
  {
    id: "c5",
    name: "Kartice usluga",
    category: "Sadržaj",
    description: "Kartice sa slikama i tekstom",
    icon: Layers,
    sections: ["image", "title", "description", "link"],
  },
  {
    id: "c6",
    name: "Testimonial slajder",
    category: "Društveni dokaz",
    description: "Rotirajuće recenzije korisnika",
    icon: Star,
    sections: ["avatar", "name", "role", "quote", "rating"],
  },
  {
    id: "c7",
    name: "Logos klijenata",
    category: "Društveni dokaz",
    description: "Grid sa logouma partnera",
    icon: Users,
    sections: ["logo_grid"],
  },
  {
    id: "c8",
    name: "Cenovnik tabela",
    category: "Cenovnik",
    description: "3 kolone sa planovima cenovnika",
    icon: Layers,
    sections: ["plan_name", "price", "features_list", "cta_button"],
  },
  {
    id: "c9",
    name: "FAQ akordeon",
    category: "Sadržaj",
    description: "Proširiva lista pitanja i odgovora",
    icon: BookOpen,
    sections: ["question", "answer"],
  },
  {
    id: "c10",
    name: "Tim sekcija",
    category: "Sadržaj",
    description: "Članovi tima sa slikama i pozicijama",
    icon: Users,
    sections: ["photo", "name", "role", "social_links"],
  },
  {
    id: "c11",
    name: "Galerija",
    category: "Mediji",
    description: "Responsivni grid sa slikama",
    icon: Image,
    sections: ["image_grid", "lightbox"],
  },
  {
    id: "c12",
    name: "CTA sekcija",
    category: "Poziv na akciju",
    description: "Poziv na akciju sa dugmadima",
    icon: Target,
    sections: ["heading", "description", "primary_btn", "secondary_btn"],
  },
  {
    id: "c13",
    name: "Kontakt forma",
    category: "Forme",
    description: "Forma sa poljima i validacijom",
    icon: Mail,
    sections: ["name", "email", "phone", "message", "submit"],
  },
  {
    id: "c14",
    name: "Mapa",
    category: "Mediji",
    description: "Google Maps integracija",
    icon: Globe2,
    sections: ["map_embed", "address", "hours"],
  },
  {
    id: "c15",
    name: "Futer",
    category: "Navigacija",
    description: "Višekolonski futer sa linkovima",
    icon: AlignLeft,
    sections: ["logo", "link_columns", "social_links", "copyright"],
  },
  {
    id: "c16",
    name: "Newsletter sekcija",
    category: "Forme",
    description: "Pretplata na newsletter sa email poljem",
    icon: Mail,
    sections: ["heading", "description", "email_input", "subscribe_btn"],
  },
];

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const formatDate = (d: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const { activeCompanyId } = useAppStore();
