# Task 6-2: Split 3 Next.js modules into smaller files

## Summary
Successfully split 3 large monolithic module files into 4-file architecture (types.ts, data.ts, components.tsx, index.tsx).

## Modules Processed

### 1. Backup (`BackupModul`) — 232 lines → 4 files
- **types.ts** (17 lines): `BackupRecord`, `BackupSchedule` interfaces
- **data.ts** (19 lines): `INITIAL_BACKUPS`, `INITIAL_SCHEDULES` arrays
- **components.tsx** (~170 lines): `getTypeBadge`, `getStatusBadge`, `getFreqLabel` helpers + `BackupKpiCards`, `BackupTableSection`, `ScheduleList`, `BackupTabs` components
- **index.tsx** (~75 lines): State, useEffect, handlers, composition only

### 2. Barcode (`Barkod`) — 198 lines → 4 files
- **types.ts** (10 lines): `BarcodeItem` interface
- **data.ts** (17 lines): `INITIAL_ITEMS` array
- **components.tsx** (~170 lines): `getTypeBadge` helper + `BarcodeScanCard`, `BarcodeKpiCards`, `BarcodeTableSection`, `BarcodeFormDialog`, `BarcodeHeader` components
- **index.tsx** (~85 lines): State, useEffect, handlers, composition only

### 3. Standards (`StandardiKvaliteta`) — 197 lines → 4 files
- **types.ts** (22 lines): `Finding`, `Standard` interfaces
- **data.ts** (30 lines): `INITIAL_DATA`, `STATUSES`, `CATEGORIES` maps
- **components.tsx** (~140 lines): `getStatusBadge`, `getCategoryBadge` helpers + `StandardsKpiCards`, `StandardsTableSection`, `StandardDetailDialog`, `StandardsHeader` components
- **index.tsx** (~45 lines): State, useEffect, handlers, composition only

## Rules Followed
- `'use client'` only in index.tsx and components.tsx (not in types.ts or data.ts)
- Each module's existing data.ts was read first, then overwritten with correct extracted data
- Same exported function names preserved: `BackupModul`, `Barkod`, `StandardiKvaliteta`
- No functionality changes — all UI, logic, and behavior identical
- Existing data.ts files were generic stubs; replaced with actual module-specific data

## Lint Result
- **0 errors** in the 3 modified modules
- All 51 pre-existing lint errors are in unrelated modules (TimeTracking, Trucks, UserManagement, etc.)
- Dev server compiles without errors
