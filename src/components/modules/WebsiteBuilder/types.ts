export interface Page {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  seoTitle?: string;
  metaDescription?: string;
  template?: string;
  sections?: PageSection[];
  traffic?: number;
  seoScore?: number;
  updatedAt?: string;
  createdAt: string;
}

export interface PageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  orderNum: number;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  parentId: string | null;
  orderNum: number;
  target: string;
  visible: boolean;
  children?: MenuItem[];
}

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  usageCount: number;
  alt?: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  sections: string[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  headingFont: string;
  bodyFont: string;
  headingSize: string;
  bodySize: string;
  borderRadius: string;
  buttonStyle: string;
  darkMode: boolean;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  structuredData: string;
}
