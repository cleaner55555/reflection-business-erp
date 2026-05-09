// ==========================================
// Radni Nalozi – Reusable Sub-Components
// Serbian ERP: Reflection Business
// ==========================================

"use client";

import {
  type WorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrderFormData,
  type TaskFormData,
  type WorkOrderTask,
  type TaskStatus,
  type WorkOrderViewMode,
  type CompletionReport,
  type AssigneeReport,
  type PriorityReport,
} from "./types";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_TASK_STATUSES,
  EMPLOYEES,
  formatRSD,
  formatDate,
  formatDateTime,
  getEmployeeName,
  getEmployeeInitials,
  isOverdue,
} from "./data";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  GripVertical,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  User,
  AlertTriangle,
  BarChart3,
  Users,
  Timer,
  TrendingUp,
  XCircle,
  Eye,
  CircleDot,
  ChevronRight,
} from "lucide-react";

// ========== Stats Cards ==========

export function StatsCards({ orders }: { orders: WorkOrder[] }) {
  const total = orders.length;
  const active = orders.filter((o) => o.status === "u_toku").length;
  const pending = orders.filter((o) =>
    ["novi", "na_cekanju", "zakuca"].includes(o.status),
  ).length;
  const completed = orders.filter((o) => o.status === "zavrsen").length;
  const overdue = orders.filter(isOverdue).length;

  const stats = [
    {
      label: "Укупно",
      value: total,
      icon: FileText,
      color: "text-muted-foreground",
    },
    {
      label: "У току",
      value: active,
      icon: CircleDot,
      color: "text-amber-600",
    },
    {
      label: "На чекању",
      value: pending,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Завршени",
      value: completed,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {stats.map((s) => (
        <Card key={s.label} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
            <s.icon className={`h-4 w-4 ${s.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-muted-foreground">
              {s.label === "Укупно" ? "радних налога" : s.label.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      ))}
      <Card className="relative overflow-hidden border-rose-200 dark:border-rose-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-rose-600">
            Прекорачени
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">{overdue}</div>
          <p className="text-xs text-muted-foreground">рок је истекао</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== Status Badge ==========

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge
      variant="secondary"
      className={`${cfg.bgColor} ${cfg.color} border-0 gap-1.5 font-medium`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </Badge>
  );
}

// ========== Priority Badge ==========

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <Badge
      variant="outline"
      className={`${cfg.color} ${cfg.bgColor} border-0 gap-1 font-medium`}
    >
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

// ========== Task Status Badge ==========

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg = TASK_STATUS_CONFIG[status];
  return (
    <Badge
      variant="secondary"
      className={`${cfg.bgColor} ${cfg.color} border-0 font-medium`}
    >
      {cfg.label}
    </Badge>
  );
}

// ========== Employee Avatar ==========

export function EmployeeChip({
  employeeId,
  size = "sm",
}: {
  employeeId: string;
  size?: "sm" | "md";
}) {
  const emp = EMPLOYEES.find((e) => e.id === employeeId);
  const name = emp?.name || getEmployeeName(employeeId);
  const initials = getEmployeeInitials(name);

  if (size === "md") {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Avatar className="h-5 w-5">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

// ========== View Toggle ==========

export function ViewToggle({
  mode,
  onModeChange,
}: {
  mode: WorkOrderViewMode;
  onModeChange: (m: WorkOrderViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
      <Button
        variant={mode === "tabela" ? "default" : "ghost"}
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => onModeChange("tabela")}
      >
        <List className="h-3.5 w-3.5" />
        Табела
      </Button>
      <Button
        variant={mode === "kanban" ? "default" : "ghost"}
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => onModeChange("kanban")}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Канбан
      </Button>
    </div>
  );
}

// ========== Search & Filter Bar ==========

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Претрага по називу или броју..."
          className="pl-8 h-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="h-9 w-full sm:w-[160px]">
          <SelectValue placeholder="Сви статуси" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Сви статуси</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
        <SelectTrigger className="h-9 w-full sm:w-[160px]">
          <SelectValue placeholder="Сви приоритети" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Сви приоритети</SelectItem>
          {ALL_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_CONFIG[p].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ========== Work Order Table ==========

export function WorkOrderTable({
  orders,
  onView,
  onEdit,
  onDelete,
}: {
  orders: WorkOrder[];
  onView: (o: WorkOrder) => void;
  onEdit: (o: WorkOrder) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Број</TableHead>
            <TableHead>Назив</TableHead>
            <TableHead className="hidden md:table-cell">Приоритет</TableHead>
            <TableHead className="hidden sm:table-cell">Статус</TableHead>
            <TableHead className="hidden lg:table-cell">Задужен</TableHead>
            <TableHead className="hidden md:table-cell">Рок</TableHead>
            <TableHead className="hidden xl:table-cell text-right">
              Трошак
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-12"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Нема радних налога за приказ</p>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onView(order)}
              >
                <TableCell className="font-mono text-xs">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{order.title}</span>
                    {order.tasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {
                          order.tasks.filter((t) => t.status === "zavrsen")
                            .length
                        }
                        /{order.tasks.length} задатака
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <PriorityBadge priority={order.priority} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <EmployeeChip employeeId={order.assignedTo} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    {isOverdue(order) && (
                      <AlertTriangle className="h-3 w-3 text-rose-500" />
                    )}
                    <span
                      className={`text-xs ${isOverdue(order) ? "text-rose-600 font-medium" : "text-muted-foreground"}`}
                    >
                      {formatDate(order.dueDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-right">
                  <span className="text-sm font-medium">
                    {formatRSD(order.costRSD)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(order);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Преглед
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(order);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" /> Измени
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(order.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Обриши
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ========== Kanban Board ==========

export function KanbanBoard({
  orders,
  onEdit,
  onView,
}: {
  orders: WorkOrder[];
  onEdit: (o: WorkOrder) => void;
  onView: (o: WorkOrder) => void;
}) {
  const kanbanColumns: WorkOrderStatus[] = [
    "novi",
    "zakuca",
    "u_toku",
    "na_cekanju",
    "zavrsen",
    "otkazan",
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {kanbanColumns.map((status) => {
        const cfg = STATUS_CONFIG[status];
        const columnOrders = orders.filter((o) => o.status === status);

        return (
          <div key={status} className="flex-shrink-0 w-[280px] flex flex-col">
            <div
              className={`rounded-t-lg px-3 py-2 ${cfg.bgColor} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                <span className={`text-xs font-semibold ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <Badge variant="secondary" className="h-5 text-xs px-1.5">
                {columnOrders.length}
              </Badge>
            </div>
            <div className="rounded-b-lg border border-t-0 bg-muted/20 min-h-[200px] max-h-[500px] overflow-y-auto p-2 space-y-2">
              {columnOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 opacity-50">
                  Празно
                </p>
              ) : (
                columnOrders.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    onEdit={() => onEdit(order)}
                    onView={() => onView(order)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  order,
  onEdit,
  onView,
}: {
  order: WorkOrder;
  onEdit: () => void;
  onView: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow p-3"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-xs text-muted-foreground">
          {order.orderNumber}
        </span>
        <PriorityBadge priority={order.priority} />
      </div>
      <h4 className="text-sm font-medium leading-snug mb-2 line-clamp-2">
        {order.title}
      </h4>
      {order.tasks.length > 0 && (
        <div className="mb-2">
          <Progress
            value={
              (order.tasks.filter((t) => t.status === "zavrsen").length /
                order.tasks.length) *
              100
            }
            className="h-1.5"
          />
          <span className="text-xs text-muted-foreground">
            {order.tasks.filter((t) => t.status === "zavrsen").length}/
            {order.tasks.length} задатака
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mt-auto">
        <EmployeeChip employeeId={order.assignedTo} />
        <div className="flex items-center gap-1 text-muted-foreground">
          {isOverdue(order) && (
            <AlertTriangle className="h-3 w-3 text-rose-500" />
          )}
          <Calendar className="h-3 w-3" />
          <span
            className={`text-xs ${isOverdue(order) ? "text-rose-500 font-medium" : ""}`}
          >
            {formatDate(order.dueDate)}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ========== Work Order Form Dialog ==========

export function WorkOrderFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  isEditing,
  title,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  form: WorkOrderFormData;
  setForm: (f: WorkOrderFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  title: string;
}) {
  const updateField = <K extends keyof WorkOrderFormData>(
    key: K,
    value: WorkOrderFormData[K],
  ) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените податке радног налога"
              : "Попуните податке за нови радни налог"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="wo-title">Назив *</Label>
            <Input
              id="wo-title"
              placeholder="нпр. Ремонт CNC машине"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wo-desc">Опис</Label>
            <Textarea
              id="wo-desc"
              placeholder="Детаљан опис посла..."
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Приоритет *</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  updateField("priority", v as WorkOrderPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Статус</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  updateField("status", v as WorkOrderStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Задужено лице</Label>
            <Select
              value={form.assignedTo}
              onValueChange={(v) => updateField("assignedTo", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Изаберите..." />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} – {e.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="wo-due">Рок завршетка</Label>
              <Input
                id="wo-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wo-hours">Процен. сати</Label>
              <Input
                id="wo-hours"
                type="number"
                min={0}
                step={0.5}
                value={form.estimatedHours || ""}
                onChange={(e) =>
                  updateField("estimatedHours", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">
            Финансијски подаци
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="wo-cost">Трошак (RSD)</Label>
              <Input
                id="wo-cost"
                type="number"
                min={0}
                step={100}
                value={form.costRSD || ""}
                onChange={(e) =>
                  updateField("costRSD", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wo-pdv">ПДВ стопа (%)</Label>
              <Input
                id="wo-pdv"
                type="number"
                min={0}
                max={100}
                value={form.pdvRate}
                onChange={(e) =>
                  updateField("pdvRate", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
          {form.costRSD > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Нето износ:</span>
                <span className="font-medium">{formatRSD(form.costRSD)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">
                  ПДВ ({form.pdvRate}%):
                </span>
                <span className="font-medium">
                  {formatRSD((form.costRSD * form.pdvRate) / 100)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Укупно (бруто):</span>
                <span>
                  {formatRSD(form.costRSD * (1 + form.pdvRate / 100))}
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Откажи
          </Button>
          <Button onClick={onSubmit} disabled={!form.title.trim()}>
            {isEditing ? "Сачувај измене" : "Креирај налог"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========== Work Order Detail Dialog ==========

export function WorkOrderDetailDialog({
  open,
  onOpenChange,
  order,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  order: WorkOrder | null;
  onEdit: (o: WorkOrder) => void;
}) {
  if (!order) return null;

  const completedTasks = order.tasks.filter(
    (t) => t.status === "zavrsen",
  ).length;
  const taskProgress =
    order.tasks.length > 0
      ? Math.round((completedTasks / order.tasks.length) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground">
                {order.orderNumber}
              </p>
              <DialogTitle className="text-lg">{order.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={order.priority} />
              <StatusBadge status={order.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {order.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.description}
            </p>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Задужено"
              value={getEmployeeName(order.assignedTo)}
            />
            <InfoItem
              icon={<Calendar className="h-4 w-4" />}
              label="Рок"
              value={formatDate(order.dueDate)}
            />
            <InfoItem
              icon={<Clock className="h-4 w-4" />}
              label="Процен. сати"
              value={`${order.estimatedHours}h`}
            />
            <InfoItem
              icon={<Timer className="h-4 w-4" />}
              label="Стварно сати"
              value={`${order.actualHours}h`}
            />
            <InfoItem
              icon={<AlertCircle className="h-4 w-4" />}
              label="Креиран"
              value={formatDateTime(order.createdAt)}
            />
            <InfoItem
              icon={<AlertCircle className="h-4 w-4" />}
              label="Ажуриран"
              value={formatDateTime(order.updatedAt)}
            />
          </div>

          {/* Financial */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Трошак (нето):</span>
              <span className="font-medium">{formatRSD(order.costRSD)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ПДВ ({order.pdvRate}%):
              </span>
              <span className="font-medium">
                {formatRSD((order.costRSD * order.pdvRate) / 100)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Укупно (бруто):</span>
              <span>
                {formatRSD(order.costRSD * (1 + order.pdvRate / 100))}
              </span>
            </div>
          </div>

          {/* Tasks */}
          {order.tasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">
                  Задаци ({completedTasks}/{order.tasks.length})
                </h4>
                <span className="text-xs text-muted-foreground">
                  {taskProgress}%
                </span>
              </div>
              <Progress value={taskProgress} className="h-2 mb-3" />
              <div className="space-y-2">
                {order.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md border p-2.5"
                  >
                    <TaskStatusBadge status={task.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getEmployeeName(task.assignedTo)} ·{" "}
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.actualHours}/{task.estimatedHours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.completedAt && (
            <p className="text-xs text-muted-foreground">
              ✅ Завршен: {formatDateTime(order.completedAt)}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Затвори
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(order);
            }}
          >
            <Edit2 className="h-4 w-4 mr-2" /> Измени
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ========== Task Form Dialog ==========

export function TaskFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  isEditing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  form: TaskFormData;
  setForm: (f: TaskFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
}) {
  const updateField = <K extends keyof TaskFormData>(
    key: K,
    value: TaskFormData[K],
  ) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Измени задатак" : "Нови задатак"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените податке задатка"
              : "Додајте нови задатак у радни налог"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Назив задатка *</Label>
            <Input
              id="task-title"
              placeholder="нпр. Провера система"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-desc">Опис</Label>
            <Textarea
              id="task-desc"
              placeholder="Опис задатка..."
              rows={2}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Статус</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Задужено лице</Label>
              <Select
                value={form.assignedTo}
                onValueChange={(v) => updateField("assignedTo", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изаберите..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-due">Рок</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-hours">Процен. сати</Label>
              <Input
                id="task-hours"
                type="number"
                min={0}
                step={0.5}
                value={form.estimatedHours || ""}
                onChange={(e) =>
                  updateField("estimatedHours", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Откажи
          </Button>
          <Button onClick={onSubmit} disabled={!form.title.trim()}>
            {isEditing ? "Сачувај" : "Додај задатак"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========== Reports Components ==========

export function CompletionReportPanel({
  report,
}: {
  report: CompletionReport;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Укупни преглед
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReportRow label="Укупно налога" value={report.total} />
          <ReportRow
            label="Завршени"
            value={report.completed}
            accent="emerald"
          />
          <ReportRow label="У току" value={report.inProgress} accent="amber" />
          <ReportRow label="На чекању" value={report.pending} accent="orange" />
          <ReportRow label="Отказани" value={report.cancelled} accent="rose" />
          <Separator />
          <ReportRow
            label="Прекорачени рок"
            value={report.overdue}
            accent="rose"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Перформансе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Стопа завршетка</span>
              <span className="font-bold">{report.completionRate}%</span>
            </div>
            <Progress value={report.completionRate} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Просек сати по налогу</span>
              <span className="font-bold">{report.avgHoursPerOrder}h</span>
            </div>
            <Progress
              value={Math.min(report.avgHoursPerOrder * 5, 100)}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Финансијски преглед
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Укупан нето:</span>
              <span className="font-medium">
                {formatRSD(report.totalCostRSD)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Укупан ПДВ:</span>
              <span className="font-medium">{formatRSD(report.totalPDV)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Бруто укупно:</span>
              <span>{formatRSD(report.totalCostRSD + report.totalPDV)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    orange: "text-orange-600",
    rose: "text-rose-600",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-semibold ${accent ? colorMap[accent] : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function AssigneeReportTable({
  reports,
}: {
  reports: AssigneeReport[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Преглед по запосленим
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Запослени</TableHead>
                <TableHead className="text-center">Укупно</TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  Завршени
                </TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  У току
                </TableHead>
                <TableHead className="text-center hidden md:table-cell">
                  Прекорач.
                </TableHead>
                <TableHead className="text-center hidden lg:table-cell">
                  Сати
                </TableHead>
                <TableHead className="text-center">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.employeeId}>
                  <TableCell>
                    <EmployeeChip employeeId={r.employeeId} size="md" />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {r.totalOrders}
                  </TableCell>
                  <TableCell className="text-center text-emerald-600 hidden sm:table-cell">
                    {r.completedOrders}
                  </TableCell>
                  <TableCell className="text-center text-amber-600 hidden sm:table-cell">
                    {r.inProgressOrders}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {r.overdueOrders > 0 ? (
                      <span className="text-rose-600 font-medium">
                        {r.overdueOrders}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">
                    {r.totalHours}h
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Progress
                        value={r.completionRate}
                        className="h-1.5 w-12"
                      />
                      <span className="text-xs font-medium">
                        {r.completionRate}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function PriorityReportPanel({
  reports,
}: {
  reports: PriorityReport[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Преглед по приоритету
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((r) => {
            const cfg = PRIORITY_CONFIG[r.priority];
            const pct =
              r.count > 0 ? Math.round((r.completed / r.count) * 100) : 0;
            return (
              <div key={r.priority} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <PriorityBadge priority={r.priority} />
                  <span className="text-sm text-muted-foreground">
                    {r.completed}/{r.count} завршено
                  </span>
                </div>
                <Progress value={pct} className="h-2 mb-1" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% стопа завршетка</span>
                  {r.overdue > 0 && (
                    <span className="text-rose-600">
                      {r.overdue} прекорачених
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
