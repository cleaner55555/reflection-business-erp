export interface ContentItem {
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
export interface ContentType {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  fields: ContentField[]
  itemCount: number
  template: string

}
export interface ContentField {
  id: string
  name: string
  type: 'text' | 'richtext' | 'image' | 'select' | 'number' | 'date' | 'boolean' | 'tags'
  required: boolean
  options?: string[]

}
export interface MediaItem {
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
export interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  itemCount: number

}
export interface Revision {
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
export interface ContentCategory {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  color: string
  itemCount: number

}
export interface ContentForm {
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
export interface SeoAnalysis {
  score: number
  titleLength: number
  descriptionLength: number
  keywordDensity: number
  readability: number
  wordCount: number
  headings: number
  images: number
  links: number
  issues: { type: 'error' | 'warning' | 'info'; message: string }

}
export interface ContentRelation {
  id: string
  sourceId: string
  sourceTitle: string
  targetId: string
  targetTitle: string
  type: 'related' | 'translation' | 'series' | 'reference'
}
