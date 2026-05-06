export type Book = {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string
  year: number
  category: 'fiction' | 'science' | 'technical' | 'history' | 'philosophy' | 'art' | 'law' | 'economics' | 'medicine' | 'education'
  totalCopies: number
  availableCopies: number
  borrowedCount: number
  location: string
  status: 'available' | 'limited' | 'reference_only' | 'lost' | 'damaged'
  language: string
  pages: number
  addedDate: string
  notes: string
}
