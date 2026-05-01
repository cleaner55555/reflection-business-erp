'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  FileText, Plus, Search, Eye, Trash2, Edit3, RefreshCw, CheckCircle2, Clock,
  BarChart3, TrendingUp, Users, Calendar, Tag, MessageSquare, Globe,
  Star, ArrowRight, Filter, Share2, AlertCircle, Image, FolderOpen,
  Upload, File, Video, Music, Archive, Camera, Link, Type, Bold, Italic,
  Underline, List, ListOrdered, AlignLeft, AlignCenter, Code, Undo2,
  Redo2, Save, X, ChevronDown, ChevronRight, Copy, RotateCcw, ExternalLink,
  Sparkles, Layout, Newspaper, BookOpen, Megaphone, HelpCircle, FileCode,
  Hash, Zap, Languages, Settings, Globe2
} from 'lucide-react'

// ============ INTERFACES ============

interface ContentItem {
  id: string
  title: string
  slug: string
  typeId: string
  categoryId: string
  authorId: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  content: string
  excerpt: string
  featuredImage: string
  tags: string[]
  views: number
  wordCount: number
  readingTime: number
  seoTitle: string
  seoDescription: string
  ogImage: string
  publishedAt: string
  scheduledAt: string
  createdAt: string
  updatedAt: string
  revisionCount: number
  locale: string
}

interface ContentType {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  fields: ContentField[]
  itemCount: number
  template: string
}

interface ContentField {
  id: string
  name: string
  type: 'text' | 'richtext' | 'image' | 'select' | 'number' | 'date' | 'boolean' | 'tags'
  required: boolean
  options?: string[]
}

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'document' | 'video' | 'audio' | 'icon'
  mimeType: string
  size: number
  url: string
  folderId: string
  alt: string
  width: number
  height: number
  uploadedAt: string
  usageCount: number
}

interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  itemCount: number
}

interface Revision {
  id: string
  contentId: string
  contentTitle: string
  authorId: string
  authorName: string
  changeSummary: string
  wordCount: number
  createdAt: string
  restoredFrom: string | null
}

interface ContentCategory {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  color: string
  itemCount: number
}

interface ContentForm {
  title: string
  slug: string
  typeId: string
  categoryId: string
  authorId: string
  status: ContentItem['status']
  content: string
  excerpt: string
  featuredImage: string
  tags: string[]
  seoTitle: string
  seoDescription: string
  ogImage: string
  scheduledAt: string
  locale: string
}

interface SeoAnalysis {
  score: number
  titleLength: number
  descriptionLength: number
  keywordDensity: number
  readability: number
  wordCount: number
  headings: number
  images: number
  links: number
  issues: { type: 'error' | 'warning' | 'info'; message: string }[]
}

// ============ CONFIG ============

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: 'Objavljeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  scheduled: { label: 'Zakazano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  archived: { label: 'Arhivirano', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const statusWorkflow = ['draft', 'scheduled', 'published', 'archived'] as const

const CHART_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const mediaTypeIcons: Record<string, React.ElementType> = {
  image: Image,
  document: FileText,
  video: Video,
  audio: Music,
  icon: Camera,
}

const mediaTypeColors: Record<string, string> = {
  image: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  icon: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

const toolbarActions = [
  { icon: Bold, label: 'Bold', action: 'bold' },
  { icon: Italic, label: 'Italic', action: 'italic' },
  { icon: Underline, label: 'Underline', action: 'underline' },
  { icon: Type, label: 'Heading', action: 'heading' },
  { icon: Link, label: 'Link', action: 'link' },
  { icon: Image, label: 'Image', action: 'image' },
  { icon: List, label: 'Bullet List', action: 'ul' },
  { icon: ListOrdered, label: 'Numbered List', action: 'ol' },
  { icon: AlignLeft, label: 'Align Left', action: 'alignLeft' },
  { icon: AlignCenter, label: 'Align Center', action: 'alignCenter' },
  { icon: Code, label: 'Code Block', action: 'code' },
  { icon: Quote, label: 'Quote', action: 'quote' },
]

function Quote(props: React.SVGProps<SVGSVGElement>) {
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

export function CMS() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cms/content?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) { setContent(data) } else { setContent(mockContent) }
      } else { setContent(mockContent) }
    } catch { setContent(mockContent) }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [activeCompanyId, loadData])

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>

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

// ============ TAB 1: PREGLED ============

function PregledTab({ content }: { content: ContentItem[] }) {
  const published = content.filter(c => c.status === 'published')
  const drafts = content.filter(c => c.status === 'draft')
  const scheduled = content.filter(c => c.status === 'scheduled')
  const totalViews = content.reduce((s, c) => s + c.views, 0)
  const totalWords = content.reduce((s, c) => s + c.wordCount, 0)
  const typePie = generateTypePie(content)
  const topContent = [...published].sort((a, b) => b.views - a.views).slice(0, 5)
  const recentContent = [...content].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Ukupno</span><FileText className="h-4 w-4 text-muted-foreground" /></div><p className="text-2xl font-bold">{content.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Objavljeno</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-green-600">{published.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Nacrta</span><Clock className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold text-amber-600">{drafts.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Zakazano</span><Calendar className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold text-blue-600">{scheduled.length}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Pregleda</span><TrendingUp className="h-4 w-4 text-primary" /></div><p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Reči</span><Hash className="h-4 w-4 text-purple-500" /></div><p className="text-2xl font-bold text-purple-600">{totalWords.toLocaleString()}</p></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Mesečni trend</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={generateMonthlyTrend()}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="objavljeno" stroke="#22c55e" strokeWidth={2} /><Line type="monotone" dataKey="nacrta" stroke="#f59e0b" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Po tipovima</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={typePie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{typePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" /> Najčitaniji</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">#</TableHead><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead></TableRow></TableHeader><TableBody>{topContent.map((c, i) => <TableRow key={c.id}><TableCell className="text-xs font-medium">{i + 1}</TableCell><TableCell className="text-xs font-medium max-w-[200px] truncate">{c.title}</TableCell><TableCell className="text-xs text-right font-bold">{c.views.toLocaleString()}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Nedavno izmenjeno</CardTitle></CardHeader><CardContent><div className="space-y-3">{recentContent.map(c => { const sc = statusConfig[c.status]; return (<div key={c.id} className="flex items-start gap-3 py-2 border-b last:border-0"><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.title}</p><p className="text-xs text-muted-foreground">{getContentTypeName(c.typeId)} · {getAuthorName(c.authorId)} · {new Date(c.updatedAt).toLocaleDateString('sr-RS')}</p></div><Badge variant="outline" className={`text-[10px] shrink-0 ${sc?.color}`}>{sc?.label}</Badge></div>) })}</div></CardContent></Card>
      </div>
    </div>
  )
}

// ============ TAB 2: SADRŽAJ ============

function ContentTab({ content, setContent }: { content: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>> }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [form, setForm] = useState<ContentForm>(emptyForm())
  const [seoPreview, setSeoPreview] = useState<SeoAnalysis | null>(null)

  const filtered = content.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && c.typeId !== typeFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (catFilter !== 'all' && c.categoryId !== catFilter) return false
    return true
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true) }
  const openEditor = (item: ContentItem) => {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, typeId: item.typeId, categoryId: item.categoryId,
      authorId: item.authorId, status: item.status, content: item.content, excerpt: item.excerpt,
      featuredImage: item.featuredImage, tags: item.tags, seoTitle: item.seoTitle,
      seoDescription: item.seoDescription, ogImage: item.ogImage, scheduledAt: item.scheduledAt || '', locale: item.locale,
    })
    setSeoPreview(null)
    setEditorOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      setContent(prev => prev.map(c => c.id === editing.id ? { ...c, ...form, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length, readingTime: Math.ceil(form.content.split(/\s+/).length / 200), updatedAt: new Date().toISOString(), revisionCount: c => c.revisionCount + 1 } : c))
    } else {
      const newItem: ContentItem = {
        id: `c-${Date.now()}`, title: form.title, slug: form.slug || generateSlug(form.title),
        typeId: form.typeId, categoryId: form.categoryId, authorId: form.authorId, status: form.status,
        content: form.content, excerpt: form.excerpt, featuredImage: form.featuredImage,
        tags: form.tags, views: 0, wordCount: form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length,
        readingTime: Math.ceil(form.content.split(/\s+/).length / 200), seoTitle: form.seoTitle,
        seoDescription: form.seoDescription, ogImage: form.ogImage, publishedAt: form.status === 'published' ? new Date().toISOString() : '',
        scheduledAt: form.scheduledAt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revisionCount: 0, locale: form.locale,
      }
      setContent(prev => [...prev, newItem])
    }
    setDialogOpen(false)
    setEditorOpen(false)
  }

  const handleDelete = (id: string) => setContent(prev => prev.filter(c => c.id !== id))
  const advanceStatus = (item: ContentItem) => {
    const idx = statusWorkflow.indexOf(item.status)
    if (idx < statusWorkflow.length - 1) setContent(prev => prev.map(c => c.id === item.id ? { ...c, status: statusWorkflow[idx + 1], publishedAt: statusWorkflow[idx + 1] === 'published' ? new Date().toISOString() : c.publishedAt } : c))
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }))
  }

  const runSeoAnalysis = () => {
    if (editing) {
      const temp = { ...editing, ...form }
      setSeoPreview(analyzeSeo(temp))
    }
  }

  const allTags = [...new Set(content.flatMap(c => c.tags))]

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži sadržaj..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Tip" /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full lg:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Svi statusi</SelectItem>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
        <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger><SelectContent><SelectItem value="all">Sve kategorije</SelectItem>{mockCategories.filter(c => !c.parentId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Novi sadržaj</Button>
      </div>
      <div className="text-sm text-muted-foreground">{filtered.length} od {content.length}</div>
      {filtered.length === 0 ? <Card className="p-12 text-center"><FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" /><p className="text-muted-foreground font-medium">Nema sadržaja</p><Button className="mt-4" size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button></Card> : (
        <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden lg:table-cell">Kategorija</TableHead><TableHead className="text-xs hidden md:table-cell">Autor</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
          {filtered.map(c => { const sc = statusConfig[c.status]; const si = statusWorkflow.indexOf(c.status); return (
            <TableRow key={c.id}><TableCell className="text-xs font-medium max-w-[220px]"><div className="flex items-center gap-2">{c.featuredImage && <Image className="h-3.5 w-3.5 text-muted-foreground shrink-0" alt="" />}<span className="truncate">{c.title}</span></div><p className="text-[10px] text-muted-foreground truncate max-w-[220px]">/{c.slug}</p></TableCell><TableCell className="text-xs hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{getContentTypeName(c.typeId)}</Badge></TableCell><TableCell className="text-xs hidden lg:table-cell"><Badge variant="outline" style={{ borderColor: getCategoryColor(c.categoryId), color: getCategoryColor(c.categoryId) }}>{getCategoryName(c.categoryId)}</Badge></TableCell><TableCell className="text-xs hidden md:table-cell">{getAuthorName(c.authorId)}</TableCell><TableCell className="text-xs text-right font-medium">{c.views.toLocaleString()}</TableCell><TableCell><div className="flex items-center gap-1"><Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>{si < statusWorkflow.length - 1 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => advanceStatus(c)}><ArrowRight className="h-3 w-3" /></Button>}</div></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditor(c)}><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {}}><Eye className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
          ) })}
        </TableBody></Table></div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Novi sadržaj</DialogTitle><DialogDescription>Popunite podatke za novi sadržaj</DialogDescription></DialogHeader><div className="space-y-4">
        <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Tip</Label><Select value={form.typeId} onValueChange={v => setForm(f => ({ ...f, typeId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ContentItem['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Autor</Label><Select value={form.authorId} onValueChange={v => setForm(f => ({ ...f, authorId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockAuthors.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-2"><Label>Kategorija</Label><Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Bez kategorije</SelectItem>{mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Tagovi</Label><div className="flex flex-wrap gap-2">{allTags.map(tag => <Badge key={tag} variant={form.tags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleTag(tag)}>{tag}</Badge>)}</div></div>
        <div className="space-y-2"><Label>Kratki opis</Label><Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
      </div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleSave}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? `Izmeni: ${editing.title}` : 'Novi sadržaj'}</DialogTitle><DialogDescription>WYSIWYG editor sa SEO podrškom</DialogDescription></DialogHeader><div className="space-y-4">
        <div className="space-y-2"><Label>Naslov</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2"><Label>Tip</Label><Select value={form.typeId} onValueChange={v => setForm(f => ({ ...f, typeId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockContentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ContentItem['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Autor</Label><Select value={form.authorId} onValueChange={v => setForm(f => ({ ...f, authorId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockAuthors.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Jezik</Label><Select value={form.locale} onValueChange={v => setForm(f => ({ ...f, locale: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sr">🇷🇸 Srpski</SelectItem><SelectItem value="en">🇬🇧 English</SelectItem><SelectItem value="de">🇩🇪 Deutsch</SelectItem><SelectItem value="fr">🇫🇷 Français</SelectItem><SelectItem value="es">🇪🇸 Español</SelectItem><SelectItem value="it">🇮🇹 Italiano</SelectItem><SelectItem value="hu">🇭🇺 Magyar</SelectItem><SelectItem value="ro">🇷🇴 Română</SelectItem><SelectItem value="bg">🇧🇬 Български</SelectItem><SelectItem value="hr">🇭🇷 Hrvatski</SelectItem><SelectItem value="sl">🇸🇮 Slovenščina</SelectItem></SelectContent></Select></div>
        </div>
        {/* WYSIWYG Toolbar */}
        <div className="space-y-2"><Label>Sadržaj</Label><div className="border rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b"><Undo2 className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" /><Redo2 className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" /><Separator orientation="vertical" className="h-6 mx-1" />{toolbarActions.map(a => <a.icon key={a.action} className="h-4 w-4 p-1 cursor-pointer hover:bg-muted rounded" title={a.label} />)}</div>
          <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="border-0 rounded-none font-mono text-sm" placeholder="HTML sadržaj ili običan tekst..." />
          <div className="flex items-center justify-between p-2 bg-muted/30 text-xs text-muted-foreground"><span>{form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} reči · {Math.ceil(form.content.split(/\s+/).length / 200)} min čitanja</span></div>
        </div></div>
        <div className="space-y-2"><Label>Tagovi</Label><div className="flex flex-wrap gap-2">{allTags.map(tag => <Badge key={tag} variant={form.tags.includes(tag) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleTag(tag)}>{tag}</Badge>)}</div></div>
        <Separator />
        <div className="space-y-2"><Label>SEO Naslov</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder={`${form.title} | Reflection`} /><p className="text-[10px] text-muted-foreground">{form.seoTitle.length}/60 karaktera</p></div>
        <div className="space-y-2"><Label>SEO Opis</Label><Textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} rows={2} /><p className="text-[10px] text-muted-foreground">{form.seoDescription.length}/160 karaktera</p></div>
        {seoPreview && <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">SEO Analiza</span><Badge variant={seoPreview.score >= 70 ? 'default' : seoPreview.score >= 40 ? 'secondary' : 'destructive'} className="text-xs">{seoPreview.score}/100</Badge></div><div className="space-y-1">{seoPreview.issues.map((iss, i) => <p key={i} className={`text-xs ${iss.type === 'error' ? 'text-red-500' : iss.type === 'warning' ? 'text-amber-500' : 'text-muted-foreground'}`}>{iss.type === 'error' ? '✕' : iss.type === 'warning' ? '⚠' : 'ℹ'} {iss.message}</p>)}</div></Card>}
        <Button variant="outline" size="sm" onClick={runSeoAnalysis}><Sparkles className="h-4 w-4 mr-1" /> Analiziraj SEO</Button>
      </div><DialogFooter><Button variant="outline" onClick={() => setEditorOpen(false)}>Otkaži</Button><Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

// ============ TAB 3: TIPOVI ============

function TypesTab() {
  const [types, setTypes] = useState(mockContentTypes)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', icon: 'FileText' })

  const handleCreate = () => {
    const newType: ContentType = { id: `ct-${Date.now()}`, name: form.name, slug: generateSlug(form.name), description: form.description, icon: form.icon, fields: [{ id: `f-${Date.now()}`, name: 'Sadržaj', type: 'richtext', required: true }], itemCount: 0, template: 'custom' }
    setTypes(prev => [...prev, newType])
    setDialogOpen(false)
    setForm({ name: '', description: '', icon: 'FileText' })
  }

  const handleDelete = (id: string) => setTypes(prev => prev.filter(t => t.id !== id))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm font-medium">Tipovi sadržaja ({types.length})</h3><Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi tip</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map(t => (
{/* eslint-disable-next-line jsx-a11y/alt-text */}<div><p className="text-sm font-medium">{t.name}</p><p className="text-[10px] text-muted-foreground">/{t.slug}</p></div></div><Badge variant="outline" className="text-[10px]">{t.itemCount}</Badge></div><p className="text-xs text-muted-foreground mb-3">{t.description}</p><div className="space-y-1 mb-3"><p className="text-[10px] font-medium text-muted-foreground">Polja ({t.fields.length}):</p>{t.fields.map(f => <div key={f.id} className="flex items-center gap-2 text-xs"><Badge variant="outline" className="text-[9px]">{f.type}</Badge><span>{f.name}</span>{f.required && <span className="text-red-400">*</span>}</div>)}</div><div className="flex gap-2 mt-3"><Button variant="outline" size="sm" className="text-xs flex-1"><Edit3 className="h-3 w-3 mr-1" /> Izmeni</Button><Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /></Button></div></Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>Novi tip sadržaja</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Naziv</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div><div className="space-y-2"><Label>Opis</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button><Button onClick={handleCreate}>Kreiraj</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

// ============ TAB 4: MEDIJI ============

function MediaTab() {
  const [media] = useState(mockMedia)
  const [folders] = useState(mockFolders)
  const [folderFilter, setFolderFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = media.filter(m => {
    if (folderFilter !== 'all' && m.folderId !== folderFilter) return false
    if (typeFilter !== 'all' && m.type !== typeFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSize = media.reduce((s, m) => s + m.size, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupno fajlova</span><p className="text-xl font-bold">{media.length}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupna veličina</span><p className="text-xl font-bold">{formatFileSize(totalSize)}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Foldera</span><p className="text-xl font-bold">{folders.length}</p></Card>
        <Card className="p-4"><span className="text-xs text-muted-foreground">Korišćeno u sadržaju</span><p className="text-xl font-bold">{media.reduce((s, m) => s + m.usageCount, 0)}</p></Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži medije..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={folderFilter} onValueChange={setFolderFilter}><SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Folder" /></SelectTrigger><SelectContent><SelectItem value="all">Svi folderi</SelectItem>{folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.itemCount})</SelectItem>)}</SelectContent></Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-full lg:w-[130px]"><SelectValue placeholder="Tip" /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem><SelectItem value="image">Slike</SelectItem><SelectItem value="document">Dokumenta</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="icon">Ikone</SelectItem></SelectContent></Select>
        <Button size="sm" onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(m => { const Icon = mediaTypeIcons[m.type]; const color = mediaTypeColors[m.type]; return (
          <Card key={m.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer group"><div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg mb-3"><Icon className="h-12 w-12 text-muted-foreground/50" aria-label={m.type} /></div><p className="text-xs font-medium truncate" title={m.name}>{m.name}</p><div className="flex items-center justify-between mt-1"><p className="text-[10px] text-muted-foreground">{formatFileSize(m.size)}</p><Badge variant="outline" className={`text-[9px] ${color}`}>{m.type}</Badge></div><div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button></div>{m.usageCount > 0 && <p className="text-[9px] text-muted-foreground mt-1">Korišćeno: {m.usageCount}x</p>}</Card>
        ) })}
      </div>
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}><DialogContent><DialogHeader><DialogTitle>Upload medija</DialogTitle><DialogDescription>Izaberite fajlove za upload</DialogDescription></DialogHeader><div className="space-y-4"><div className="border-2 border-dashed rounded-lg p-8 text-center"><Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">Prevucite fajlove ovde ili kliknite za biranje</p><p className="text-xs text-muted-foreground mt-1">Podržano: JPG, PNG, GIF, SVG, PDF, MP4, MP3 (max 50MB)</p></div><div className="space-y-2"><Label>Folder</Label><Select><SelectTrigger><SelectValue placeholder="Izaberite folder" /></SelectTrigger><SelectContent>{folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setUploadOpen(false)}>Otkaži</Button><Button>Upload</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

// ============ TAB 5: REVIZIJE ============

function RevisionsTab({ content }: { content: ContentItem[] }) {
  const [selectedContent, setSelectedContent] = useState<string>('all')
  const [revisions] = useState(mockRevisions)

  const filtered = selectedContent === 'all' ? revisions : revisions.filter(r => r.contentId === selectedContent)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Istorija revizija ({revisions.length})</h3></div>
      <Select value={selectedContent} onValueChange={setSelectedContent}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Filtriraj po sadržaju" /></SelectTrigger><SelectContent><SelectItem value="all">Svi sadržaji</SelectItem>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
      <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Sadržaj</TableHead><TableHead className="text-xs">Autor</TableHead><TableHead className="text-xs">Promena</TableHead><TableHead className="text-xs hidden md:table-cell">Reči</TableHead><TableHead className="text-xs">Datum</TableHead><TableHead className="text-xs text-right">Akcije</TableHead></TableRow></TableHeader><TableBody>
        {filtered.map(r => (
          <TableRow key={r.id}><TableCell className="text-xs font-medium max-w-[200px] truncate">{r.contentTitle}</TableCell><TableCell className="text-xs">{r.authorName}</TableCell><TableCell className="text-xs max-w-[200px] truncate">{r.changeSummary}</TableCell><TableCell className="text-xs hidden md:table-cell">{r.wordCount.toLocaleString()}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString('sr-RS')}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" title="Vrati ovu verziju"><RotateCcw className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>
        ))}
      </TableBody></Table></div>
    </div>
  )
}

// ============ TAB 6: PLANER ============

function SchedulerTab({ content }: { content: ContentItem[] }) {
  const scheduled = content.filter(c => c.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  const drafts = content.filter(c => c.status === 'draft')
  const recentlyPublished = content.filter(c => c.status === 'published').sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Zakazano</span></div><p className="text-2xl font-bold text-blue-600">{scheduled.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">Čeka objavu (nacrti)</span></div><p className="text-2xl font-bold text-amber-600">{drafts.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Nedavno objavljeno</span></div><p className="text-2xl font-bold text-green-600">{recentlyPublished.length}</p></Card>
      </div>
      {scheduled.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Zakazani sadržaj</h3><div className="space-y-3">{scheduled.map(c => (
        <Card key={c.id} className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{getContentTypeName(c.typeId)} · {getAuthorName(c.authorId)}</p></div><div className="text-right"><Badge variant="outline" className="text-xs mb-1">📅 {new Date(c.scheduledAt).toLocaleDateString('sr-RS')} {new Date(c.scheduledAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</Badge><p className="text-[10px] text-muted-foreground">{Math.round((new Date(c.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dana</p></div></div></Card>
      ))}</div></>}
      {drafts.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2 mt-6"><Clock className="h-4 w-4" /> Nacrta koji čekaju</h3><div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Naslov</TableHead><TableHead className="text-xs hidden md:table-cell">Tip</TableHead><TableHead className="text-xs hidden md:table-cell">Autor</TableHead><TableHead className="text-xs">Reči</TableHead><TableHead className="text-xs">Revizije</TableHead></TableRow></TableHeader><TableBody>{drafts.map(c => <TableRow key={c.id}><TableCell className="text-xs font-medium">{c.title}</TableCell><TableCell className="text-xs hidden md:table-cell">{getContentTypeName(c.typeId)}</TableCell><TableCell className="text-xs hidden md:table-cell">{getAuthorName(c.authorId)}</TableCell><TableCell className="text-xs">{c.wordCount.toLocaleString()}</TableCell><TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{c.revisionCount} rev.</Badge></TableCell></TableRow>)}</TableBody></Table></div></>}
      {recentlyPublished.length > 0 && <><h3 className="text-sm font-medium flex items-center gap-2 mt-6"><CheckCircle2 className="h-4 w-4" /> Nedavno objavljeno</h3><div className="space-y-2">{recentlyPublished.map(c => <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0"><div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /><div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{getAuthorName(c.authorId)} · {getContentTypeName(c.typeId)}</p></div></div><span className="text-xs text-muted-foreground">{new Date(c.publishedAt).toLocaleDateString('sr-RS')}</span></div>)}</div></>}
    </div>
  )
}

// ============ TAB 7: SEO ============

function SeoTab({ content }: { content: ContentItem[] }) {
  const [selected, setSelected] = useState<string>(content[0]?.id || '')
  const item = content.find(c => c.id === selected)
  const analysis = item ? analyzeSeo(item) : null

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Izaberite sadržaj" /></SelectTrigger><SelectContent>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
      </div>
      {item && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium">SEO Score</h3><span className={`text-3xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</span></div><div className="w-full bg-muted rounded-full h-3"><div className={`h-3 rounded-full transition-all ${analysis.score >= 70 ? 'bg-green-500' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} /></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Meta podaci</h3><div className="space-y-3">
              <div><Label className="text-xs">SEO Naslov ({analysis.titleLength}/60)</Label><Input value={item.seoTitle} readOnly className="text-xs mt-1" /></div>
              <div><Label className="text-xs">SEO Opis ({analysis.descriptionLength}/160)</Label><Textarea value={item.seoDescription} readOnly rows={2} className="text-xs mt-1" /></div>
              <div><Label className="text-xs">Slug</Label><Input value={`reflection.business/${item.slug}`} readOnly className="text-xs mt-1" /></div>
            </div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Open Graph</h3><div className="space-y-2"><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Naslov:</Label><span className="text-xs">{item.seoTitle || item.title}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Opis:</Label><span className="text-xs truncate max-w-[300px]">{item.seoDescription || item.excerpt}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Slika:</Label><span className="text-xs">{item.ogImage ? '✅ Postavljena' : '❌ Nema'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Tip:</Label><span className="text-xs">{item.typeId === 'ct-1' ? 'article' : 'website'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Jezik:</Label><span className="text-xs">{item.locale === 'sr' ? 'sr_RS' : item.locale}</span></div></div></Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Analiza sadržaja</h3><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.wordCount}</p><p className="text-xs text-muted-foreground">Reči</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.readability}</p><p className="text-xs text-muted-foreground">Čitljivost</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.headings}</p><p className="text-xs text-muted-foreground">Naslova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.images}</p><p className="text-xs text-muted-foreground">Slika</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.links}</p><p className="text-xs text-muted-foreground">Linkova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.keywordDensity}%</p><p className="text-xs text-muted-foreground">Keyword dens.</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Social Preview</h3><div className="border rounded-lg overflow-hidden"><div className="bg-muted p-3"><div className="flex items-center gap-2 mb-1"><Globe2 className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">reflection.business</span></div><p className="text-sm font-medium">{item.seoTitle || item.title}</p></div><div className="p-3"><p className="text-xs text-muted-foreground">{item.seoDescription || item.excerpt}</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">SEO Problemi</h3><div className="space-y-2">{analysis.issues.length === 0 ? <p className="text-xs text-green-600">✅ Nema problema</p> : analysis.issues.map((iss, i) => <div key={i} className="flex items-start gap-2"><span className="text-xs">{iss.type === 'error' ? '🔴' : iss.type === 'warning' ? '🟡' : '🔵'}</span><p className="text-xs">{iss.message}</p></div>)}</div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">i18n Jezici (placeholder)</h3><div className="flex flex-wrap gap-2">{['sr', 'en', 'de', 'fr', 'es', 'it', 'hu', 'ro', 'bg', 'hr', 'sl', 'cs', 'pl', 'sk', 'uk', 'tr', 'ar', 'zh', 'ja', 'ko', 'pt', 'nl', 'sv', 'da', 'fi', 'no', 'el', 'he', 'th', 'vi', 'id', 'ms', 'tl', 'fil', 'sw', 'am', 'bn', 'hi', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'or', 'pa', 'ur', 'fa', 'uz', 'kk', 'az', 'ka', 'hy', 'hy', 'eu', 'gl', 'ca', 'eu', 'is', 'et', 'lv', 'lt', 'mk', 'sq', 'bs', 'me', 'sr-latn'].map(lang => <Badge key={lang} variant={lang === item.locale ? 'default' : 'outline'} className="text-[10px]">{lang === 'sr' ? '🇷🇸' : lang === 'en' ? '🇬🇧' : lang === 'de' ? '🇩🇪' : lang === 'fr' ? '🇫🇷' : lang === 'es' ? '🇪🇸' : lang === 'sr-latn' ? '🇷🇸' : '🌐'} {lang}</Badge>)}</div><p className="text-[10px] text-muted-foreground mt-2">{80} jezika — placeholder za i18n integraciju</p></Card>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ TAB BONUS: i18n KONFIGURACIJA ============

const supportedLocales = [
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sr-latn', name: 'Srpski (latinica)', flag: '🇷🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'me', name: 'Crnogorski', flag: '🇲🇪' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'uz', name: 'Oʻzbek', flag: '🇺🇿' },
  { code: 'kk', name: 'Қазақ', flag: '🇰🇿' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'eu', name: 'Euskara', flag: '🇪🇸' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'gd', name: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'lb', name: 'Lëtzebuergesch', flag: '🇱🇺' },
]

// ============ TAB BONUS: SITEMAP STATUS ============

const sitemapItems = [
  { url: '/o-nama', priority: 0.8, changefreq: 'monthly', lastMod: '2025-01-01' },
  { url: '/kontakt', priority: 0.7, changefreq: 'monthly', lastMod: '2025-01-01' },
  { url: '/blog/seo-strategija-2025', priority: 0.9, changefreq: 'weekly', lastMod: '2025-01-15' },
  { url: '/blog/react-server-components', priority: 0.9, changefreq: 'weekly', lastMod: '2025-01-20' },
  { url: '/blog/nextjs-16-novosti', priority: 0.9, changefreq: 'weekly', lastMod: '2025-02-10' },
  { url: '/docs/api-reference-v2', priority: 0.8, changefreq: 'weekly', lastMod: '2025-01-25' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly', lastMod: '2025-01-10' },
]

// ============ TAB BONUS: CONTENT RELATIONS ============

interface ContentRelation {
  id: string
  sourceId: string
  sourceTitle: string
  targetId: string
  targetTitle: string
  type: 'related' | 'translation' | 'series' | 'reference'
}

const mockRelations: ContentRelation[] = [
  { id: 'rel-1', sourceId: 'c-1', sourceTitle: 'SEO strategija 2025', targetId: 'c-8', targetTitle: 'UI/UX trendovi 2025', type: 'related' },
  { id: 'rel-2', sourceId: 'c-2', sourceTitle: 'React Server Components', targetId: 'c-7', targetTitle: 'Next.js 16', type: 'series' },
  { id: 'rel-3', sourceId: 'c-5', sourceTitle: 'AI biznis Srbija', targetId: 'c-6', targetTitle: '10 saveta za produktivnost', type: 'related' },
  { id: 'rel-4', sourceId: 'c-1', sourceTitle: 'SEO strategija 2025', targetId: 'c-1-en', sourceTitle: 'SEO Strategy 2025', targetId: 'c-1', targetTitle: 'SEO strategija 2025', type: 'translation' },
]

const relationTypeConfig: Record<string, { label: string; color: string }> = {
  related: { label: 'Srodan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  translation: { label: 'Prevod', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  series: { label: 'Serija', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  reference: { label: 'Referenca', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

// ============ TAB BONUS: CONTENT ANALYTICS ============

function generateContentAnalytics(content: ContentItem[]) {
  const authors = mockAuthors.map(a => {
    const authorContent = content.filter(c => c.authorId === a.id)
    return {
      name: a.name,
      avatar: a.avatar,
      published: authorContent.filter(c => c.status === 'published').length,
      drafts: authorContent.filter(c => c.status === 'draft').length,
      totalViews: authorContent.reduce((s, c) => s + c.views, 0),
      totalWords: authorContent.reduce((s, c) => s + c.wordCount, 0),
    }
  }).filter(a => a.published + a.drafts > 0).sort((a, b) => b.totalViews - a.totalViews)

  const categoryStats = mockCategories.filter(c => !c.parentId).map(cat => ({
    name: cat.name,
    color: cat.color,
    count: content.filter(c => c.categoryId === cat.id || mockCategories.find(p => p.id === cat.id)?.parentId === cat.id).length,
  }))

  const avgReadingTime = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.readingTime, 0) / content.length) : 0
  const avgWordCount = content.length > 0 ? Math.round(content.reduce((s, c) => s + c.wordCount, 0) / content.length) : 0

  return { authors, categoryStats, avgReadingTime, avgWordCount }
}

// ============ EXTENDED SEO TAB WITH SITEMAP + ANALYTICS ============

function SeoTabExtended({ content }: { content: ContentItem[] }) {
  const [selected, setSelected] = useState<string>(content[0]?.id || '')
  const [seoSubTab, setSeoSubTab] = useState<'analysis' | 'sitemap' | 'analytics'>('analysis')
  const item = content.find(c => c.id === selected)
  const analysis = item ? analyzeSeo(item) : null
  const analytics = generateContentAnalytics(content)

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={selected} onValueChange={setSelected}><SelectTrigger className="w-full lg:w-[300px]"><SelectValue placeholder="Izaberite sadržaj" /></SelectTrigger><SelectContent>{content.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
        <div className="flex gap-2">
          <Button variant={seoSubTab === 'analysis' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('analysis')}>Analiza</Button>
          <Button variant={seoSubTab === 'sitemap' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('sitemap')}>Sitemap</Button>
          <Button variant={seoSubTab === 'analytics' ? 'default' : 'outline'} size="sm" onClick={() => setSeoSubTab('analytics')}>Analitika</Button>
        </div>
      </div>

      {seoSubTab === 'analysis' && item && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium">SEO Score</h3><span className={`text-3xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</span></div><div className="w-full bg-muted rounded-full h-3"><div className={`h-3 rounded-full transition-all ${analysis.score >= 70 ? 'bg-green-500' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} /></div><p className="text-[10px] text-muted-foreground mt-2">{analysis.score >= 70 ? 'Odlično optimizovano' : analysis.score >= 40 ? 'Potrebna poboljšanja' : 'Zahteva hitnu optimizaciju'}</p></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Meta podaci</h3><div className="space-y-3"><div><Label className="text-xs">SEO Naslov ({analysis.titleLength}/60)</Label><Input value={item.seoTitle} readOnly className="text-xs mt-1" /></div><div><Label className="text-xs">SEO Opis ({analysis.descriptionLength}/160)</Label><Textarea value={item.seoDescription} readOnly rows={2} className="text-xs mt-1" /></div><div><Label className="text-xs">Kanonski URL</Label><Input value={`reflection.business/${item.locale}/${item.slug}`} readOnly className="text-xs mt-1" /></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Open Graph</h3><div className="space-y-2"><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Naslov:</Label><span className="text-xs">{item.seoTitle || item.title}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Opis:</Label><span className="text-xs truncate max-w-[300px]">{item.seoDescription || item.excerpt}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Slika:</Label><span className="text-xs">{item.ogImage ? '✅ Postavljena' : '❌ Nema — koristi default'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">OG Tip:</Label><span className="text-xs">{item.typeId === 'ct-1' ? 'article' : 'website'}</span></div><div className="flex items-center gap-2"><Label className="text-xs w-20">Locale:</Label><span className="text-xs">{item.locale === 'sr' ? 'sr_RS' : item.locale}</span></div></div></Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Analiza sadržaja</h3><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.wordCount}</p><p className="text-xs text-muted-foreground">Reči</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.readability}</p><p className="text-xs text-muted-foreground">Čitljivost</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.headings}</p><p className="text-xs text-muted-foreground">Naslova H1-H6</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.images}</p><p className="text-xs text-muted-foreground">Slika</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.links}</p><p className="text-xs text-muted-foreground">Linkova</p></div><div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-2xl font-bold">{analysis.keywordDensity}%</p><p className="text-xs text-muted-foreground">Keyword dens.</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">Social Preview</h3><div className="border rounded-lg overflow-hidden"><div className="bg-muted p-3"><div className="flex items-center gap-2 mb-1"><Globe2 className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">reflection.business/{item.locale}</span></div><p className="text-sm font-medium">{item.seoTitle || item.title}</p></div><div className="p-3"><p className="text-xs text-muted-foreground">{item.seoDescription || item.excerpt || 'Nema opisa'}</p></div></div></Card>
            <Card className="p-4"><h3 className="text-sm font-medium mb-3">SEO Problemi ({analysis.issues.length})</h3><div className="space-y-2">{analysis.issues.length === 0 ? <p className="text-xs text-green-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Nema problema — odlično!</p> : analysis.issues.map((iss, i) => <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded"><span className="text-sm">{iss.type === 'error' ? '🔴' : iss.type === 'warning' ? '🟡' : '🔵'}</span><p className="text-xs">{iss.message}</p></div>)}</div></Card>
          </div>
        </div>
      )}

      {seoSubTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4"><span className="text-xs text-muted-foreground">Ukupno URL-ova</span><p className="text-2xl font-bold">{sitemapItems.length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Visok prioritet (0.8+)</span><p className="text-2xl font-bold">{sitemapItems.filter(s => s.priority >= 0.8).length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Ažurirano ove sedmice</span><p className="text-2xl font-bold">{sitemapItems.filter(s => s.changefreq === 'weekly').length}</p></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Sitemap.xml pregled</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">URL</TableHead><TableHead className="text-xs">Prioritet</TableHead><TableHead className="text-xs">Učestalost</TableHead><TableHead className="text-xs">Zadnja izmena</TableHead></TableRow></TableHeader><TableBody>
            {sitemapItems.map((s, i) => <TableRow key={i}><TableCell className="text-xs font-mono">{s.url}</TableCell><TableCell className="text-xs"><Badge variant="outline" className={s.priority >= 0.8 ? 'border-green-500 text-green-600' : 'border-muted text-muted-foreground'}>{s.priority}</Badge></TableCell><TableCell className="text-xs">{s.changefreq}</TableCell><TableCell className="text-xs text-muted-foreground">{s.lastMod}</TableCell></TableRow>)}
          </TableBody></Table><div className="mt-4 p-3 bg-muted/50 rounded-lg"><code className="text-[10px] text-muted-foreground block whitespace-pre">{'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemapItems.map(s => `  <url><loc>https://reflection.business${s.url}</loc><priority>${s.priority}</priority><changefreq>${s.changefreq}</changefreq><lastmod>${s.lastMod}</lastmod></url>`).join('\n') + '\n</urlset>'}</code></div></CardContent></Card>
        </div>
      )}

      {seoSubTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><span className="text-xs text-muted-foreground">Prosečno čitanje</span><p className="text-xl font-bold">{analytics.avgReadingTime} min</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Prosečno reči</span><p className="text-xl font-bold">{analytics.avgWordCount}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Aktivnih autora</span><p className="text-xl font-bold">{analytics.authors.length}</p></Card>
            <Card className="p-4"><span className="text-xs text-muted-foreground">Kategorija</span><p className="text-xl font-bold">{analytics.categoryStats.length}</p></Card>
          </div>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Autori — rang lista</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-xs">Autor</TableHead><TableHead className="text-xs text-center">Objavljeno</TableHead><TableHead className="text-xs text-center">Nacrta</TableHead><TableHead className="text-xs text-right">Pregledi</TableHead><TableHead className="text-xs text-right">Ukupno reči</TableHead></TableRow></TableHeader><TableBody>
            {analytics.authors.map((a, i) => <TableRow key={a.name}><TableCell className="text-xs font-medium"><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{a.avatar}</div>{a.name}</div></TableCell><TableCell className="text-xs text-center"><Badge variant="outline" className="text-[10px]">{a.published}</Badge></TableCell><TableCell className="text-xs text-center"><Badge variant="outline" className="text-[10px]">{a.drafts}</Badge></TableCell><TableCell className="text-xs text-right font-bold">{a.totalViews.toLocaleString()}</TableCell><TableCell className="text-xs text-right">{a.totalWords.toLocaleString()}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Tag className="h-4 w-4" /> Distribucija po kategorijama</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={analytics.categoryStats}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></Tooltip></BarChart></ResponsiveContainer></CardContent></Card>
        </div>
      )}
    </div>
  )
}

// ============ OVERRIDE SEO TAB IN MAIN ============

// Replace the SeoTab in CMS component by updating the main tabs section
// We update the CMS component to use SeoTabExtended instead of SeoTab
