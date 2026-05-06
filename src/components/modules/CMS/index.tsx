'use client'
import { RefreshCw, BarChart3, FileText, Layout, Image, RotateCcw, Globe } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar } from '@/components/ui/calendar'

import { DialogBlock1, DialogBlock0, PregledTab, ContentTab, TypesTab, MediaTab, RevisionsTab, SchedulerTab, SeoTabExtended } from './components'

export function CMS() {
  const {activeTab, allTags, catFilter, content, dialogOpen, drafts, editing, editorOpen, filtered, folderFilter, folders, handleCreate, handleSave, i, item, k, lang, loadData, media, mockAuthors, mockCategories, mockContentTypes, openCreate, published, recentContent, recentlyPublished, revisions, runSeoAnalysis, sc, scheduled, search, selected, selectedContent, seoPreview, setActiveTab, setCatFilter, setContent, setDialogOpen, setEditorOpen, setFolderFilter, setSelected, setSelectedContent, setStatusFilter, setTypeFilter, setUploadOpen, sitemapItems, statusFilter, tag, toolbarActions, topContent, typeFilter, typePie, types, uploadOpen} = useCMS()
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
  )
}

// ============ MOCK DATA ============

const mockContentTypes: ContentType[] = [
  { id: 'ct-1', name: 'Blog Članak', slug: 'blog-post', description: 'Blog post sa kategorijama, tagovima i SEO', icon: 'Newspaper', fields: [{ id: 'f1', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f2', name: 'Istaknuta slika', type: 'image', required: false }, { id: 'f3', name: 'Tagovi', type: 'tags', required: false }, { id: 'f4', name: 'Autor', type: 'select', required: true, options: ['Marko', 'Ana', 'Nikola'] }], itemCount: 8, template: 'blog' },
  { id: 'ct-2', name: 'Stranica', slug: 'page', description: 'Statična stranica (O nama, Kontakt...)', icon: 'Layout', fields: [{ id: 'f5', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f6', name: 'Naslovna slika', type: 'image', required: false }], itemCount: 4, template: 'page' },
  { id: 'ct-3', name: 'Članak', slug: 'article', description: 'Dugački članak sa sekcijama', icon: 'BookOpen', fields: [{ id: 'f7', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f8', name: 'Autor', type: 'select', required: true, options: ['Marko', 'Ana', 'Nikola', 'Jelena'] }, { id: 'f9', name: 'Kategorija', type: 'select', required: false, options: ['Tehnologija', 'Biznis', 'Dizajn'] }], itemCount: 3, template: 'article' },
  { id: 'ct-4', name: 'Vest', slug: 'news', description: 'Kratke vesti sa hitnim objavama', icon: 'Megaphone', fields: [{ id: 'f10', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f11', name: 'Istaknuta', type: 'boolean', required: false }, { id: 'f12', name: 'Izvor', type: 'text', required: false }], itemCount: 2, template: 'news' },
  { id: 'ct-5', name: 'Landing Page', slug: 'landing', description: 'Promo stranica za kampanje', icon: 'Globe2', fields: [{ id: 'f13', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f14', name: 'CTA tekst', type: 'text', required: true }, { id: 'f15', name: 'CTA link', type: 'text', required: true }], itemCount: 1, template: 'landing' },
  { id: 'ct-6', name: 'FAQ', slug: 'faq', description: 'Pitanja i odgovori', icon: 'HelpCircle', fields: [{ id: 'f16', name: 'Pitanje', type: 'richtext', required: true }, { id: 'f17', name: 'Odgovor', type: 'richtext', required: true }, { id: 'f18', name: 'Kategorija', type: 'select', required: false, options: ['Opšte', 'Proizvodi', 'Plaćanje', 'Dostava'] }], itemCount: 2, template: 'faq' },
  { id: 'ct-7', name: 'Dokumentacija', slug: 'docs', description: 'Tehnička dokumentacija', icon: 'FileCode', fields: [{ id: 'f19', name: 'Sadržaj', type: 'richtext', required: true }, { id: 'f20', name: 'Verzija', type: 'text', required: false }, { id: 'f21', name: 'Kategorija', type: 'select', required: false, options: ['API', 'Setup', 'Troubleshooting', 'Migration'] }], itemCount: 1, template: 'docs' },
]

const mockCategories: ContentCategory[] = [
  { id: 'cat-1', name: 'Tehnologija', slug: 'tehnologija', description: 'IT i tech vesti', parentId: null, color: '#3b82f6', itemCount: 5 },
  { id: 'cat-2', name: 'Biznis', slug: 'biznis', description: 'Poslovne vesti', parentId: null, color: '#22c55e', itemCount: 4 },
  { id: 'cat-3', name: 'Dizajn', slug: 'dizajn', description: 'UI/UX dizajn', parentId: null, color: '#8b5cf6', itemCount: 3 },
  { id: 'cat-4', name: 'Marketing', slug: 'marketing', description: 'Digitalni marketing', parentId: null, color: '#f59e0b', itemCount: 3 },
  { id: 'cat-5', name: 'Proizvodi', slug: 'proizvodi', description: 'Novosti o proizvodima', parentId: null, color: '#ef4444', itemCount: 2 },
  { id: 'cat-6', name: 'Vodiči', slug: 'vodici', description: 'Tutorijali i uputstva', parentId: 'cat-1', color: '#06b6d4', itemCount: 2 },
  { id: 'cat-7', name: 'API', slug: 'api', description: 'API dokumentacija', parentId: 'cat-1', color: '#14b8a6', itemCount: 1 },
  { id: 'cat-8', name: 'Startup', slug: 'startup', description: 'Startup ekosistem', parentId: 'cat-2', color: '#ec4899', itemCount: 2 },
]

const mockAuthors = [
  { id: 'auth-1', name: 'Marko Petrović', avatar: 'MP' },
  { id: 'auth-2', name: 'Ana Jovanović', avatar: 'AJ' },
  { id: 'auth-3', name: 'Nikola Stanković', avatar: 'NS' },
  { id: 'auth-4', name: 'Jelena Milić', avatar: 'JM' },
  { id: 'auth-5', name: 'Ivan Savić', avatar: 'IS' },
]

const mockContent: ContentItem[] = [
  { id: 'c-1', title: 'Kako napraviti SEO strategiju za 2025', slug: 'seo-strategija-2025', typeId: 'ct-1', categoryId: 'cat-4', authorId: 'auth-1', status: 'published', content: '<h2>SEO je ključan</h2><p>SEO optimizacija je osnova svake uspešne online prisutnosti...</p><p>U ovom članku ćemo pokriti najnovije trendove u SEO strategiji za 2025 godinu.</p>', excerpt: 'Kompletni vodič za SEO strategiju u 2025. godini sa praktičnim savetima.', featuredImage: '/images/seo-2025.jpg', tags: ['SEO', 'Marketing', '2025'], views: 4520, wordCount: 1850, readingTime: 8, seoTitle: 'SEO Strategija 2025 — Kompletni Vodič | Reflection', seoDescription: 'Naučite kako da kreirate efikasnu SEO strategiju za 2025 godinu.', ogImage: '/images/seo-og.jpg', publishedAt: '2025-01-15T10:00:00Z', scheduledAt: '', createdAt: '2025-01-14T08:00:00Z', updatedAt: '2025-01-15T10:00:00Z', revisionCount: 3, locale: 'sr' },
  { id: 'c-2', title: 'Uvod u React Server Components', slug: 'react-server-components', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-2', status: 'published', content: '<h2>Šta su RSC?</h2><p>React Server Components donose revoluciju u React razvoj...</p>', excerpt: 'Sve što treba da znate o React Server Components u Next.js 16.', featuredImage: '/images/rsc.jpg', tags: ['React', 'Next.js', 'RSC'], views: 3890, wordCount: 2400, readingTime: 12, seoTitle: 'React Server Components — Uvod | Reflection', seoDescription: 'Sve što treba da znate o React Server Components.', ogImage: '/images/rsc-og.jpg', publishedAt: '2025-01-20T09:00:00Z', scheduledAt: '', createdAt: '2025-01-19T14:00:00Z', updatedAt: '2025-01-20T09:00:00Z', revisionCount: 5, locale: 'sr' },
  { id: 'c-3', title: 'O nama', slug: 'o-nama', typeId: 'ct-2', categoryId: 'cat-2', authorId: 'auth-1', status: 'published', content: '<h2>Reflection Business</h2><p>Reflection Business je kompletni ERP sistem za mala i srednja preduzeća...</p>', excerpt: 'Upoznajte Reflection Business — kompletni ERP za vašu kompaniju.', featuredImage: '/images/about.jpg', tags: ['kompanija'], views: 5600, wordCount: 900, readingTime: 4, seoTitle: 'O nama — Reflection Business', seoDescription: 'Reflection Business je kompletni ERP sistem za mala i srednja preduzeća.', ogImage: '', publishedAt: '2025-01-01T00:00:00Z', scheduledAt: '', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-01T00:00:00Z', revisionCount: 8, locale: 'sr' },
  { id: 'c-4', title: 'Kontakt', slug: 'kontakt', typeId: 'ct-2', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', content: '<h2>Kontaktirajte nas</h2><p>Posaljite upit putem forme ili nas pozovite...</p>', excerpt: 'Kontaktirajte Reflection Business tim.', featuredImage: '', tags: ['kontakt'], views: 3200, wordCount: 450, readingTime: 2, seoTitle: 'Kontakt — Reflection Business', seoDescription: 'Kontaktirajte Reflection Business tim za više informacija.', ogImage: '', publishedAt: '2025-01-01T00:00:00Z', scheduledAt: '', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-01T00:00:00Z', revisionCount: 4, locale: 'sr' },
  { id: 'c-5', title: 'AI transformiše biznis u Srbiji', slug: 'ai-biznis-srbija', typeId: 'ct-4', categoryId: 'cat-2', authorId: 'auth-2', status: 'published', content: '<h2>AI revolucija</h2><p>Veštačka inteligencija menja način na koji poslujemo u Srbiji...</p>', excerpt: 'Kako AI menja poslovni krajolik u Srbiji.', featuredImage: '/images/ai-srbija.jpg', tags: ['AI', 'Srbija', 'Biznis'], views: 3210, wordCount: 1200, readingTime: 5, seoTitle: 'AI Biznis Srbija 2025 | Reflection', seoDescription: 'Kako veštačka inteligencija transformiše biznis u Srbiji.', ogImage: '/images/ai-og.jpg', publishedAt: '2025-02-20T10:00:00Z', scheduledAt: '', createdAt: '2025-02-19T09:00:00Z', updatedAt: '2025-02-20T10:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-6', title: '10 saveta za produktivniji rad', slug: 'saveti-za-produktivnost', typeId: 'ct-3', categoryId: 'cat-2', authorId: 'auth-3', status: 'published', content: '<h2>Produktivnost</h2><p>Pomodoro tehnika, time blocking, deep work...</p>', excerpt: '10 praktičnih saveta za poboljšanje produktivnosti.', featuredImage: '/images/productivity.jpg', tags: ['Produktivnost', 'Saveti'], views: 2340, wordCount: 1600, readingTime: 7, seoTitle: '10 Saveta za Produktivnost | Reflection', seoDescription: 'Poboljšajte svoju produktivnost sa ovim 10 praktičnih saveta.', ogImage: '', publishedAt: '2025-02-01T11:00:00Z', scheduledAt: '', createdAt: '2025-01-30T10:00:00Z', updatedAt: '2025-02-01T11:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-7', title: 'Next.js 16 — Nove mogućnosti', slug: 'nextjs-16-novosti', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-1', status: 'published', content: '<h2>Next.js 16</h2><p>Nove mogućnosti: turbopack, server actions v2...</p>', excerpt: 'Upoznajte se sa novim funkcionalnostima u Next.js 16.', featuredImage: '/images/nextjs16.jpg', tags: ['Next.js', 'React', 'Framework'], views: 5670, wordCount: 2100, readingTime: 10, seoTitle: 'Next.js 16 Nove Mogućnosti | Reflection', seoDescription: 'Upoznajte se sa novim funkcionalnostima u Next.js 16.', ogImage: '', publishedAt: '2025-02-10T08:00:00Z', scheduledAt: '', createdAt: '2025-02-09T16:00:00Z', updatedAt: '2025-02-10T08:00:00Z', revisionCount: 4, locale: 'sr' },
  { id: 'c-8', title: 'UI/UX dizajn trendovi 2025', slug: 'ui-ux-trendovi-2025', typeId: 'ct-1', categoryId: 'cat-3', authorId: 'auth-4', status: 'published', content: '<h2>Trendovi</h2><p>Glassmorphism, neubrutalizam, 3D elementi...</p>', excerpt: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', featuredImage: '/images/uiux.jpg', tags: ['Dizajn', 'UI', 'UX'], views: 1890, wordCount: 1400, readingTime: 7, seoTitle: 'UI/UX Trendovi 2025 | Reflection', seoDescription: 'Najnoviji trendovi u UI/UX dizajnu za 2025 godinu.', ogImage: '', publishedAt: '2025-02-15T14:00:00Z', scheduledAt: '', createdAt: '2025-02-14T12:00:00Z', updatedAt: '2025-02-15T14:00:00Z', revisionCount: 1, locale: 'sr' },
  { id: 'c-9', title: 'Vodič za TypeScript tipove', slug: 'typescript-tipovi', typeId: 'ct-3', categoryId: 'cat-1', authorId: 'auth-3', status: 'scheduled', content: '<h2>TypeScript</h2><p>Unioni, interfejsi, generici...</p>', excerpt: 'Kompletni vodič za TypeScript tipove.', featuredImage: '', tags: ['TypeScript', 'Programiranje'], views: 0, wordCount: 3200, readingTime: 15, seoTitle: 'TypeScript Tipovi Vodič | Reflection', seoDescription: 'Kompletni vodič za TypeScript tipove.', ogImage: '', publishedAt: '', scheduledAt: '2025-03-01T08:00:00Z', createdAt: '2025-02-25T10:00:00Z', updatedAt: '2025-02-25T10:00:00Z', revisionCount: 2, locale: 'sr' },
  { id: 'c-10', title: 'Optimizacija baze podataka', slug: 'optimizacija-baze', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-1', status: 'draft', content: '<h2>Performanse</h2><p>Indeksi, query planning, caching...</p>', excerpt: 'Kako optimizovati upite baze podataka.', featuredImage: '', tags: ['Database', 'Performance'], views: 0, wordCount: 2200, readingTime: 11, seoTitle: 'Optimizacija Baze Podataka | Reflection', seoDescription: 'Kako optimizovati upite baze podataka.', ogImage: '', publishedAt: '', scheduledAt: '', createdAt: '2025-02-28T14:00:00Z', updatedAt: '2025-02-28T14:00:00Z', revisionCount: 0, locale: 'sr' },
  { id: 'c-11', title: 'API Reference v2.0', slug: 'api-reference-v2', typeId: 'ct-7', categoryId: 'cat-7', authorId: 'auth-5', status: 'published', content: '<h2>API v2.0</h2><p>Novi endpointi, autentikacija, rate limiting...</p>', excerpt: 'Službena API dokumentacija za Reflection Business v2.0.', featuredImage: '', tags: ['API', 'Dokumentacija'], views: 1200, wordCount: 4500, readingTime: 20, seoTitle: 'API Reference v2.0 | Reflection Business', seoDescription: 'Službena API dokumentacija za Reflection Business v2.0.', ogImage: '', publishedAt: '2025-01-25T10:00:00Z', scheduledAt: '', createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z', revisionCount: 12, locale: 'sr' },
  { id: 'c-12', title: 'Česta pitanja — Plaćanje', slug: 'faq-placanje', typeId: 'ct-6', categoryId: 'cat-2', authorId: 'auth-4', status: 'published', content: '<h2>Plaćanje</h2><p>Koje metode plaćanja prihvatate? Da li imate mesečne planove?</p>', excerpt: 'Česta pitanja o načinima plaćanja.', featuredImage: '', tags: ['FAQ', 'Plaćanje'], views: 890, wordCount: 600, readingTime: 3, seoTitle: 'FAQ — Plaćanje | Reflection Business', seoDescription: 'Česta pitanja o načinima plaćanja za Reflection Business.', ogImage: '', publishedAt: '2025-01-10T10:00:00Z', scheduledAt: '', createdAt: '2025-01-08T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z', revisionCount: 3, locale: 'sr' },
  { id: 'c-13', title: 'Promocija: 30% popusta na godišnju pretplatu', slug: 'promo-30-popust', typeId: 'ct-5', categoryId: 'cat-4', authorId: 'auth-2', status: 'scheduled', content: '<h2>Limited Offer</h2><p>Prijavite se do kraja meseca i dobijte 30% popusta...</p>', excerpt: '30% popusta na godišnju pretplatu do kraja meseca.', featuredImage: '/images/promo.jpg', tags: ['Promocija', 'Popust'], views: 0, wordCount: 350, readingTime: 2, seoTitle: '30% Popust Godišnja Pretplata | Reflection', seoDescription: 'Prijavite se do kraja meseca i dobijte 30% popusta.', ogImage: '/images/promo-og.jpg', publishedAt: '', scheduledAt: '2025-03-15T00:00:00Z', createdAt: '2025-02-28T16:00:00Z', updatedAt: '2025-02-28T16:00:00Z', revisionCount: 1, locale: 'sr' },
  { id: 'c-14', title: 'Društvene mreže za mala preduzeća', slug: 'drustvene-mreze-sme', typeId: 'ct-1', categoryId: 'cat-4', authorId: 'auth-4', status: 'draft', content: '<h2>Social Media Marketing</h2><p>Instagram, Facebook, LinkedIn strategija za SME...</p>', excerpt: 'Kako koristiti društvene mreže za rast biznisa.', featuredImage: '', tags: ['Social Media', 'Marketing', 'SME'], views: 0, wordCount: 1100, readingTime: 5, seoTitle: 'Društvene Mreže za SME | Reflection', seoDescription: 'Kako koristiti društvene mreže za rast malog biznisa.', ogImage: '', publishedAt: '', scheduledAt: '', createdAt: '2025-03-01T09:00:00Z', updatedAt: '2025-03-01T09:00:00Z', revisionCount: 0, locale: 'sr' },
  { id: 'c-15', title: 'DevOps prakse za timove', slug: 'devops-prakse', typeId: 'ct-1', categoryId: 'cat-1', authorId: 'auth-3', status: 'published', content: '<h2>CI/CD</h2><p>Docker, Kubernetes, GitHub Actions...</p>', excerpt: 'Najbolje DevOps prakse za razvojne timove.', featuredImage: '/images/devops.jpg', tags: ['DevOps', 'Docker', 'CI/CD'], views: 2670, wordCount: 2800, readingTime: 13, seoTitle: 'DevOps Prakse za Timove | Reflection', seoDescription: 'Najbolje DevOps prakse za razvojne timove.', ogImage: '', publishedAt: '2025-03-10T09:00:00Z', scheduledAt: '', createdAt: '2025-03-09T11:00:00Z', updatedAt: '2025-03-10T09:00:00Z', revisionCount: 3, locale: 'sr' },
]

const mockMedia: MediaItem[] = [
  { id: 'm-1', name: 'hero-banner.jpg', type: 'image', mimeType: 'image/jpeg', size: 245000, url: '/uploads/hero-banner.jpg', folderId: 'folder-1', alt: 'Hero banner', width: 1920, height: 600, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 3 },
  { id: 'm-2', name: 'logo-dark.png', type: 'image', mimeType: 'image/png', size: 45000, url: '/uploads/logo-dark.png', folderId: 'folder-1', alt: 'Logo tamna', width: 200, height: 60, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 8 },
  { id: 'm-3', name: 'logo-light.png', type: 'image', mimeType: 'image/png', size: 42000, url: '/uploads/logo-light.png', folderId: 'folder-1', alt: 'Logo svetla', width: 200, height: 60, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 6 },
  { id: 'm-4', name: 'product-catalog-2025.pdf', type: 'document', mimeType: 'application/pdf', size: 3200000, url: '/uploads/product-catalog-2025.pdf', folderId: 'folder-2', alt: '', width: 0, height: 0, uploadedAt: '2025-01-20T14:00:00Z', usageCount: 2 },
  { id: 'm-5', name: 'promo-video.mp4', type: 'video', mimeType: 'video/mp4', size: 15000000, url: '/uploads/promo-video.mp4', folderId: 'folder-3', alt: 'Promo video', width: 1920, height: 1080, uploadedAt: '2025-02-01T10:00:00Z', usageCount: 1 },
  { id: 'm-6', name: 'team-photo.jpg', type: 'image', mimeType: 'image/jpeg', size: 890000, url: '/uploads/team-photo.jpg', folderId: 'folder-4', alt: 'Tim foto', width: 1200, height: 800, uploadedAt: '2025-02-05T12:00:00Z', usageCount: 2 },
  { id: 'm-7', name: 'favicon.ico', type: 'icon', mimeType: 'image/x-icon', size: 4000, url: '/uploads/favicon.ico', folderId: 'folder-1', alt: 'Favicon', width: 32, height: 32, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 1 },
  { id: 'm-8', name: 'about-office.jpg', type: 'image', mimeType: 'image/jpeg', size: 1200000, url: '/uploads/about-office.jpg', folderId: 'folder-4', alt: 'Kancelarija', width: 1600, height: 900, uploadedAt: '2025-01-15T09:00:00Z', usageCount: 1 },
  { id: 'm-9', name: 'podcast-ep1.mp3', type: 'audio', mimeType: 'audio/mpeg', size: 8000000, url: '/uploads/podcast-ep1.mp3', folderId: 'folder-5', alt: 'Podcast epizoda 1', width: 0, height: 0, uploadedAt: '2025-02-20T16:00:00Z', usageCount: 0 },
  { id: 'm-10', name: 'og-default.jpg', type: 'image', mimeType: 'image/jpeg', size: 180000, url: '/uploads/og-default.jpg', folderId: 'folder-1', alt: 'OG default', width: 1200, height: 630, uploadedAt: '2025-01-10T10:00:00Z', usageCount: 5 },
  { id: 'm-11', name: 'user-guide.pdf', type: 'document', mimeType: 'application/pdf', size: 1500000, url: '/uploads/user-guide.pdf', folderId: 'folder-2', alt: '', width: 0, height: 0, uploadedAt: '2025-02-10T10:00:00Z', usageCount: 3 },
  { id: 'm-12', name: 'icon-settings.svg', type: 'icon', mimeType: 'image/svg+xml', size: 2000, url: '/uploads/icon-settings.svg', folderId: 'folder-1', alt: 'Settings ikona', width: 24, height: 24, uploadedAt: '2025-01-12T10:00:00Z', usageCount: 1 },
]

const mockFolders: MediaFolder[] = [
  { id: 'folder-1', name: 'Logotipi', parentId: null, itemCount: 4 },
  { id: 'folder-2', name: 'Dokumenta', parentId: null, itemCount: 2 },
  { id: 'folder-3', name: 'Video', parentId: null, itemCount: 1 },
  { id: 'folder-4', name: 'Fotografije', parentId: null, itemCount: 2 },
  { id: 'folder-5', name: 'Audio', parentId: null, itemCount: 1 },
  { id: 'folder-6', name: 'E-mail šablone', parentId: null, itemCount: 0 },
]

const mockRevisions: Revision[] = [
  { id: 'r-1', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Dodat novi odeljak o AI SEO alatima', wordCount: 1850, createdAt: '2025-01-15T10:00:00Z', restoredFrom: null },
  { id: 'r-2', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Ispravljena gramatika i formatiranje', wordCount: 1800, createdAt: '2025-01-14T16:00:00Z', restoredFrom: null },
  { id: 'r-3', contentId: 'c-1', contentTitle: 'Kako napraviti SEO strategiju za 2025', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Dodat section o lokalnom SEO', wordCount: 1650, createdAt: '2025-01-14T12:00:00Z', restoredFrom: null },
  { id: 'r-4', contentId: 'c-2', contentTitle: 'Uvod u React Server Components', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Ažuriran primer koda za Next.js 16', wordCount: 2400, createdAt: '2025-01-20T09:00:00Z', restoredFrom: null },
  { id: 'r-5', contentId: 'c-2', contentTitle: 'Uvod u React Server Components', authorId: 'auth-2', authorName: 'Ana Jovanović', changeSummary: 'Dodat odeljak o data fetching', wordCount: 2200, createdAt: '2025-01-19T18:00:00Z', restoredFrom: null },
  { id: 'r-6', contentId: 'c-3', contentTitle: 'O nama', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Ažuriran tekst o kompaniji', wordCount: 900, createdAt: '2025-01-01T00:00:00Z', restoredFrom: null },
  { id: 'r-7', contentId: 'c-7', contentTitle: 'Next.js 16 — Nove mogućnosti', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Dodat section o Turbopack', wordCount: 2100, createdAt: '2025-02-10T08:00:00Z', restoredFrom: null },
  { id: 'r-8', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-5', authorName: 'Ivan Savić', changeSummary: 'Novi endpoint: /api/v2/webhooks', wordCount: 4500, createdAt: '2025-01-25T10:00:00Z', restoredFrom: null },
  { id: 'r-9', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-5', authorName: 'Ivan Savić', changeSummary: 'Dodat autentikacija sekcija', wordCount: 4200, createdAt: '2025-01-24T15:00:00Z', restoredFrom: null },
  { id: 'r-10', contentId: 'c-11', contentTitle: 'API Reference v2.0', authorId: 'auth-1', authorName: 'Marko Petrović', changeSummary: 'Pocetna verzija dokumentacije', wordCount: 3000, createdAt: '2025-01-20T10:00:00Z', restoredFrom: null },
]

// ============ HELPERS ============

function getAuthorName(id: string): string { return mockAuthors.find(a => a.id === id)?.name ?? 'Nepoznat' }
function getCategoryName(id: string): string { return mockCategories.find(c => c.id === id)?.name ?? '' }
function getCategoryColor(id: string): string { return mockCategories.find(c => c.id === id)?.color ?? '#6b7280' }
function getContentTypeName(id: string): string { return mockContentTypes.find(t => t.id === id)?.name ?? '' }

function emptyForm(): ContentForm {
  return { title: '', slug: '', typeId: 'ct-1', categoryId: '', authorId: '', status: 'draft', content: '', excerpt: '', featuredImage: '', tags: [], seoTitle: '', seoDescription: '', ogImage: '', scheduledAt: '', locale: 'sr' }
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9šđčćžŠĐČĆŽ\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function analyzeSeo(item: ContentItem): SeoAnalysis {
  const issues: SeoAnalysis['issues'] = []
  const titleLen = item.seoTitle.length
  const descLen = item.seoDescription.length
  const wordCount = item.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const headings = (item.content.match(/<h[1-6]/g) || []).length
  const images = (item.content.match(/<img/g) || []).length
  const links = (item.content.match(/<a\s/g) || []).length
  if (titleLen < 30) issues.push({ type: 'warning', message: 'SEO naslov je prekratak (min 30 karaktera)' })
  if (titleLen > 60) issues.push({ type: 'warning', message: 'SEO naslov je predug (max 60 karaktera)' })
  if (descLen < 120) issues.push({ type: 'warning', message: 'SEO opis je prekratak (min 120 karaktera)' })
  if (descLen > 160) issues.push({ type: 'warning', message: 'SEO opis je predug (max 160 karaktera)' })
  if (!item.featuredImage) issues.push({ type: 'info', message: 'Nema istaknute slike' })
  if (wordCount < 300) issues.push({ type: 'warning', message: 'Sadržaj je kratak (min 300 reči za SEO)' })
  if (headings === 0) issues.push({ type: 'error', message: 'Nema naslova (H1-H6) u sadržaju' })
  if (images === 0) issues.push({ type: 'info', message: 'Nema slika u sadržaju' })
  const titleScore = titleLen >= 30 && titleLen <= 60 ? 25 : titleLen > 0 ? 10 : 0
  const descScore = descLen >= 120 && descLen <= 160 ? 25 : descLen > 0 ? 10 : 0
  const contentScore = wordCount >= 300 ? 25 : wordCount >= 150 ? 15 : 5
  const headingScore = headings > 0 ? 15 : 0
  const mediaScore = images > 0 ? 10 : 0
  const score = titleScore + descScore + contentScore + headingScore + mediaScore
  return { score, titleLength: titleLen, descriptionLength: descLen, keywordDensity: 2.1, readability: 72, wordCount, headings, images, links, issues }
}

function generateMonthlyTrend() {
  return [
    { month: 'Jan', objavljeno: 4, nacrta: 2, ukupno: 6 },
    { month: 'Feb', objavljeno: 5, nacrta: 3, ukupno: 8 },
    { month: 'Mar', objavljeno: 3, nacrta: 1, ukupno: 4 },
  ]
}

function generateTypePie(content: ContentItem[]) {
  return mockContentTypes.map(t => ({ name: t.name, value: content.filter(c => c.typeId === t.id).length })).filter(d => d.value > 0)
}

// ============ MAIN COMPONENT ============

import { useCMS } from './hooks'

export function CMS() {
  const {activeTab, content, loadData, setActiveTab, setContent} = useCMS()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CMS</h1>
          <p className="text-sm text-muted-foreground">Upravljanje sadržajem — EmDash stil</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
          <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Sadržaj</TabsTrigger>
          <TabsTrigger value="types"><Layout className="h-4 w-4 mr-1 hidden sm:inline" /> Tipovi</TabsTrigger>
          <TabsTrigger value="media"><Image className="h-4 w-4 mr-1 hidden sm:inline" /> Mediji</TabsTrigger>
          <TabsTrigger value="revisions"><RotateCcw className="h-4 w-4 mr-1 hidden sm:inline" /> Revizije</TabsTrigger>
          <TabsTrigger value="scheduler"><Calendar className="h-4 w-4 mr-1 hidden sm:inline" /> Planer</TabsTrigger>
          <TabsTrigger value="seo"><Globe className="h-4 w-4 mr-1 hidden sm:inline" /> SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><PregledTab content={content} /></TabsContent>
        <TabsContent value="content"><ContentTab content={content} setContent={setContent} /></TabsContent>
        <TabsContent value="types"><TypesTab /></TabsContent>
        <TabsContent value="media"><MediaTab /></TabsContent>
        <TabsContent value="revisions"><RevisionsTab content={content} /></TabsContent>
        <TabsContent value="scheduler"><SchedulerTab content={content} /></TabsContent>
        <TabsContent value="seo"><SeoTabExtended content={content} /></TabsContent>
      </Tabs>
    </div>
  )
}