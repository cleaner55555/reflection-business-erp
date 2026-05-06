'use client'

from '@/components/ui/badge'
from '@/components/ui/button'
from '@/components/ui/card'
from '@/components/ui/scroll-area'
from '@/components/ui/separator'
from '@/components/ui/skeleton'
from '@/components/ui/table'
import { , Activity } from 'lucide-react'
import type { OverdueInvoice, RecentPartner, RecentTransaction, ActivityItem, DashboardData, LowStockProduct } from './types'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      {/* Quick Actions skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Alerts skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      {/* Today tasks + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ========== TodaystasksactivityfeedSection ==========

export function TodaystasksactivityfeedSection({ groupedActivity, item }: { groupedActivity: any, item: any }) {
  return (
    <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
      {/* Today's Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                {t('dashboard.todayTasks')}
              </CardTitle>
            </div>
            {overdueAndDueToday > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueAndDueToday}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {/* Overdue Invoices */}
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                {t('dashboard.overdueInvoices')} ({data.overdueCount})
              </p>
              {data.overdueInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noOverdue')}</p>
              ) : (
                <div className="space-y-2">
                  {data.overdueInvoices.slice(0, 5).map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{inv.number}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {tc(inv.partner?.name || '-')} · {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-xs font-bold text-red-600">{formatRSD(inv.totalAmount)}</p>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700 border-red-200"
                        >
                          {t('dashboard.overdue')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            <Separator />
    
            {/* Due Today */}
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {t('dashboard.dueToday')} ({data.todayDueInvoices.length})
              </p>
              {data.todayDueInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-5">{t('dashboard.noTasks')}</p>
              ) : (
                <div className="space-y-2">
                  {data.todayDueInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{inv.number}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {tc(inv.partner?.name || '-')}
                        </p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-xs font-bold text-amber-600">{formatRSD(inv.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            {overdueAndDueToday > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-medium text-muted-foreground">{t('dashboard.unpaidTotal')}</p>
                  <p className="text-sm font-bold text-red-600">
                    {formatRSD(data.overdueTotal + data.todayDueInvoices.reduce((s, i) => s + i.totalAmount, 0))}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    
      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-500" />
              {t('dashboard.activityFeed')}
            </CardTitle>
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {groupedActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('common.noData')}
              </p>
            ) : (
              <div className="space-y-4 pr-4">
                {groupedActivity.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.items.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`rounded-lg p-1.5 mt-0.5 shrink-0 ${
                              activity.icon === 'invoice'
                                ? 'bg-emerald-100'
                                : activity.icon === 'partner'
                                ? 'bg-violet-100'
                                : 'bg-amber-100'
                            }`}
                          >
                            {activity.icon === 'invoice' ? (
                              <FileText className="h-3.5 w-3.5 text-emerald-600" />
                            ) : activity.icon === 'partner' ? (
                              <Users className="h-3.5 w-3.5 text-violet-600" />
                            ) : (
                              <Receipt className="h-3.5 w-3.5 text-amber-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{activity.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {activity.subtitle}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {activity.amount !== undefined && (
                              <p className={`text-xs font-medium ${activity.type === 'transaction' ? (activity.icon === 'invoice' || (activity as ActivityItem & { type: string }).type === 'transaction' ? '' : '') : ''}`}>
                                {activity.type === 'transaction'
                                  ? (() => {
                                      const trItem = activity as ActivityItem & { type: string }
                                      return (
                                        <span className={trItem.amount && (data.recentTransactions.find(r => r.id === activity.id)?.type === 'prihod') ? 'text-emerald-600' : 'text-red-600'}>
                                          {formatRSD(activity.amount)}
                                        </span>
                                      )
                                    })()
                                  : <span className="text-slate-600">{formatRSD(activity.amount)}</span>
                                }
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
    
    {/* KPI Cards */}
  )
}


// ========== ChartsrowSection ==========

export function ChartsrowSection({ 0, 3, 50, 8, 80, false, item, monthlyRevenueChart, pieData }: { 0: any, 3: any, 50: any, 8: any, 80: any, false: any, item: any, monthlyRevenueChart: any, pieData: any }) {
  return (
    <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t('dashboard.revenueTrend')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('dashboard.revenueByMonth')}</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  formatter={(value: number) => [formatRSD(value), t('common.prihod')]}
                  labelFormatter={getMonthLabel}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    
      {/* Expenses by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t('dashboard.expensesByCategory')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('dashboard.expenseDistribution')}</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
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
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    
    {/* Bottom Row */}
  )
}


// ========== BottomrowSection ==========

export function BottomrowSection({ i, item, lowStock, recentInvoices }: { i: any, item: any, lowStock: any, recentInvoices: any }) {
  return (
    <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
      {/* Recent Invoices */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('dashboard.recentInvoices')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.recentInvoicesSubtitle')}</p>
            </div>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t('common.number')}</TableHead>
                <TableHead className="text-xs">{t('common.partner')}</TableHead>
                <TableHead className="text-xs">{t('common.date')}</TableHead>
                <TableHead className="text-xs">{t('common.status')}</TableHead>
                <TableHead className="text-xs text-right">{t('common.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-xs font-medium">{invoice.number}</TableCell>
                  <TableCell className="text-xs">{tc(invoice.partner?.name || '-')}</TableCell>
                  <TableCell className="text-xs">{formatDate(invoice.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0 ${getStatusColor(invoice.status)}`}
                    >
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium">
                    {formatRSD(invoice.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    
      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('dashboard.lowStock')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.lowStockSubtitle')}</p>
            </div>
            <BoxIcon className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('dashboard.stockOk')}
              </p>
            ) : (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium">{tc(product.name)}</p>
                    <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">{product.currentStock}</p>
                    <p className="text-[10px] text-muted-foreground">min: {product.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
        </motion.div>
      )
    }
    
    // ============ SKELETON ============
    
    function DashboardSkeleton() {
      return (
        <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64 mt-2" />
    </div>
    {/* Quick Actions skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
    {/* Alerts skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
    {/* Today tasks + Activity */}
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
    {/* KPIs */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
    {/* Charts */}
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-72 w-full" />
        </CardContent>
  )
}

