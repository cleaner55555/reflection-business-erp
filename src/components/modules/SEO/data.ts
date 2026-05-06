import type { SeoPage, Keyword } from './types'

export const INITIAL_PAGES: SeoPage[] = [
  { id: '1', url: '/', title: 'Reflection Business — ERP Sistem za Srbiju', metaDescription: 'Kompletni ERP sistem za preduzeća u Srbiji. Knjigovodstvo, fakture, CRM, inventory...', keywords: 'erp srbija, knjigovodstvo, fakturisanje', status: 'indexed', score: 92, lastCrawled: '2024-06-15T08:00:00', clicks: 342, impressions: 2100, ctr: 16.3, position: 4.2, wordCount: 1250 },
  { id: '2', url: '/cenovnik', title: 'Cenovnik — Reflection Business ERP', metaDescription: 'Pregled cena za sve module Reflection Business ERP sistema.', keywords: 'erp cenovnik, cena erp', status: 'indexed', score: 78, lastCrawled: '2024-06-14T10:00:00', clicks: 128, impressions: 890, ctr: 14.4, position: 5.8, wordCount: 680 },
  { id: '3', url: '/kontakt', title: 'Kontakt — Reflection Business', metaDescription: 'Kontaktirajte nas za demo ili ponudu ERP sistema.', keywords: 'kontakt erp, demo', status: 'indexed', score: 65, lastCrawled: '2024-06-13T09:00:00', clicks: 89, impressions: 560, ctr: 15.9, position: 7.1, wordCount: 320 },
  { id: '4', url: '/blog/erp-srbija-vodic', title: 'Kompletni vodič za ERP u Srbiji', metaDescription: 'Sve što trebate da znate o implementaciji ERP sistema...', keywords: 'erp vodič, erp srbija', status: 'indexed', score: 88, lastCrawled: '2024-06-15T07:00:00', clicks: 567, impressions: 4500, ctr: 12.6, position: 2.8, wordCount: 2400 },
  { id: '5', url: '/funkcije', title: 'Funkcije — Reflection Business', metaDescription: 'Pregled svih funkcija ERP sistema.', keywords: 'erp funkcije, moduli', status: 'not_indexed', score: 45, lastCrawled: '2024-06-12T11:00:00', clicks: 0, impressions: 120, ctr: 0, position: 28.5, wordCount: 450 },
  { id: '6', url: '/onama', title: 'O nama — Reflection Business', metaDescription: 'Upoznajte Reflection Business tim i istoriju kompanije.', keywords: 'o nama, reflection', status: 'indexed', score: 72, lastCrawled: '2024-06-14T08:00:00', clicks: 45, impressions: 340, ctr: 13.2, position: 8.4, wordCount: 520 },
]

export const INITIAL_KEYWORDS: Keyword[] = [
  { id: '1', keyword: 'erp srbija', position: 3, change: 1, volume: 1900, url: '/', difficulty: 'hard' },
  { id: '2', keyword: 'knjigovodstveni program', position: 5, change: -1, volume: 2400, url: '/', difficulty: 'hard' },
  { id: '3', keyword: 'fakturisanje online', position: 2, change: 2, volume: 880, url: '/funkcije', difficulty: 'medium' },
  { id: '4', keyword: 'erp vodič', position: 1, change: 0, volume: 590, url: '/blog/erp-srbija-vodic', difficulty: 'easy' },
  { id: '5', keyword: 'crm za mala preduzeća', position: 7, change: 3, volume: 720, url: '/funkcije', difficulty: 'medium' },
  { id: '6', keyword: 'inventar program', position: 12, change: -2, volume: 480, url: '/funkcije', difficulty: 'medium' },
  { id: '7', keyword: 'poslovni softver srbija', position: 4, change: 1, volume: 320, url: '/', difficulty: 'easy' },
  { id: '8', keyword: 'rabat sistem', position: 9, change: 5, volume: 210, url: '/funkcije', difficulty: 'easy' },
]
