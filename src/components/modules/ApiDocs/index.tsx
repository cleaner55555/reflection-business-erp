'use client'

import { useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Search, FileCode, Shield, Key, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { authFetch } from '@/lib/authFetch'

interface ApiEndpoint {
  path: string
  method: string
  summary: string
  operationId: string
  tags: string[]
  parameters: Array<{ name: string; in: string; required: boolean; description: string }>
  responses: Record<string, { description: string }>
  requestBody?: { description: string }
}

interface ApiSpec {
  openapi: string
  info: { title: string; version: string; description: string }
  tags: Array<{ name: string; description: string }>
  paths: Record<string, Record<string, ApiEndpoint>>
  components: {
    securitySchemes: Record<string, any>
    schemas: Record<string, any>
  }
}

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  post: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  put: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  patch: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const METHOD_BORDER: Record<string, string> = {
  get: 'border-l-emerald-500',
  post: 'border-l-blue-500',
  put: 'border-l-amber-500',
  patch: 'border-l-orange-500',
  delete: 'border-l-red-500',
}

export default function ApiDocs() {
  const [spec, setSpec] = useState<ApiSpec | null>(null)
  const [search, setSearch] = useState('')
  const [expandedTag, setExpandedTag] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch('/api/api-docs')
      .then(res => res.json())
      .then(data => { setSpec(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Flatten endpoints grouped by tag
  const groupedEndpoints = useMemo(() => {
    if (!spec) return {}
    const groups: Record<string, ApiEndpoint[]> = {}
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, endpoint] of Object.entries(methods)) {
        const ep = { ...endpoint, path, method }
        const tag = ep.tags?.[0] || 'Ostalo'
        if (!groups[tag]) groups[tag] = []
        groups[tag].push(ep)
      }
    }
    return groups
  }, [spec])

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search) return groupedEndpoints
    const q = search.toLowerCase()
    const filtered: Record<string, ApiEndpoint[]> = {}
    for (const [tag, endpoints] of Object.entries(groupedEndpoints)) {
      const matching = endpoints.filter(
        ep => ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q) || tag.toLowerCase().includes(q)
      )
      if (matching.length > 0) filtered[tag] = matching
    }
    return filtered
  }, [groupedEndpoints, search])

  // Stats
  const totalEndpoints = Object.values(groupedEndpoints).reduce((sum, eps) => sum + eps.length, 0)
  const totalTags = Object.keys(groupedEndpoints).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCode className="h-7 w-7 text-primary" />
          API Dokumentacija
        </h1>
        <p className="text-muted-foreground mt-1">
          Reflection Business ERP — OpenAPI 3.0 specifikacija
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {totalEndpoints} endpointa
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {totalTags} kategorija
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          v{spec?.info.version || '1.0.0'}
        </Badge>
      </div>

      {/* Auth Info */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-amber-600" />
            Autentifikacija
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>JWT Bearer:</strong> Header <code className="bg-muted px-1 rounded">Authorization: Bearer &lt;token&gt;</code></p>
            <p><strong>API Key:</strong> Query param <code className="bg-muted px-1 rounded">?apiKey=&lt;key&gt;</code></p>
            <p className="mt-1">Token se dobija putem <code className="bg-muted px-1 rounded">POST /api/auth/login</code></p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži endpointe (npr. invoice, partner, auth)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Response Codes Legend */}
      <div className="flex gap-2 flex-wrap text-xs">
        {[
          { code: '200', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', desc: 'OK' },
          { code: '201', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Created' },
          { code: '400', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', desc: 'Bad Request' },
          { code: '401', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', desc: 'Unauthorized' },
          { code: '404', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', desc: 'Not Found' },
          { code: '500', color: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300', desc: 'Server Error' },
        ].map(item => (
          <Badge key={item.code} variant="outline" className={`${item.color} text-xs`}>
            {item.code} {item.desc}
          </Badge>
        ))}
      </div>

      {/* Endpoints by Tag */}
      <div className="space-y-3">
        {Object.entries(filteredGroups).map(([tag, endpoints]) => (
          <Card key={tag}>
            <CardHeader
              className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedTag(expandedTag === tag ? null : tag)}
            >
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{tag}</span>
                <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  {endpoints.length} {expandedTag === tag ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </span>
              </CardTitle>
            </CardHeader>
            {expandedTag === tag && (
              <CardContent className="pt-0 pb-3 px-4 space-y-2">
                {endpoints.map(ep => {
                  const epKey = `${ep.method}-${ep.path}`
                  const isExpanded = expandedEndpoint === epKey
                  return (
                    <div key={epKey}>
                      <div
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border-l-4 ${METHOD_BORDER[ep.method]} bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors`}
                        onClick={() => setExpandedEndpoint(isExpanded ? null : epKey)}
                      >
                        <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${METHOD_COLORS[ep.method]}`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono flex-1 truncate">{ep.path}</code>
                        <span className="text-xs text-muted-foreground truncate max-w-xs hidden sm:block">{ep.summary}</span>
                      </div>
                      {isExpanded && (
                        <div className="mt-1 ml-2 p-3 bg-muted/20 rounded-md text-xs space-y-2">
                          <p className="font-medium">{ep.summary}</p>
                          {ep.parameters?.length > 0 && (
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Parametri:</p>
                              <div className="space-y-1">
                                {ep.parameters.map(p => (
                                  <div key={p.name} className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px]">{p.in}</Badge>
                                    <code className="font-mono">{p.name}</code>
                                    {p.required && <span className="text-red-500">*</span>}
                                    <span className="text-muted-foreground">— {p.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {ep.requestBody && (
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Request Body:</p>
                              <pre className="bg-muted rounded p-2 text-[11px] font-mono overflow-x-auto">
{JSON.stringify({ /* primer */ field1: "value1", field2: "value2" }, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-muted-foreground mb-1">Responses:</p>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(ep.responses).map(([code, resp]) => (
                                <Badge key={code} variant="outline" className="text-[10px]">
                                  {code} — {resp.description}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Open JSON in new tab */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => window.open('/api/api-docs', '_blank')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Otvori OpenAPI JSON spec
        </button>
      </div>
    </div>
  )
}
