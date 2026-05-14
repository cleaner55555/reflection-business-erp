import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { industryTemplatesData } from '@/lib/industry-templates-data'

// GET /api/industry-templates - List all templates, optionally by category
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const featured = searchParams.get('featured')

  // Ensure templates exist in DB (idempotent seed)
  const existing = await db.industryTemplate.findMany({ select: { slug: true } })
  const existingSlugs = new Set(existing.map(e => e.slug))

  const newTemplates = industryTemplatesData.filter(t => !existingSlugs.has(t.slug))
  if (newTemplates.length > 0) {
    await db.industryTemplate.createMany({
      data: newTemplates.map(t => ({
        name: t.name,
        slug: t.slug,
        description: t.description,
        icon: t.icon,
        category: t.category,
        modules: JSON.stringify(t.modules),
        featured: t.featured,
        sortOrder: t.sortOrder,
      })),
    })
  }

  // Build query
  const where: any = {}
  if (category) where.category = category
  if (featured === 'true') where.featured = true
  if (search) where.name = { contains: search }

  const templates = await db.industryTemplate.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
  })

  // Get unique categories
  const categories = await db.industryTemplate.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  })

  return NextResponse.json({
    templates: templates.map(t => ({
      ...t,
      modules: JSON.parse(t.modules),
    })),
    categories: categories.map(c => c.category),
  })
}

// POST /api/industry-templates/apply - Apply an industry template to company
export async function POST(req: NextRequest) {
  const { slug, companyId } = await req.json()

  if (!companyId) {
    return NextResponse.json({ error: 'companyId je obavezan' }, { status: 400 })
  }

  const template = await db.industryTemplate.findUnique({ where: { slug } })
  if (!template) {
    return NextResponse.json({ error: 'Predložak nije pronađen' }, { status: 404 })
  }

  const modules = JSON.parse(template.modules)

  // Update company's active modules
  await db.company.update({
    where: { id: companyId },
    data: { modules: JSON.stringify(modules) },
  })

  return NextResponse.json({
    success: true,
    template: template.name,
    modules,
    message: `Namena "${template.name}" primenjena (${modules.length} modula)`,
  })
}
