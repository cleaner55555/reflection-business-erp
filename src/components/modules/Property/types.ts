export type Property = {
  id: string
  propertyNo: string
  title: string
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'office'
  transactionType: 'sale' | 'rent' | 'both'
  status: 'available' | 'reserved' | 'sold' | 'rented' | 'off_market'
  address: string
  city: string
  neighborhood: string
  area: number
  landArea: number
  price: number
  pricePerSqm: number
  bedrooms: number
  bathrooms: number
  floor: string
  yearBuilt: number
  heating: 'central' | 'gas' | 'electric' | 'wood' | 'ac' | 'none'
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished'
  parking: boolean
  elevator: boolean
  terrace: boolean
  registered: boolean
  agent: string
  listedDate: string
  views: number
  inquiries: number
  notes: string
}
