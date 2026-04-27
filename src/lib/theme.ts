import { create } from 'zustand'

// ============ TYPES ============

export interface ThemeSettings {
  primaryColor: string
  primaryForeground: string
  accentColor: string
  sidebarColor: string
  sidebarForeground: string
  borderRadius: string
  logo: string | null
  companyName: string
}

interface ThemeState extends ThemeSettings {
  _initialized: boolean
  _loading: boolean
  ensureLoaded: () => Promise<void>
  updateThemeSettings: (settings: Partial<ThemeSettings>) => Promise<void>
  applyThemeColors: () => void
  resetTheme: () => Promise<void>
}

// ============ DEFAULTS ============

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#16a34a',
  primaryForeground: '#f0fdf4',
  accentColor: '#f0fdf4',
  sidebarColor: '#1a2e1e',
  sidebarForeground: '#e8f5e9',
  borderRadius: '0.625rem',
  logo: null,
  companyName: '',
}

// ============ COLOR UTILITIES ============

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return null
  const full = clean.length === 3
    ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
    : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
}

function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount,
  )
}

function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(
    rgb.r * (1 - amount),
    rgb.g * (1 - amount),
    rgb.b * (1 - amount),
  )
}

function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
}

// ============ CSS VARIABLE APPLICATION ============

function applyToDOM(settings: ThemeSettings): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement.style

  // Primary colors
  root.setProperty('--primary', settings.primaryColor)
  root.setProperty('--primary-foreground', settings.primaryForeground)

  // Accent
  root.setProperty('--accent', settings.accentColor)

  // Sidebar colors
  root.setProperty('--sidebar', settings.sidebarColor)
  root.setProperty('--sidebar-foreground', settings.sidebarForeground)
  root.setProperty('--sidebar-primary', settings.primaryColor)
  root.setProperty('--sidebar-primary-foreground', settings.primaryForeground)

  // Sidebar accent — slightly lighter version of sidebar
  const sidebarAccent = lightenHex(settings.sidebarColor, 0.15)
  root.setProperty('--sidebar-accent', sidebarAccent)

  // Ring
  root.setProperty('--ring', settings.primaryColor)

  // Radius
  root.setProperty('--radius', settings.borderRadius)
}

// ============ API INTEGRATION ============

interface AppSettingResponse {
  id: string
  key: string
  value: string
  label: string | null
  type: string
  group: string
}

async function fetchThemeFromAPI(): Promise<Partial<ThemeSettings>> {
  try {
    const res = await fetch('/api/settings?group=theme')
    if (!res.ok) return {}
    const data: AppSettingResponse[] = await res.json()
    if (!Array.isArray(data) || data.length === 0) return {}

    const map: Record<string, string> = {}
    data.forEach((s) => {
      map[s.key] = s.value
    })

    return {
      primaryColor: map['theme_primary_color'] || undefined,
      primaryForeground: map['theme_primary_foreground'] || undefined,
      accentColor: map['theme_accent_color'] || undefined,
      sidebarColor: map['theme_sidebar_color'] || undefined,
      sidebarForeground: map['theme_sidebar_foreground'] || undefined,
      borderRadius: map['theme_border_radius'] || undefined,
      logo: map['theme_logo'] || null,
      companyName: map['theme_company_name'] || undefined,
    }
  } catch {
    return {}
  }
}

async function saveThemeToAPI(settings: ThemeSettings): Promise<void> {
  const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = [
    { key: 'theme_primary_color', value: settings.primaryColor, label: 'Primarna boja', type: 'color', group: 'theme' },
    { key: 'theme_primary_foreground', value: settings.primaryForeground, label: 'Primarni foreground', type: 'color', group: 'theme' },
    { key: 'theme_accent_color', value: settings.accentColor, label: 'Boja akcenta', type: 'color', group: 'theme' },
    { key: 'theme_sidebar_color', value: settings.sidebarColor, label: 'Boja bočne trake', type: 'color', group: 'theme' },
    { key: 'theme_sidebar_foreground', value: settings.sidebarForeground, label: 'Foreground bočne trake', type: 'color', group: 'theme' },
    { key: 'theme_border_radius', value: settings.borderRadius, label: 'Zaobljenost ivica', type: 'text', group: 'theme' },
    { key: 'theme_logo', value: settings.logo || '', label: 'Logo', type: 'text', group: 'theme' },
    { key: 'theme_company_name', value: settings.companyName, label: 'Naziv firme (tema)', type: 'text', group: 'theme' },
  ]

  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  })
}

// ============ BUILD FULL SETTINGS (fill defaults for partial) ============

function buildFullSettings(partial: Partial<ThemeSettings>): ThemeSettings {
  return {
    primaryColor: partial.primaryColor && isValidHex(partial.primaryColor)
      ? partial.primaryColor
      : DEFAULT_THEME.primaryColor,
    primaryForeground: partial.primaryForeground && isValidHex(partial.primaryForeground)
      ? partial.primaryForeground
      : DEFAULT_THEME.primaryForeground,
    accentColor: partial.accentColor && isValidHex(partial.accentColor)
      ? partial.accentColor
      : DEFAULT_THEME.accentColor,
    sidebarColor: partial.sidebarColor && isValidHex(partial.sidebarColor)
      ? partial.sidebarColor
      : DEFAULT_THEME.sidebarColor,
    sidebarForeground: partial.sidebarForeground && isValidHex(partial.sidebarForeground)
      ? partial.sidebarForeground
      : DEFAULT_THEME.sidebarForeground,
    borderRadius: partial.borderRadius || DEFAULT_THEME.borderRadius,
    logo: partial.logo ?? DEFAULT_THEME.logo,
    companyName: partial.companyName ?? DEFAULT_THEME.companyName,
  }
}

// ============ STORE ============

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Defaults
  ...DEFAULT_THEME,
  _initialized: false,
  _loading: false,

  ensureLoaded: async () => {
    const state = get()
    if (state._initialized || state._loading) return

    set({ _loading: true })
    try {
      const partial = await fetchThemeFromAPI()
      const full = buildFullSettings(partial)
      set({ ...full, _initialized: true, _loading: false })
      applyToDOM(full)
    } catch {
      // Apply defaults on error
      set({ _initialized: true, _loading: false })
      applyToDOM(DEFAULT_THEME)
    }
  },

  updateThemeSettings: async (partial: Partial<ThemeSettings>) => {
    const current = get()
    const updated = buildFullSettings({
      primaryColor: partial.primaryColor ?? current.primaryColor,
      primaryForeground: partial.primaryForeground ?? current.primaryForeground,
      accentColor: partial.accentColor ?? current.accentColor,
      sidebarColor: partial.sidebarColor ?? current.sidebarColor,
      sidebarForeground: partial.sidebarForeground ?? current.sidebarForeground,
      borderRadius: partial.borderRadius ?? current.borderRadius,
      logo: partial.logo !== undefined ? partial.logo : current.logo,
      companyName: partial.companyName !== undefined ? partial.companyName : current.companyName,
    })

    set(updated)
    applyToDOM(updated)

    // Persist to API
    try {
      await saveThemeToAPI(updated)
    } catch {
      // Silently fail — store state is already updated
    }
  },

  applyThemeColors: () => {
    const state = get()
    applyToDOM({
      primaryColor: state.primaryColor,
      primaryForeground: state.primaryForeground,
      accentColor: state.accentColor,
      sidebarColor: state.sidebarColor,
      sidebarForeground: state.sidebarForeground,
      borderRadius: state.borderRadius,
      logo: state.logo,
      companyName: state.companyName,
    })
  },

  resetTheme: async () => {
    set({ ...DEFAULT_THEME })
    applyToDOM(DEFAULT_THEME)
    try {
      await saveThemeToAPI(DEFAULT_THEME)
    } catch {
      // Silently fail
    }
  },
}))

// ============ EXPORTED UTILITIES ============

export { hexToRgb, rgbToHex, lightenHex, darkenHex, isValidHex }
