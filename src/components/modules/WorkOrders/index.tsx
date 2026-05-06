'use client'
import { ClipboardList, Plus, CalendarDays, ListChecks, BarChart3 } from 'lucide-react'

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
import { StatsCards, StatusBadge, PriorityBadge, TaskStatusBadge, EmployeeChip, ViewToggle, FilterBar, WorkOrderTable, KanbanBoard, WorkOrderFormDialog, WorkOrderDetailDialog, TaskFormDialog, CompletionReportPanel, AssigneeReportTable, PriorityReportPanel, WorkOrdersListTab, PlannerTab, TasksTab, ReportsTab, DeleteConfirmDialog0, DeleteConfirmDialog1 } from './components'

import { useWorkOrders } from './hooks'

export function RadniNalozi() {
  const {activeTab, allTasks, editingOrder, filteredOrders, filteredTasks, formData, formOpen, groupOrders, handleCreate, handleDelete, handleDeleteTask, handleEdit, handleFormSubmit, handleTaskFormSubmit, orders, plannerGroups, plannerOrdersForMonth, s, setActiveTab, setFormData, setFormOpen, setPriorityFilter, setSearch, setStatusFilter, setTaskForm, setTaskFormOpen, setTaskStatusFilter, setTaskWoFilter, setViewMode, taskForm, taskFormOpen, taskSearch, taskStatusFilter, taskWoFilter, wo} = useWorkOrders()
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
        <WorkOrdersListTab filteredOrders={filteredOrders} handleEdit={handleEdit} orders={orders} setPriorityFilter={setPriorityFilter} setSearch={setSearch} setStatusFilter={setStatusFilter} setViewMode={setViewMode} />

        {/* ==================== TAB 2: Planer ==================== */}
        <PlannerTab groupOrders={groupOrders} plannerGroups={plannerGroups} plannerOrdersForMonth={plannerOrdersForMonth} />

        {/* ==================== TAB 3: Zadaci ==================== */}
        <TasksTab allTasks={allTasks} filteredTasks={filteredTasks} orders={orders} s={s} setTaskStatusFilter={setTaskStatusFilter} setTaskWoFilter={setTaskWoFilter} taskSearch={taskSearch} taskStatusFilter={taskStatusFilter} taskWoFilter={taskWoFilter} wo={wo} />

        {/* ==================== TAB 4: Izveštaji ==================== */}
        <ReportsTab orders={orders} />
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
              <DeleteConfirmDialog0 handleDelete={handleDelete} />

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
              <DeleteConfirmDialog1 handleDeleteTask={handleDeleteTask} />
    </div>
  )
}
