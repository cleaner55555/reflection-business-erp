import { useState, useEffect, useCallback, useMemo } from 'react'
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

export function useWorkOrders() {
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

  return {
    activeTab,
    allTasks,
    editingOrder,
    filteredOrders,
    filteredTasks,
    formData,
    formOpen,
    groupOrders,
    handleCreate,
    handleDelete,
    handleDeleteTask,
    handleEdit,
    handleFormSubmit,
    handleTaskFormSubmit,
    orders,
    plannerGroups,
    plannerOrdersForMonth,
    s,
    setActiveTab,
    setFormData,
    setFormOpen,
    setPriorityFilter,
    setSearch,
    setStatusFilter,
    setTaskForm,
    setTaskFormOpen,
    setTaskStatusFilter,
    setTaskWoFilter,
    setViewMode,
    taskForm,
    taskFormOpen,
    taskSearch,
    taskStatusFilter,
    taskWoFilter,
    wo,
  }
}
