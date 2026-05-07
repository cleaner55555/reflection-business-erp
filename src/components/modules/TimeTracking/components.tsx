"use client";

import { useState } from "react";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Calendar,
  FolderOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Briefcase,
  FileText,
  TrendingUp,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  TimerState,
  TimeEntry,
  DashboardStats,
  ActivityLogEntry,
  ProjectInfo,
  TaskInfo,
  EmployeeInfo,
  EntryStatus,
  ActivityAction,
} from "./types";
  formatDuration,
  formatElapsed,
  STATUS_LABELS,
  STATUS_COLORS,
  ACTIVITY_ACTION_LABELS,
  getDayOfWeek,
} from "./data";

// ============ ACTIVE TIMER COMPONENT ============

interface ActiveTimerProps {
  timer: TimerState;
  projects: ProjectInfo[];
  tasks: TaskInfo[];
  employees: EmployeeInfo[];
  onProjectChange: (projectId: string) => void;
  onTaskChange: (taskId: string) => void;
  onDescriptionChange: (desc: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function ActiveTimer({
  timer,
  projects,
  tasks,
  onProjectChange,
  onTaskChange,
  onDescriptionChange,
  onEmployeeChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: ActiveTimerProps) {
  const filteredTasks = tasks.filter((t) => t.projectId === timer.projectId);
  const isIdle = timer.status === "idle";
  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";
  const canStart = timer.projectId && timer.taskId;

  return (
    <Card
      className={`border-2 transition-all ${isRunning ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : isPaused ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-border"}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" />
            Активни тајмер
          </CardTitle>
          {isRunning && (
            <Badge className="bg-emerald-500 text-white animate-pulse">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-white" />
              Активан
            </Badge>
          )}
          {isPaused && (
            <Badge className="bg-amber-500 text-white">Паузиран</Badge>
          )}
          {isIdle && <Badge variant="secondary">Приправан</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Timer Display */}
        <div className="text-center">
          <div
            className={`text-5xl font-mono font-bold tracking-wider ${isRunning ? "text-emerald-600 dark:text-emerald-400" : isPaused ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
          >
            {timer.status === "idle"
              ? "00:00:00"
              : formatElapsed(timer.elapsed)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isIdle && "Изаберите пројекат и задатак да почнете"}
            {isRunning && "Меримо ваше време..."}
            {isPaused && "Тајмер је паузиран"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isIdle && (
            <Button
              size="lg"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canStart}
              onClick={onStart}
            >
              <Play className="h-5 w-5" />
              Покрени
            </Button>
          )}
          {isRunning && (
            <>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={onPause}
              >
                <Pause className="h-5 w-5" />
                Паузирај
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={onStop}
              >
                <Square className="h-5 w-5" />
                Заустави
              </Button>
            </>
          )}
          {isPaused && (
            <>
              <Button
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={onResume}
              >
                <Play className="h-5 w-5" />
                Настави
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={onReset}
              >
                <RotateCcw className="h-5 w-5" />
                Поништи
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={onStop}
              >
                <Square className="h-5 w-5" />
                Заустави
              </Button>
            </>
          )}
        </div>

        {/* Project / Task / Employee selectors */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5" /> Зaposlen
            </Label>
            <Select
              value={timer.entryId || ""}
              onValueChange={onEmployeeChange}
              disabled={isRunning || isPaused}
            >
              <SelectTrigger>
                <SelectValue placeholder="Изаберите..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Briefcase className="h-3.5 w-3.5" /> Пројекат
            </Label>
            <Select
              value={timer.projectId}
              onValueChange={onProjectChange}
              disabled={isRunning || isPaused}
            >
              <SelectTrigger>
                <SelectValue placeholder="Изаберите пројекат..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: proj.color }}
                      />
                      {proj.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <FileText className="h-3.5 w-3.5" /> Задатак
            </Label>
            <Select
              value={timer.taskId}
              onValueChange={onTaskChange}
              disabled={isRunning || isPaused || !timer.projectId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    timer.projectId
                      ? "Изаберите задатак..."
                      : "Прво изаберите пројекат"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Опис</Label>
            <Input
              placeholder="Кратак опис рада..."
              value={timer.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isRunning}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ DASHBOARD STATS CARDS ============

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Данас",
      value: `${stats.todayHours}ч`,
      sub: `${stats.todayEntries} уноса`,
      icon: Clock,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Ова недеља",
      value: `${stats.weekHours}ч / ${stats.weekTarget}ч`,
      sub: `${stats.weekProgress}%`,
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Овог месеца",
      value: `${stats.monthHours}ч`,
      sub: "укупно",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Активни пројекти",
      value: stats.activeProjects.toString(),
      sub: stats.runningTimer ? "🟢 Тајмер активан" : "⚪ Тајмер неактиван",
      icon: FolderOpen,
      color: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            {card.label === "Ова недеља" && (
              <Progress value={stats.weekProgress} className="mt-2 h-1.5" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============ TIME ENTRIES TABLE ============

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  projects: ProjectInfo[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: EntryStatus) => void;
}

export function TimeEntriesTable({
  entries,
  projects,
  onEdit,
  onDelete,
  onStatusChange,
}: TimeEntriesTableProps) {
  const getProjectColor = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.color || "#666";

  return (
    <Card>
      <CardContent className="p-0">
        <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Датум</TableHead>
                <TableHead>Запослени</TableHead>
                <TableHead>Пројекат</TableHead>
                <TableHead className="hidden md:table-cell">Задатак</TableHead>
                <TableHead className="hidden lg:table-cell">Опис</TableHead>
                <TableHead className="text-center">Почетак</TableHead>
                <TableHead className="text-center">Крај</TableHead>
                <TableHead className="text-center">Трајање</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Акције</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Нема уноса за изабрани период
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      {format(new Date(entry.date), "dd.MM", { locale: sr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {entry.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium">
                          {entry.employeeName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: getProjectColor(entry.projectId),
                          }}
                        />
                        <span className="text-sm">{entry.projectName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[150px] truncate">
                      {entry.taskTitle}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {entry.description || "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {entry.startTime}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {entry.endTime}
                    </TableCell>
                    <TableCell className="text-center font-medium text-sm">
                      {formatDuration(entry.duration)}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <select
                              value={entry.status}
                              onChange={(e) =>
                                onStatusChange(
                                  entry.id,
                                  e.target.value as EntryStatus,
                                )
                              }
                              className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${STATUS_COLORS[entry.status]}`}
                            >
                              <option value="draft">Нацрт</option>
                              <option value="submitted">Предат</option>
                              <option value="approved">Одобрен</option>
                              <option value="rejected">Одбијен</option>
                            </select>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Промени статус</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(entry)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(entry.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ ENTRY FORM DIALOG ============

interface EntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: TimeEntry | null;
  projects: ProjectInfo[];
  tasks: TaskInfo[];
  employees: EmployeeInfo[];
  onSubmit: (data: {
    employeeId: string;
    projectId: string;
    taskId: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}

export function EntryFormDialog({
  open,
  onOpenChange,
  editingEntry,
  projects,
  tasks,
  employees,
  onSubmit,
}: EntryFormDialogProps) {
  const [form, setForm] = useState({
    employeeId: "",
    projectId: "",
    taskId: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Reset form when dialog opens
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && editingEntry) {
      setForm({
        employeeId: editingEntry.employeeId,
        projectId: editingEntry.projectId,
        taskId: "",
        description: editingEntry.description,
        date: editingEntry.date,
        startTime: editingEntry.startTime,
        endTime: editingEntry.endTime,
      });
    } else if (isOpen) {
      setForm({
        employeeId: "",
        projectId: "",
        taskId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        endTime: "09:00",
      });
    }
    onOpenChange(isOpen);
  };

  const filteredTasks = tasks.filter((t) => t.projectId === form.projectId);

  const handleSubmit = () => {
    if (!form.employeeId || !form.projectId || !form.taskId || !form.date)
      return;
    onSubmit(form);
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Ажурирај унос" : "Нови унос времена"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Запослени *</Label>
            <Select
              value={form.employeeId}
              onValueChange={(v) => setForm({ ...form, employeeId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Изаберите запосленог..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Пројекат *</Label>
            <Select
              value={form.projectId}
              onValueChange={(v) =>
                setForm({ ...form, projectId: v, taskId: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Изаберите пројекат..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: proj.color }}
                      />
                      {proj.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Задатак *</Label>
            <Select
              value={form.taskId}
              onValueChange={(v) => setForm({ ...form, taskId: v })}
              disabled={!form.projectId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    form.projectId
                      ? "Изаберите задатак..."
                      : "Прво изаберите пројекат"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Датум *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Почетак *</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Крај *</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Опис</Label>
            <Textarea
              placeholder="Опишите шта сте радили..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            Откажи
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.employeeId || !form.projectId || !form.taskId}
          >
            {editingEntry ? "Ажурирај" : "Сачувај"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ACTIVITY LOG COMPONENT ============

interface ActivityLogProps {
  activities: ActivityLogEntry[];
}

const ACTION_ICONS: Record<ActivityAction, typeof Play> = {
  timer_started: Play,
  timer_stopped: Square,
  timer_paused: Pause,
  timer_resumed: RotateCcw,
  entry_created: FileText,
  entry_updated: FileText,
  entry_deleted: XCircle,
  entry_submitted: CheckCircle2,
  entry_approved: CheckCircle2,
  entry_rejected: XCircle,
};

const ACTION_COLORS: Record<ActivityAction, string> = {
  timer_started:
    "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
  timer_stopped: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
  timer_paused:
    "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  timer_resumed: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  entry_created:
    "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400",
  entry_updated: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950 dark:text-cyan-400",
  entry_deleted: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
  entry_submitted:
    "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  entry_approved:
    "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
  entry_rejected: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
};

export function ActivityLog({ activities }: ActivityLogProps) {
  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    if (diffMin < 1) return "Управо сада";
    if (diffMin < 60) return `Пре ${diffMin} мин`;
    if (diffH < 24) return `Пре ${diffH}ч ${diffMin % 60}м`;
    return format(d, "dd.MM.yyyy HH:mm", { locale: sr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Дневник активности
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[480px] overflow-y-auto space-y-1">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нема активности
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = ACTION_ICONS[activity.action] || FileText;
              const colorClass =
                ACTION_COLORS[activity.action] || "text-gray-600 bg-gray-50";
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {activity.employeeName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ACTIVITY_ACTION_LABELS[activity.action]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ REPORT TABLE: BY PROJECT ============

interface ProjectReportTableProps {
  data: {
    projectId: string;
    projectName: string;
    projectColor: string;
    totalHours: number;
    totalEntries: number;
    avgHoursPerEntry: number;
  }[];
}

export function ProjectReportTable({ data }: ProjectReportTableProps) {
  const totalHours = data.reduce((s, r) => s + r.totalHours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Извештај по пројектима</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пројекат</TableHead>
                <TableHead className="text-center">Уноса</TableHead>
                <TableHead className="text-center">Укупно сати</TableHead>
                <TableHead className="text-center">Просек/унос</TableHead>
                <TableHead className="text-center">Удео</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.projectId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: row.projectColor }}
                      />
                      <span className="font-medium text-sm">
                        {row.projectName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.totalEntries}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {row.totalHours}ч
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {row.avgHoursPerEntry}ч
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress
                        value={
                          totalHours > 0
                            ? (row.totalHours / totalHours) * 100
                            : 0
                        }
                        className="h-2 w-16"
                      />
                      <span className="text-xs text-muted-foreground">
                        {totalHours > 0
                          ? Math.round((row.totalHours / totalHours) * 100)
                          : 0}
                        %
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

// ============ REPORT TABLE: BY EMPLOYEE ============

interface EmployeeReportTableProps {
  data: {
    employeeId: string;
    employeeName: string;
    totalHours: number;
    totalEntries: number;
    avgDailyHours: number;
    activeDays: number;
  }[];
}

export function EmployeeReportTable({ data }: EmployeeReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Извештај по запосленима</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Запослени</TableHead>
                <TableHead className="text-center">Активних дана</TableHead>
                <TableHead className="text-center">Уноса</TableHead>
                <TableHead className="text-center">Укупно сати</TableHead>
                <TableHead className="text-center">Просек/дан</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {row.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-sm">
                        {row.employeeName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.activeDays}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.totalEntries}
                  </TableCell>
                  <TableCell className="text-center font-mono font-medium">
                    {row.totalHours}ч
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {row.avgDailyHours}ч
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

// ============ REPORT TABLE: WEEKLY SUMMARY ============

interface WeeklySummaryTableProps {
  data: {
    day: string;
    dayLabel: string;
    totalHours: number;
    totalEntries: number;
    projectBreakdown: { projectName: string; hours: number }[];
  }[];
}

export function WeeklySummaryTable({ data }: WeeklySummaryTableProps) {
  const maxHours = Math.max(...data.map((d) => d.totalHours), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Недељни преглед</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дан</TableHead>
              <TableHead className="text-center">Уноса</TableHead>
              <TableHead className="text-center">Сати</TableHead>
              <TableHead className="w-[200px]">Расподела</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.day}>
                <TableCell>
                  <span className="font-medium text-sm">
                    {getDayOfWeek(row.day)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground font-mono">
                    {row.day}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {row.totalEntries}
                </TableCell>
                <TableCell className="text-center font-mono font-medium">
                  {row.totalHours}ч
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {row.projectBreakdown.slice(0, 3).map((pb) => (
                      <div
                        key={pb.projectName}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[10px] text-muted-foreground truncate w-[80px]">
                          {pb.projectName}
                        </span>
                        <Progress
                          value={(pb.hours / maxHours) * 100}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-[10px] font-mono w-[30px] text-right">
                          {pb.hours}ч
                        </span>
                      </div>
                    ))}
                    {row.projectBreakdown.length === 0 && (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============ REPORT SUMMARY CARDS ============

interface ReportSummaryCardsProps {
  summary: {
    totalHours: number;
    totalEntries: number;
    avgHoursPerDay: number;
    mostActiveProject: string;
    mostActiveEmployee: string;
    overtimeHours: number;
  };
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Укупно сати</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalHours}ч</div>
          <p className="text-xs text-muted-foreground">
            {summary.totalEntries} уноса
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Просек по дану</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.avgHoursPerDay}ч</div>
          <p className="text-xs text-muted-foreground">по активном дану</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Прековремени</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${summary.overtimeHours > 0 ? "text-amber-600" : ""}`}
          >
            {summary.overtimeHours}ч
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.overtimeHours > 0 ? "изнад 8ч/дан" : "нема прековремених"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Најактивнији</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold truncate">
            {summary.mostActiveEmployee}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {summary.mostActiveProject}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ SETTINGS PANEL ============

interface SettingsPanelProps {
  settings: {
    defaultProjectId: string;
    roundToMinutes: number;
    allowOvertime: boolean;
    maxHoursPerDay: number;
    requireDescription: boolean;
    autoStopTimer: boolean;
    weeklyTargetHours: number;
    notifyBeforeEnd: boolean;
    notifyMinutesBefore: number;
    enableApproval: boolean;
  };
  projects: ProjectInfo[];
  onSettingsChange: (
    settings: typeof SettingsPanelProps extends { settings: infer S }
      ? S
      : never,
  ) => void;
}

export function SettingsPanel({
  settings,
  projects,
  onSettingsChange,
}: SettingsPanelProps) {
  const update = (key: string, value: string | number | boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Општа подешавања</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Подразумевани пројекат</Label>
            <Select
              value={settings.defaultProjectId}
              onValueChange={(v) => update("defaultProjectId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Није изабран" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Заокружи на (минуте)</Label>
            <Select
              value={String(settings.roundToMinutes)}
              onValueChange={(v) => update("roundToMinutes", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 минут</SelectItem>
                <SelectItem value="5">5 минута</SelectItem>
                <SelectItem value="15">15 минута</SelectItem>
                <SelectItem value="30">30 минута</SelectItem>
                <SelectItem value="60">60 минута</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Недељни циљ (сати)</Label>
            <Input
              type="number"
              min={1}
              max={80}
              value={settings.weeklyTargetHours}
              onChange={(e) =>
                update("weeklyTargetHours", Number(e.target.value))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Максимално сати/дан</Label>
            <Input
              type="number"
              min={1}
              max={24}
              value={settings.maxHoursPerDay}
              onChange={(e) => update("maxHoursPerDay", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toggle Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Правила и обавештења</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "allowOvertime",
              label: "Дозволи прековремени рад",
              desc: "Запослени могу бележити више од максимума",
            },
            {
              key: "requireDescription",
              label: "Обавезан опис",
              desc: "Опис рада је обавезан при креирању уноса",
            },
            {
              key: "autoStopTimer",
              label: "Аутоматски заустави тајмер",
              desc: "Заустави тајмер након 12 сати",
            },
            {
              key: "enableApproval",
              label: "Процес одобравања",
              desc: "Уноси морају бити одобрени од стране менаџера",
            },
            {
              key: "notifyBeforeEnd",
              label: "Обавештење пре краја",
              desc: "Обавести запосленог пре завршетка радног времена",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={
                  settings[item.key as keyof typeof settings] as boolean
                }
                onClick={() =>
                  update(
                    item.key,
                    !(settings[item.key as keyof typeof settings] as boolean),
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  settings[item.key as keyof typeof settings]
                    ? "bg-primary"
                    : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-primary-foreground shadow-lg ring-0 transition-transform ${
                    settings[item.key as keyof typeof settings]
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}

          {settings.notifyBeforeEnd && (
            <div className="grid gap-2 ml-4">
              <Label>Обавести пре (минута)</Label>
              <Input
                type="number"
                min={5}
                max={60}
                value={settings.notifyMinutesBefore}
                onChange={(e) =>
                  update("notifyMinutesBefore", Number(e.target.value))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ REPORT FILTER BAR ============

interface ReportFilterBarProps {
  dateFrom: string;
  dateTo: string;
  projectId: string;
  employeeId: string;
  projects: ProjectInfo[];
  employees: EmployeeInfo[];
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onProjectChange: (val: string) => void;
  onEmployeeChange: (val: string) => void;
}

export function ReportFilterBar({
  dateFrom,
  dateTo,
  projectId,
  employeeId,
  projects,
  employees,
  onDateFromChange,
  onDateToChange,
  onProjectChange,
  onEmployeeChange,
}: ReportFilterBarProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="grid gap-1.5">
            <Label className="text-xs">Од датума</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">До датума</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Пројекат</Label>
            <Select value={projectId} onValueChange={onProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Сви пројекти" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Сви пројекти</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Запослени</Label>
            <Select value={employeeId} onValueChange={onEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Сви запослени" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Сви запослени</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
