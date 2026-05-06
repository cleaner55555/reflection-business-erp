# Task 4 — Theme Customization Hook + Logo Management

## Agent: Main Coordinator

## Work Log
- Read existing project files: Podesavanja.tsx, store.ts, globals.css, settings API route, helpers.ts, worklog.md
- Created `/src/lib/theme.ts` — Zustand store for theme customization
- Created `/src/lib/theme-presets.ts` — 8 predefined theme presets (Green, Blue, Purple, Red, Orange, Pink, Teal, Dark)

## Files Created

### `/src/lib/theme.ts`
- **`ThemeSettings` interface**: primaryColor, primaryForeground, accentColor, sidebarColor, sidebarForeground, borderRadius, logo, companyName
- **`DEFAULT_THEME`**: Matches current green CSS theme (`#16a34a` primary, `#1a2e1e` sidebar)
- **Color utilities**: `hexToRgb`, `rgbToHex`, `lightenHex`, `darkenHex`, `isValidHex` — all exported
- **`useThemeStore` Zustand hook**:
  - `_initialized` / `_loading` flags for one-time init
  - `ensureLoaded()` — fetches from `/api/settings?group=theme`, fills defaults, applies CSS vars
  - `updateThemeSettings(partial)` — validates hex colors, merges with defaults, updates store, applies CSS vars, saves to API (PUT `/api/settings`)
  - `applyThemeColors()` — applies all CSS custom properties to `document.documentElement.style`
  - `resetTheme()` — restores DEFAULT_THEME, applies CSS vars, saves to API
  - Auto-generates `--sidebar-accent` by lightening sidebar color 15%
  - SSR-safe: all DOM operations guarded with `typeof document !== 'undefined'`
- API keys: `theme_primary_color`, `theme_primary_foreground`, `theme_accent_color`, `theme_sidebar_color`, `theme_sidebar_foreground`, `theme_border_radius`, `theme_logo`, `theme_company_name` (all in group "theme")

### `/src/lib/theme-presets.ts`
- **`ThemePreset` interface**: name (Serbian), nameEn (English), settings (ThemeSettings)
- **8 presets**: Zelena (Default), Plava, Ljubičasta, Crvena, Narandžasta, Roza, Teal, Tamna
- Each preset has hand-picked, harmonious color schemes with matching sidebar/foreground colors
- All presets use `borderRadius: '0.625rem'`, `logo: null`, `companyName: ''`

## CSS Variables Applied
The store sets these CSS custom properties on `:root`:
- `--primary`, `--primary-foreground`
- `--accent`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`
- `--ring`
- `--radius`

## Verification
- ESLint passes with zero errors
- No existing files were modified
