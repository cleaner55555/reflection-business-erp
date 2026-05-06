export type LabEquipment = {
  id: string
  inventoryNo: string
  name: string
  category: 'measurement' | 'optical' | 'electrical' | 'chemical' | 'mechanical' | 'digital'
  manufacturer: string
  model: string
  serialNo: string
  location: string
  status: 'operational' | 'calibration' | 'maintenance' | 'out_of_order' | 'stored'
  purchaseDate: string
  purchasePrice: number
  lastCalibration: string
  nextCalibration: string
  responsible: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  notes: string
}
