'use client'

// ==========================================
// Radni Nalozi – Main Module
// Serbian ERP: Reflection Business
// Full production-quality Work Orders module
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ClipboardList,
  Plus,
  CalendarDays,
  ListChecks,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CircleDot,
  Calendar,
  Timer,
  TrendingUp,
  GripVertical,
  ArrowLeft,
  ArrowUpDown,
  FileText,
  ArrowUpRight,
} from 'lucide-react'

// ---- Types ----
import type {
  WorkOrder,
  WorkOrderTask,
  WorkOrderStatus,
  WorkOrderPriority,
  TaskStatus,
  WorkOrderFormData,
  TaskFormData,
  WorkOrderViewMode,
  PlannerGroupBy,
} from './types'

// ---- Data / helpers ----
import {
  MOCK_WORK_ORDERS,
  EMPLOYEES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_TASK_STATUSES,
  formatRSD,
  formatDate,
  formatDateTime,
  generateOrderNumber,
  isOverdue,
  getEmployeeName,
  getEmployeeInitials,
  getDefaultWorkOrderForm,
  getDefaultTaskForm,
  generateCompletionReport,
  generateAssigneeReports,
  generatePriorityReports,
} from './data'

// ---- Sub-components ----
import {
  StatsCards,
  StatusBadge,
  PriorityBadge,
  TaskStatusBadge,
  EmployeeChip,
  ViewToggle,
  FilterBar,
  WorkOrderTable,
  KanbanBoard,
  WorkOrderFormDialog,
  WorkOrderDetailDialog,
  TaskFormDialog,
  CompletionReportPanel,
  AssigneeReportTable,
  PriorityReportPanel,
} from './components'

// ==========================================
// Main Export
// ==========================================

export function WorkOrders() {
  // ---- Core state ----
  const [orders, setOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS)
  const [allTasks, setAllTasks] = useState<WorkOrderTask[]>(
    MOCK_WORK_ORDERS.flatMap(o => o.tasks)
  )
  const [activeTab, setActiveTab] = useState<string>('nalozi')

  // ---- Filter / search state ----
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<WorkOrderViewMode>('tabela')

  // ---- CRUD dialogs ----
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [formData, setFormData] = useState<WorkOrderFormData>(getDefaultWorkOrderForm())
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ---- Task CRUD ----
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<WorkOrderTask | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormData>(getDefaultTaskForm(''))
  const [taskDeleteId, setTaskDeleteId] = useState<string | null>(null)
  const [taskWoFilter, setTaskWoFilter] = useState<string>('all')
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all')
  const [taskSearch, setTaskSearch] = useState('')

  // ---- Planner state ----
  const [plannerGroupBy, setPlannerGroupBy] = useState<PlannerGroupBy>('datum')
  const [plannerMonth, setPlannerMonth] = useState<Date>(new Date())

  // ---- API simulation helpers ----
  const fetchWorkOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/work-orders')
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setOrders(json.data)
          setAllTasks(json.data.flatMap((o: WorkOrder) => o.tasks))
          return
        }
      }
    } catch {
      // fallback to mock data
    }
    // Use local mock data as fallback
    setOrders(MOCK_WORK_ORDERS)
    setAllTasks(MOCK_WORK_ORDERS.flatMap(o => o.tasks))
  }, [])

  const saveWorkOrder = useCallback(async (order: WorkOrder) => {
    try {
      await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
    } catch {
      // silent
    }
  }, [])

  const deleteWorkOrderApi = useCallback(async (id: string) => {
    try {
      await fetch(`/api/work-orders?id=${id}`, { method: 'DELETE' })
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchWorkOrders()
  }, [fetchWorkOrders])

  // ---- Filtered orders ----
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !o.title.toLowerCase().includes(q) &&
          !o.orderNumber.toLowerCase().includes(q) &&
          !getEmployeeName(o.assignedTo).toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false
      return true
    })
  }, [orders, search, statusFilter, priorityFilter])

  // ---- Work Order CRUD handlers ----
  const handleCreate = () => {
    setEditingOrder(null)
    setFormData(getDefaultWorkOrderForm())
    setFormOpen(true)
  }

  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order)
    setFormData({
      title: order.title,
      description: order.description,
      priority: order.priority,
      status: order.status,
      assignedTo: order.assignedTo,
      dueDate: order.dueDate,
      estimatedHours: order.estimatedHours,
      costRSD: order.costRSD,
      pdvRate: order.pdvRate,
    })
    setFormOpen(true)
  }

  const handleFormSubmit = () => {
    if (!formData.title.trim()) return

    const now = new Date().toISOString()

    if (editingOrder) {
      // Update
      const updated = orders.map(o => {
        if (o.id !== editingOrder.id) return o
        const wasNotCompleted = o.status !== 'zavrsen'
        const isNowCompleted = formData.status === 'zavrsen'
        return {
          ...o,
          ...formData,
          updatedAt: now,
          completedAt: isNowCompleted && wasNotCompleted ? now : o.completedAt,
        }
      })
      setOrders(updated)
      const updatedOrder = updated.find(o => o.id === editingOrder.id)
      if (updatedOrder) saveWorkOrder(updatedOrder)
    } else {
      // Create
      const newOrder: WorkOrder = {
        id: `wo-${Date.now()}`,
        orderNumber: generateOrderNumber(orders),
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours,
        actualHours: 0,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        costRSD: formData.costRSD,
        pdvRate: formData.pdvRate,
        tasks: [],
      }
      setOrders([newOrder, ...orders])
      saveWorkOrder(newOrder)
    }

    setFormOpen(false)
    setEditingOrder(null)
  }

  const handleDelete = () => {
    if (!deleteId) return
    setOrders(orders.filter(o => o.id !== deleteId))
    setAllTasks(allTasks.filter(t => t.workOrderId !== deleteId))
    deleteWorkOrderApi(deleteId)
    setDeleteId(null)
  }

  // ---- Task CRUD handlers ----
  const handleCreateTask = (workOrderId: string) => {
    setEditingTask(null)
    setTaskForm(getDefaultTaskForm(workOrderId))
    setTaskFormOpen(true)
  }

  const handleEditTask = (task: WorkOrderTask) => {
    setEditingTask(task)
    setTaskForm({
      workOrderId: task.workOrderId,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
    })
    setTaskFormOpen(true)
  }

  const handleTaskFormSubmit = () => {
    if (!taskForm.title.trim()) return

    const now = new Date().toISOString()

    if (editingTask) {
      const updatedTasks = allTasks.map(t => {
        if (t.id !== editingTask.id) return t
        return {
          ...t,
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          assignedTo: taskForm.assignedTo,
          dueDate: taskForm.dueDate,
          estimatedHours: taskForm.estimatedHours,
          updatedAt: now,
        }
      })
      setAllTasks(updatedTasks)
    } else {
      const newTask: WorkOrderTask = {
        id: `task-${Date.now()}`,
        workOrderId: taskForm.workOrderId,
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate,
        estimatedHours: taskForm.estimatedHours,
        actualHours: 0,
        createdAt: now,
        updatedAt: now,
      }
      setAllTasks([...allTasks, newTask])
    }

    // Sync tasks into orders
    setOrders(orders.map(o => ({
      ...o,
      tasks: allTasks
        .concat(editingTask ? [] : [{
          id: editingTask ? editingTask.id : `task-${Date.now()}`,
          workOrderId: taskForm.workOrderId,
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          assignedTo: taskForm.assignedTo,
          dueDate: taskForm.dueDate,
          estimatedHours: taskForm.estimatedHours,
          actualHours: editingTask?.actualHours || 0,
          createdAt: editingTask?.createdAt || now,
          updatedAt: now,
        }])
        .filter(t =>
          t.workOrderId === o.id &&
          (editingTask ? t.id !== editingTask.id : true)
        ),
    })))

    setTaskFormOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = () => {
    if (!taskDeleteId) return
    setAllTasks(allTasks.filter(t => t.id !== taskDeleteId))
    setOrders(orders.map(o => ({
      ...o,
      tasks: o.tasks.filter(t => t.id !== taskDeleteId),
    })))
    setTaskDeleteId(null)
  }

  // ---- Computed tasks for Tasks tab ----
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (taskWoFilter !== 'all' && t.workOrderId !== taskWoFilter) return false
      if (taskStatusFilter !== 'all' && t.status !== taskStatusFilter) return false
      if (taskSearch) {
        const q = taskSearch.toLowerCase()
        if (
          !t.title.toLowerCase().includes(q) &&
          !getEmployeeName(t.assignedTo).toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [allTasks, taskWoFilter, taskStatusFilter, taskSearch])

  // ---- Reports ----
  const completionReport = useMemo(() => generateCompletionReport(orders), [orders])
  const assigneeReports = useMemo(() => generateAssigneeReports(orders), [orders])
  const priorityReports = useMemo(() => generatePriorityReports(orders), [orders])

  // ---- Planner helpers ----
  const plannerGroups = useMemo(() => {
    if (plannerGroupBy === 'datum') {
      const grouped: Record<string, WorkOrder[]> = {}
      for (const order of orders) {
        const key = formatDate(order.dueDate)
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(order)
      }
      return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    }

    if (plannerGroupBy === 'zaposleni') {
      const grouped: Record<string, WorkOrder[]> = {}
      for (const order of orders) {
        const key = getEmployeeName(order.assignedTo)
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(order)
      }
      return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    }

    // prioritet
    const grouped: Record<string, WorkOrder[]> = {}
    for (const order of orders) {
      const key = PRIORITY_CONFIG[order.priority].label
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(order)
    }
    return Object.entries(grouped)
  }, [orders, plannerGroupBy])

  const navigatePlannerMonth = (dir: number) => {
    setPlannerMonth(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  const plannerMonthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(plannerMonth)
  }, [plannerMonth])

  const plannerOrdersForMonth = useMemo(() => {
    const month = plannerMonth.getMonth()
    const year = plannerMonth.getFullYear()
    return orders.filter(o => {
      const d = new Date(o.dueDate)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [orders, plannerMonth])

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Радни налози
          </h1>
          <p className="text-sm text-muted-foreground">
            Управљање радним налозима, задацима и извештајима
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Нови радни налог
        </Button>
      </div>

      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="nalozi" className="gap-1.5 text-xs sm:text-sm">
            <ClipboardList className="h-3.5 w-3.5 hidden sm:inline" />
            Радни налози
          </TabsTrigger>
          <TabsTrigger value="planer" className="gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5 hidden sm:inline" />
            Планер
          </TabsTrigger>
          <TabsTrigger value="zadaci" className="gap-1.5 text-xs sm:text-sm">
            <ListChecks className="h-3.5 w-3.5 hidden sm:inline" />
            Задаци
          </TabsTrigger>
          <TabsTrigger value="izvestaji" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:inline" />
            Извештаји
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: Radni Nalozi ==================== */}
        <TabsContent value="nalozi" className="space-y-4">
          <StatsCards orders={orders} />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
            />
            <ViewToggle mode={viewMode} onModeChange={setViewMode} />
          </div>

          {viewMode === 'tabela' ? (
            <WorkOrderTable
              orders={filteredOrders}
              onView={o => setDetailOrder(o)}
              onEdit={handleEdit}
              onDelete={id => setDeleteId(id)}
            />
          ) : (
            <KanbanBoard
              orders={filteredOrders}
              onEdit={handleEdit}
              onView={o => setDetailOrder(o)}
            />
          )}

          <div className="text-xs text-muted-foreground text-right">
            Приказано {filteredOrders.length} од {orders.length} налога
          </div>
        </TabsContent>

        {/* ==================== TAB 2: Planer ==================== */}
        <TabsContent value="planer" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Планер радних налога
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                    <Button
                      variant={plannerGroupBy === 'datum' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPlannerGroupBy('datum')}
                    >
                      По датуму
                    </Button>
                    <Button
                      variant={plannerGroupBy === 'zaposleni' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPlannerGroupBy('zaposleni')}
                    >
                      По запосленом
                    </Button>
                    <Button
                      variant={plannerGroupBy === 'prioritet' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setPlannerGroupBy('prioritet')}
                    >
                      По приоритету
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => navigatePlannerMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[140px] text-center capitalize">
                      {plannerMonthLabel}
                    </span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => navigatePlannerMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Укупно {plannerOrdersForMonth.length} налога у овом месецу
                </p>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {plannerGroups.map(([groupKey, groupOrders]) => {
                    const completed = groupOrders.filter(o => o.status === 'zavrsen').length
                    const overdue = groupOrders.filter(isOverdue).length

                    return (
                      <div key={groupKey}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">{groupKey}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {groupOrders.length}
                            </Badge>
                            {overdue > 0 && (
                              <Badge variant="destructive" className="text-xs gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {overdue}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {completed}/{groupOrders.length}
                          </div>
                        </div>
                        <Progress
                          value={groupOrders.length > 0 ? (completed / groupOrders.length) * 100 : 0}
                          className="h-1.5 mb-2"
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          {groupOrders.map(order => (
                            <Card
                              key={order.id}
                              className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setDetailOrder(order)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {order.orderNumber}
                                    </span>
                                    <PriorityBadge priority={order.priority} />
                                  </div>
                                  <h4 className="text-sm font-medium truncate">{order.title}</h4>
                                </div>
                                <StatusBadge status={order.status} />
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <EmployeeChip employeeId={order.assignedTo} />
                                <div className="flex items-center gap-1">
                                  {isOverdue(order) && (
                                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                                  )}
                                  <span className={isOverdue(order) ? 'text-rose-500 font-medium' : ''}>
                                    {formatDate(order.dueDate)}
                                  </span>
                                </div>
                              </div>
                              {order.tasks.length > 0 && (
                                <div className="mt-2">
                                  <Progress
                                    value={(order.tasks.filter(t => t.status === 'zavrsen').length / order.tasks.length) * 100}
                                    className="h-1"
                                  />
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 3: Zadaci ==================== */}
        <TabsContent value="zadaci" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Управљање задацима
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Нови задатак
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {orders
                      .filter(o => o.status !== 'zavrsen' && o.status !== 'otkazan')
                      .map(o => (
                        <DropdownMenuItem
                          key={o.id}
                          onClick={() => handleCreateTask(o.id)}
                        >
                          <span className="font-mono text-xs text-muted-foreground mr-2">
                            {o.orderNumber}
                          </span>
                          {o.title}
                        </DropdownMenuItem>
                      ))}
                    {orders.filter(o => o.status !== 'zavrsen' && o.status !== 'otkazan').length === 0 && (
                      <DropdownMenuItem disabled>
                        Нема активних налога
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Претрага задатака..."
                    className="pl-8 h-9"
                    value={taskSearch}
                    onChange={e => setTaskSearch(e.target.value)}
                  />
                </div>
                <Select value={taskWoFilter} onValueChange={setTaskWoFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[200px]">
                    <SelectValue placeholder="Сви налози" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сви налози</SelectItem>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.orderNumber} – {o.title.slice(0, 25)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[150px]">
                    <SelectValue placeholder="Сви статуси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сви статуси</SelectItem>
                    {ALL_TASK_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {TASK_STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task stats */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{allTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Укупно задатака</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {allTasks.filter(t => t.status === 'u_toku').length}
                  </p>
                  <p className="text-xs text-muted-foreground">У току</p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {allTasks.filter(t => t.status === 'zavrsen').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Завршено</p>
                </div>
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-rose-600">
                    {allTasks.filter(t => t.status === 'blokiran').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Блокирано</p>
                </div>
              </div>

              {/* Task list */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Задатак</TableHead>
                      <TableHead className="hidden md:table-cell">Радни налог</TableHead>
                      <TableHead className="hidden sm:table-cell">Статус</TableHead>
                      <TableHead className="hidden lg:table-cell">Задужен</TableHead>
                      <TableHead className="hidden md:table-cell">Рок</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Сати</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                          <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>Нема задатака за приказ</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map(task => {
                        const wo = orders.find(o => o.id === task.workOrderId)
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{task.title}</span>
                                {task.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {task.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {wo ? (
                                <Badge variant="outline" className="font-mono text-xs">
                                  {wo.orderNumber}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <TaskStatusBadge status={task.status} />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <EmployeeChip employeeId={task.assignedTo} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(task.dueDate)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-right">
                              <span className="text-xs">
                                {task.actualHours}/{task.estimatedHours}h
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Измени
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setTaskDeleteId(task.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Обриши
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-muted-foreground text-right">
                Приказано {filteredTasks.length} од {allTasks.length} задатака
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 4: Izveštaji ==================== */}
        <TabsContent value="izvestaji" className="space-y-6">
          <CompletionReportPanel report={completionReport} />
          <AssigneeReportTable reports={assigneeReports} />
          <PriorityReportPanel reports={priorityReports} />

          {/* Overdue orders detail */}
          {orders.filter(isOverdue).length > 0 && (
            <Card className="border-rose-200 dark:border-rose-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                  Прекорачени рокови ({orders.filter(isOverdue).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Број</TableHead>
                        <TableHead>Назив</TableHead>
                        <TableHead className="hidden sm:table-cell">Приоритет</TableHead>
                        <TableHead className="hidden md:table-cell">Задужен</TableHead>
                        <TableHead>Рок</TableHead>
                        <TableHead className="hidden sm:table-cell">Дана закаснело</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.filter(isOverdue).map(order => {
                        const daysOverdue = Math.ceil(
                          (Date.now() - new Date(order.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                        )
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                            <TableCell className="text-sm font-medium">{order.title}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <PriorityBadge priority={order.priority} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <EmployeeChip employeeId={order.assignedTo} />
                            </TableCell>
                            <TableCell className="text-rose-600 font-medium text-sm">
                              {formatDate(order.dueDate)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="destructive" className="text-xs">
                                +{daysOverdue} дана
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ==================== Dialogs ==================== */}

      {/* Work Order Form Dialog */}
      <WorkOrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={formData}
        setForm={setFormData}
        onSubmit={handleFormSubmit}
        isEditing={!!editingOrder}
        title={editingOrder ? `Измена: ${editingOrder.orderNumber}` : 'Нови радни налог'}
      />

      {/* Work Order Detail Dialog */}
      <WorkOrderDetailDialog
        open={!!detailOrder}
        onOpenChange={open => { if (!open) setDetailOrder(null) }}
        order={detailOrder}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Брисање радног налога</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете овај радни налог? Ова акција је неповратна
              и биће обрисани и сви повезани задаци.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        form={taskForm}
        setForm={setTaskForm}
        onSubmit={handleTaskFormSubmit}
        isEditing={!!editingTask}
      />

      {/* Task Delete Confirmation */}
      <AlertDialog open={!!taskDeleteId} onOpenChange={open => { if (!open) setTaskDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Брисање задатка</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете овај задатак?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
