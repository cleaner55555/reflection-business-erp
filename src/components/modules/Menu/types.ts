export type MenuItem = {
  id: string
  name: string
  description: string
  category: 'appetizer' | 'soup' | 'salad' | 'main_course' | 'dessert' | 'drink' | 'side_dish' | 'breakfast' | 'grill'
  price: number
  preparationTime: number
  calories: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  isAvailable: boolean
  allergens: string[]
  ingredients: string[]
  rating: number
  orderCount: number
  notes: string
}
