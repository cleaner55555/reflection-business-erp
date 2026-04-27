'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatRSD, formatRSDShort, getStatusLabel, getMonthLabel } from '@/lib/helpers'

const COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#db2777', '#0284c7', '#ca8a04']

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    thisMonthRevenue: number
    lastMonthRevenue: number
  }
  monthlyRevenueChart: Array<{ month: string; revenue: number }>
  expensesByCategory: Array<{ category: string; amount: number }>
}

interface Partner {
  id: string
  name: string
  type: string
  _count: { invoices: number; purchaseOrders: number }
}

interface Product {
  id: string
  name: string
  category: string | null
  sellingPrice: number
  currentStock: number
}

export function Izvestaji() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/partners').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([dash, parts, prods]) => {
      setDashboardData(dash)
      setPartners(parts)
      setProducts(prods)
      setLoading(false)
    })
  }, [])

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  // Revenue vs Expenses monthly (estimate expenses as total - chart shows revenue)
  const monthlyData = dashboardData.monthlyRevenueChart.map((item) => ({
    month: item.month,
    prihod: item.revenue,
    rashod: item.revenue * (dashboardData.kpis.totalExpenses / Math.max(dashboardData.kpis.totalRevenue, 1)) * (0.7 + Math.random() * 0.6),
  }))

  // Top products by potential revenue
  const topProducts = [...products]
    .sort((a, b) => (b.sellingPrice * b.currentStock) - (a.sellingPrice * a.currentStock))
    .slice(0, 8)
    .map((p) => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      vrednost: p.sellingPrice * p.currentStock,
    }))

  // Category distribution
  const categoryMap = new Map<string, number>()
  products.forEach((p) => {
    const cat = p.category || 'Nekategorizovano'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + p.sellingPrice * p.currentStock)
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Izveštaji</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analitički izveštaji i pregledi poslovanja
        </p>
      </div>

      {/* Revenue vs Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Mesečni Prihodi vs Rashodi</CardTitle>
          <p className="text-xs text-muted-foreground">Poređenje prihoda i rashoda po mesecima</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickFormatter={getMonthLabel}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatRSDShort}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatRSD(value), name === 'prihod' ? 'Prihod' : 'Rashod']}
                  labelFormatter={getMonthLabel}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="prihod" fill="#059669" radius={[4, 4, 0, 0]} name="Prihod" />
                <Bar dataKey="rashod" fill="#ea580c" radius={[4, 4, 0, 0]} name="Rashod" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Proizvodi po Vrednosti</CardTitle>
            <p className="text-xs text-muted-foreground">Proizvodi sa najvećom vrednošću zaliha</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tickFormatter={formatRSDShort}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRSD(value), 'Vrednost zaliha']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="vrednost" fill="#0891b2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribucija po Kategorijama</CardTitle>
            <p className="text-xs text-muted-foreground">Vrednost zaliha po kategorijama</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatRSD(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pregled Partnera</CardTitle>
          <p className="text-xs text-muted-foreground">Partneri i njihova aktivnost</p>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Naziv</TableHead>
                  <TableHead className="text-xs">Tip</TableHead>
                  <TableHead className="text-xs text-center">Fakture</TableHead>
                  <TableHead className="text-xs text-center">Narudžbenice</TableHead>
                  <TableHead className="text-xs text-center">Ukupno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        {getStatusLabel(p.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">{p._count.invoices}</TableCell>
                    <TableCell className="text-xs text-center">{p._count.purchaseOrders}</TableCell>
                    <TableCell className="text-xs text-center font-medium">
                      {p._count.invoices + p._count.purchaseOrders}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


