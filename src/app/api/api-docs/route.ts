import { NextResponse } from 'next/server'
import { generateOpenAPISpec } from '@/lib/openapi-spec'

// GET /api/api-docs — Returns OpenAPI 3.0 specification
export async function GET() {
  try {
    const spec = generateOpenAPISpec()
    return NextResponse.json(spec)
  } catch (error) {
    console.error('API docs error:', error)
    return NextResponse.json({ error: 'Greška pri generisanju dokumentacije' }, { status: 500 })
  }
}
