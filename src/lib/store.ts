import { create } from 'zustand'

export type ModuleType =
  | 'dashboard'
  | 'finansije'
  | 'fakture'
  | 'magacin'
  | 'partneri'
  | 'nabavka'
  | 'izvestaji'

interface AppState {
  activeModule: ModuleType
  setActiveModule: (module: ModuleType) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
}))
