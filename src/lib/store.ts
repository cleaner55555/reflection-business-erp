import { create } from 'zustand'

export type ModuleType =
  | 'dashboard'
  | 'finansije'
  | 'fakture'
  | 'magacin'
  | 'partneri'
  | 'nabavka'
  | 'crm'
  | 'kalendar'
  | 'zaposleni'
  | 'projekti'
  | 'sredstva'
  | 'dokumenta'
  | 'izvestaji'
  | 'knjigovodstvo'
  | 'protokol'
  | 'edukacija'
  | 'vozni-park'
  | 'kafe-restoran'
  | 'podesavanja'
  | 'email-marketing'
  | 'rent-a-car'
  | 'integracije'
  | 'bank-sync'
  | 'notifications'

interface AppState {
  activeModule: ModuleType
  setActiveModule: (module: ModuleType) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
}))
