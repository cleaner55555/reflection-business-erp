export type Measurement = {
  id: string
  code: string
  product: string
  parameter: string
  nominalValue: string
  unit: string
  measuredValue: string
  tolerance: string
  deviation: string
  status: 'ok' | 'warning' | 'fail' | 'pending'
  instrument: string
  operator: string
  station: string
  batch: string
  date: string
  notes: string
}
