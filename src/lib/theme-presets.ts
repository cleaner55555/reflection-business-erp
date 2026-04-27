import type { ThemeSettings } from './theme'

// ============ THEME PRESETS ============

export interface ThemePreset {
  name: string
  nameEn: string
  settings: ThemeSettings
}

export const themePresets: ThemePreset[] = [
  {
    name: 'Zelena (podrazumevana)',
    nameEn: 'Green (Default)',
    settings: {
      primaryColor: '#16a34a',
      primaryForeground: '#f0fdf4',
      accentColor: '#f0fdf4',
      sidebarColor: '#1a2e1e',
      sidebarForeground: '#e8f5e9',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Plava',
    nameEn: 'Blue',
    settings: {
      primaryColor: '#2563eb',
      primaryForeground: '#eff6ff',
      accentColor: '#eff6ff',
      sidebarColor: '#1e293b',
      sidebarForeground: '#e2e8f0',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Ljubičasta',
    nameEn: 'Purple',
    settings: {
      primaryColor: '#7c3aed',
      primaryForeground: '#faf5ff',
      accentColor: '#faf5ff',
      sidebarColor: '#2e1a47',
      sidebarForeground: '#ede9fe',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Crvena',
    nameEn: 'Red',
    settings: {
      primaryColor: '#dc2626',
      primaryForeground: '#fef2f2',
      accentColor: '#fef2f2',
      sidebarColor: '#2d1b1b',
      sidebarForeground: '#fecaca',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Narandžasta',
    nameEn: 'Orange',
    settings: {
      primaryColor: '#ea580c',
      primaryForeground: '#fff7ed',
      accentColor: '#fff7ed',
      sidebarColor: '#2d1f10',
      sidebarForeground: '#fed7aa',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Roza',
    nameEn: 'Pink',
    settings: {
      primaryColor: '#db2777',
      primaryForeground: '#fdf2f8',
      accentColor: '#fdf2f8',
      sidebarColor: '#2d1525',
      sidebarForeground: '#fbcfe8',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Teal',
    nameEn: 'Teal',
    settings: {
      primaryColor: '#0d9488',
      primaryForeground: '#f0fdfa',
      accentColor: '#f0fdfa',
      sidebarColor: '#152e2c',
      sidebarForeground: '#ccfbf1',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
  {
    name: 'Tamna',
    nameEn: 'Dark',
    settings: {
      primaryColor: '#6b7280',
      primaryForeground: '#f9fafb',
      accentColor: '#f3f4f6',
      sidebarColor: '#111827',
      sidebarForeground: '#e5e7eb',
      borderRadius: '0.625rem',
      logo: null,
      companyName: '',
    },
  },
]
