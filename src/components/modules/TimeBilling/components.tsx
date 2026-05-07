// ============================================================
// TimeBilling Module – Sub-Components (all tabs)
// ============================================================
"use client";

import React, { useState, useMemo, useCallback } from "react";
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
  Clock,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  Edit3,
  MoreHorizontal,
  FileBarChart,
  FilePlus2,
  Receipt,
  Settings2,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
  Download,
  Mail,
  Copy,
  CreditCard,
  BadgeCheck,
  Info,
  ChevronDown,
  CircleDollarSign,
  Timer,
  BarChart3,
  PieChart,
} from "lucide-react";

import type {
  TimeEntry,
  Invoice,
  Client,
  Project,
  Employee,
  TimeBillingSettings,
  BillingStatus,
  InvoiceStatus,
  PaymentTerms,
  RevenueByClient,
  RevenueByProject,
  RevenueByEmployee,
  MonthlySummary,
} from "./types";
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PAYMENT_TERMS_LABELS,
} from "./types";
  formatRSD,
  formatHours,
  formatDate,
  calculateRevenueByClient,
  calculateRevenueByProject,
  calculateRevenueByEmployee,
  calculateMonthlySummary,
} from "./data";

// ============================================================
// STAT CARDS (top-level KPI cards for Satnice tab)
// ============================================================

interface StatsCardsProps {
  stats: {
    totalEntries: number;
    totalHours: number;
    unbilledCount: number;
    unbilledHours: number;
    unbilledValue: number;
    invoicedTotal: number;
    paidTotal: number;
    overdueTotal: number;
    invoiceCount: number;
  } | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Укупно сати",
      value: formatHours(stats.totalHours),
      sub: `${stats.totalEntries} ставки`,
      icon: Timer,
      color: "text-foreground",
    },
    {
      title: "Нефактурисано",
      value: formatRSD(stats.unbilledValue),
      sub: `${stats.unbilledCount} ставки / ${formatHours(stats.unbilledHours)} ч`,
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      title: "Укупно факturисано",
      value: formatRSD(stats.invoicedTotal),
      sub: `${stats.invoiceCount} фактура`,
      icon: FileText,
      color: "text-emerald-600",
    },
    {
      title: "Закаснело",
      value: formatRSD(stats.overdueTotal),
      sub: stats.overdueTotal > 0 ? "Потребна интервенција" : "Нема закаснелих",
      icon: AlertCircle,
      color: stats.overdueTotal > 0 ? "text-red-600" : "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{c.value}</div>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// SATNICE TAB – Time Entries List + Form
// ============================================================

interface SatniceTabProps {
  entries: TimeEntry[];
  clients: Client[];
  projects: Project[];
  employees: Employee[];
  loading: boolean;
  onAddEntry: (entry: {
    employeeId: string;
    clientId: string;
    projectId: string;
    date: string;
    hours: number;
    rate: number;
    description: string;
  }) => void;
  onDeleteEntry: (id: string) => void;
  onBillEntries: (ids: string[]) => void;
  onUnbillEntries: (ids: string[]) => void;
}

export function SatniceTab({
  entries,
  clients,
  projects,
  employees,
  loading,
  onAddEntry,
  onDeleteEntry,
  onBillEntries,
  onUnbillEntries,
}: SatniceTabProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form state
  const [formEmployee, setFormEmployee] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formHours, setFormHours] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const getClientName = useCallback(
    (id: string) => clients.find((c) => c.id === id)?.name || id,
    [clients],
  );
  const getProjectName = useCallback(
    (id: string) => projects.find((p) => p.id === id)?.name || id,
    [projects],
  );
  const getEmployeeName = useCallback(
    (id: string) => employees.find((e) => e.id === id)?.name || id,
    [employees],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filterStatus !== "all" && e.billingStatus !== filterStatus)
        return false;
      if (filterClient !== "all" && e.clientId !== filterClient) return false;
      if (filterEmployee !== "all" && e.employeeId !== filterEmployee)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          getClientName(e.clientId).toLowerCase().includes(q) ||
          getProjectName(e.projectId).toLowerCase().includes(q) ||
          getEmployeeName(e.employeeId).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    entries,
    filterStatus,
    filterClient,
    filterEmployee,
    search,
    getClientName,
    getProjectName,
    getEmployeeName,
  ]);

  const filteredProjects = useMemo(() => {
    if (!formClient) return projects.filter((p) => p.isBillable);
    return projects.filter((p) => p.clientId === formClient && p.isBillable);
  }, [formClient, projects]);

  const selectedRate = useMemo(() => {
    if (formRate) return parseFloat(formRate) || 0;
    if (formProject) {
      const proj = projects.find((p) => p.id === formProject);
      if (proj) return proj.hourlyRate;
    }
    if (formClient) {
      const client = clients.find((c) => c.id === formClient);
      if (client) return client.defaultRate;
    }
    return 0;
  }, [formRate, formProject, formClient, projects, clients]);

  const handleSubmit = () => {
    if (!formEmployee || !formClient || !formProject || !formDate || !formHours)
      return;
    onAddEntry({
      employeeId: formEmployee,
      clientId: formClient,
      projectId: formProject,
      date: formDate,
      hours: parseFloat(formHours),
      rate: selectedRate,
      description: formDesc,
    });
    setDialogOpen(false);
    setFormEmployee("");
    setFormClient("");
    setFormProject("");
    setFormHours("");
    setFormRate("");
    setFormDesc("");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
    }
  };

  const unbilledSelected = useMemo(
    () =>
      filteredEntries.filter(
        (e) => selectedIds.has(e.id) && e.billingStatus === "unbilled",
      ),
    [filteredEntries, selectedIds],
  );
  const billedSelected = useMemo(
    () =>
      filteredEntries.filter(
        (e) => selectedIds.has(e.id) && e.billingStatus === "billed",
      ),
    [filteredEntries, selectedIds],
  );

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Нова ставка
          </Button>
          {unbilledSelected.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onBillEntries(unbilledSelected.map((e) => e.id));
                setSelectedIds(new Set());
              }}
            >
              <BadgeCheck className="h-4 w-4 mr-1" /> Означи (
              {unbilledSelected.length})
            </Button>
          )}
          {billedSelected.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onUnbillEntries(billedSelected.map((e) => e.id));
                setSelectedIds(new Set());
              }}
            >
              <X className="h-4 w-4 mr-1" /> Поништи ({billedSelected.length})
            </Button>
          )}
          {selectedIds.size > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} изабраних
            </span>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Претрага ставки..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Сви статуси" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сви статуси</SelectItem>
            <SelectItem value="unbilled">Нефактурисано</SelectItem>
            <SelectItem value="billed">Фактурисано</SelectItem>
            <SelectItem value="invoiced">По фактури</SelectItem>
            <SelectItem value="paid">Плаћено</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Сви клијенти" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сви клијенти</SelectItem>
            {clients
              .filter((c) => c.isActive)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Сви запослени" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сви запослени</SelectItem>
            {employees
              .filter((e) => e.isActive)
              .map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={
                        filteredEntries.length > 0 &&
                        selectedIds.size === filteredEntries.length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Датум</TableHead>
                  <TableHead>Запослени</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Клијент
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Пројекат
                  </TableHead>
                  <TableHead className="text-right">Сати</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Цена
                  </TableHead>
                  <TableHead className="text-right">Износ</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Нема ставки за приказ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={selectedIds.has(entry.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedIds.has(entry.id)}
                          onCheckedChange={() => toggleSelect(entry.id)}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {getEmployeeName(entry.employeeId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {getClientName(entry.clientId)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {getProjectName(entry.projectId)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatHours(entry.hours)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-sm">
                        {formatRSD(entry.rate)}/ч
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatRSD(entry.hours * entry.rate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={BILLING_STATUS_COLORS[entry.billingStatus]}
                        >
                          {BILLING_STATUS_LABELS[entry.billingStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {entry.billingStatus === "unbilled" && (
                              <DropdownMenuItem
                                onClick={() => onBillEntries([entry.id])}
                              >
                                <BadgeCheck className="h-4 w-4 mr-2" /> Означи
                                за факturisanje
                              </DropdownMenuItem>
                            )}
                            {entry.billingStatus === "billed" && (
                              <DropdownMenuItem
                                onClick={() => onUnbillEntries([entry.id])}
                              >
                                <X className="h-4 w-4 mr-2" /> Поништи
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteEntry(entry.id)}
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
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Нова временска ставка</DialogTitle>
            <DialogDescription>
              Унесите податке о утрошеном времену
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm">Запослени *</Label>
                <Select value={formEmployee} onValueChange={setFormEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((e) => e.isActive)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm">Датум *</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm">Клијент *</Label>
                <Select
                  value={formClient}
                  onValueChange={(val) => {
                    setFormClient(val);
                    setFormProject("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter((c) => c.isActive)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm">Пројекат *</Label>
                <Select value={formProject} onValueChange={setFormProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm">Сати *</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  placeholder="нпр. 8"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm">Часовна цена (RSD)</Label>
                <Input
                  type="number"
                  placeholder={String(selectedRate)}
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                />
                {selectedRate > 0 && !formRate && (
                  <p className="text-xs text-muted-foreground">
                    Аутоматски: {formatRSD(selectedRate)}/ч
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Опис рада</Label>
              <Textarea
                placeholder="Опишите обављени рад..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Откажи
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formEmployee || !formClient || !formProject || !formHours
              }
            >
              Додај ставку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// FAKTURISANJE TAB – Invoicing
// ============================================================

interface FakturisanjeTabProps {
  entries: TimeEntry[];
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  settings: TimeBillingSettings;
  loading: boolean;
  onGenerateInvoice: (params: {
    entryIds: string[];
    clientId: string;
    issueDate: string;
    paymentTerms: PaymentTerms;
    notes: string;
  }) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
}

export function FakturisanjeTab({
  entries,
  invoices,
  clients,
  projects,
  settings,
  loading,
  onGenerateInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
}: FakturisanjeTabProps) {
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(
    new Set(),
  );
  const [formClientId, setFormClientId] = useState("");
  const [formIssueDate, setFormIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formPaymentTerms, setFormPaymentTerms] = useState<PaymentTerms>(
    settings.paymentTerms,
  );
  const [formNotes, setFormNotes] = useState("");

  const getClientName = useCallback(
    (id: string) => clients.find((c) => c.id === id)?.name || id,
    [clients],
  );
  const getProjectName = useCallback(
    (id: string) => projects.find((p) => p.id === id)?.name || "",
    [projects],
  );

  // Unbilled entries (for generating new invoice)
  const unbilledEntries = useMemo(() => {
    let list = entries.filter((e) => e.billingStatus === "unbilled");
    if (formClientId) list = list.filter((e) => e.clientId === formClientId);
    return list;
  }, [entries, formClientId]);

  const groupedByClient = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const entry of unbilledEntries) {
      const list = map.get(entry.clientId) || [];
      list.push(entry);
      map.set(entry.clientId, list);
    }
    return Array.from(map.entries())
      .map(([clientId, items]) => ({
        clientId,
        clientName: getClientName(clientId),
        entries: items,
        totalHours: items.reduce((s, e) => s + e.hours, 0),
        totalValue: items.reduce((s, e) => s + e.hours * e.rate, 0),
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [unbilledEntries, getClientName]);

  const handleSelectEntry = (id: string) => {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (clientId: string) => {
    const clientEntries = unbilledEntries.filter(
      (e) => e.clientId === clientId,
    );
    const allSelected = clientEntries.every((e) => selectedEntryIds.has(e.id));
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      for (const e of clientEntries) {
        if (allSelected) next.delete(e.id);
        else next.add(e.id);
      }
      return next;
    });
  };

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedEntryIds.has(e.id)),
    [entries, selectedEntryIds],
  );

  const selectedTotal = useMemo(
    () => selectedEntries.reduce((s, e) => s + e.hours * e.rate, 0),
    [selectedEntries],
  );

  const handleGenerate = () => {
    if (selectedEntries.length === 0 || !formClientId) return;
    onGenerateInvoice({
      entryIds: selectedEntries.map((e) => e.id),
      clientId: formClientId,
      issueDate: formIssueDate,
      paymentTerms: formPaymentTerms,
      notes: formNotes,
    });
    setDialogOpen(false);
    setSelectedEntryIds(new Set());
    setFormNotes("");
  };

  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === "all") return invoices;
    return invoices.filter((i) => i.status === invoiceFilter);
  }, [invoices, invoiceFilter]);

  return (
    <div className="space-y-6">
      {/* Unbilled Time - Grouped by Client */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Нефактурисано време
              </CardTitle>
              <CardDescription>
                {unbilledEntries.length} ставки ·{" "}
                {formatRSD(
                  unbilledEntries.reduce((s, e) => s + e.hours * e.rate, 0),
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Сви клијенти" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви клијенти</SelectItem>
                  {clients
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={selectedEntries.length === 0}
                onClick={() => setDialogOpen(true)}
              >
                <FilePlus2 className="h-4 w-4 mr-1" />
                Генериши фактуру ({selectedEntries.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {groupedByClient.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Све време је факturисано
              </p>
            ) : (
              groupedByClient.map((group) => {
                const allSelected = group.entries.every((e) =>
                  selectedEntryIds.has(e.id),
                );
                return (
                  <div key={group.clientId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() =>
                            handleSelectAll(group.clientId)
                          }
                        />
                        <span className="font-medium text-sm">
                          {group.clientName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatHours(group.totalHours)} ч ·{" "}
                        {formatRSD(group.totalValue)}
                      </div>
                    </div>
                    <div className="ml-6 space-y-1">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedEntryIds.has(entry.id)}
                              onCheckedChange={() =>
                                handleSelectEntry(entry.id)
                              }
                            />
                            <span className="text-muted-foreground">
                              {formatDate(entry.date)}
                            </span>
                            <span className="hidden sm:inline">
                              {getProjectName(entry.projectId)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span>{formatHours(entry.hours)} ч</span>
                            <span className="font-medium">
                              {formatRSD(entry.hours * entry.rate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Invoices */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Фактуре
            </CardTitle>
            <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Све фактуре" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Све фактуре</SelectItem>
                <SelectItem value="draft">Припрема</SelectItem>
                <SelectItem value="sent">Послата</SelectItem>
                <SelectItem value="paid">Плаћена</SelectItem>
                <SelectItem value="overdue">Закаснела</SelectItem>
                <SelectItem value="cancelled">Отказана</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[360px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Број фактуре</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Клијент
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Датум</TableHead>
                  <TableHead className="text-right">Износ (RSD)</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">
                    ПДВ
                  </TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Нема фактура
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-sm">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {getClientName(inv.clientId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDate(inv.issueDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatRSD(inv.total)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-sm text-muted-foreground">
                        {formatRSD(inv.pdvAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={INVOICE_STATUS_COLORS[inv.status]}
                        >
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDetailInvoice(inv)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Преглед
                            </DropdownMenuItem>
                            {inv.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onUpdateInvoiceStatus(inv.id, "sent")
                                }
                              >
                                <Send className="h-4 w-4 mr-2" /> Пошаљи
                              </DropdownMenuItem>
                            )}
                            {inv.status === "sent" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onUpdateInvoiceStatus(inv.id, "paid")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Плати
                              </DropdownMenuItem>
                            )}
                            {inv.status !== "cancelled" &&
                              inv.status !== "paid" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onUpdateInvoiceStatus(inv.id, "cancelled")
                                  }
                                >
                                  <X className="h-4 w-4 mr-2" /> Откажи
                                </DropdownMenuItem>
                              )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteInvoice(inv.id)}
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
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Генерисање фактуре</DialogTitle>
            <DialogDescription>
              {selectedEntries.length} ставки · Укупно:{" "}
              {formatRSD(selectedTotal)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="border rounded-lg p-3 bg-muted/30 max-h-[160px] overflow-y-auto">
              {selectedEntries.map((e) => (
                <div key={e.id} className="flex justify-between text-xs py-0.5">
                  <span>
                    {formatDate(e.date)} – {getProjectName(e.projectId)}
                  </span>
                  <span className="font-medium">
                    {formatRSD(e.hours * e.rate)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm">Клијент</Label>
                <Input value={getClientName(formClientId)} disabled />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm">Датум издавања</Label>
                <Input
                  type="date"
                  value={formIssueDate}
                  onChange={(e) => setFormIssueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Услов плаћања</Label>
              <Select
                value={formPaymentTerms}
                onValueChange={(v) => setFormPaymentTerms(v as PaymentTerms)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net15">15 дана</SelectItem>
                  <SelectItem value="net30">30 дана</SelectItem>
                  <SelectItem value="net45">45 дана</SelectItem>
                  <SelectItem value="net60">60 дана</SelectItem>
                  <SelectItem value="on_receipt">По пријему</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Напомена</Label>
              <Textarea
                placeholder="Optional..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Откажи
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={selectedEntries.length === 0}
            >
              <FilePlus2 className="h-4 w-4 mr-1" /> Генериши фактуру
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={!!detailInvoice}
        onOpenChange={() => setDetailInvoice(null)}
      >
        <DialogContent className="max-w-xl">
          {detailInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>{detailInvoice.invoiceNumber}</DialogTitle>
                <DialogDescription>
                  {getClientName(detailInvoice.clientId)} ·{" "}
                  {formatDate(detailInvoice.issueDate)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Рок плаћања:</span>
                  <span>{formatDate(detailInvoice.dueDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Услов плаћања:</span>
                  <span>
                    {PAYMENT_TERMS_LABELS[detailInvoice.paymentTerms]}
                  </span>
                </div>
                <Separator />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Опис</TableHead>
                      <TableHead className="text-right">Сати</TableHead>
                      <TableHead className="text-right">Износ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatHours(item.hours)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatRSD(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Укупно без ПДВ:</span>
                    <span>{formatRSD(detailInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ПДВ ({detailInvoice.pdvRate}%):</span>
                    <span>{formatRSD(detailInvoice.pdvAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Укупно:</span>
                    <span>{formatRSD(detailInvoice.total)}</span>
                  </div>
                </div>
                {detailInvoice.notes && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Напомена: </span>
                      {detailInvoice.notes}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// IZVEŠTAJI TAB – Reports
// ============================================================

interface IzvestajiTabProps {
  entries: TimeEntry[];
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  employees: Employee[];
  settings: TimeBillingSettings;
  loading: boolean;
}

export function IzvestajiTab({
  entries,
  invoices,
  clients,
  projects,
  employees,
  settings,
  loading,
}: IzvestajiTabProps) {
  const [activeReport, setActiveReport] = useState<
    "client" | "project" | "employee" | "monthly"
  >("client");

  const getClientName = useCallback(
    (id: string) => clients.find((c) => c.id === id)?.name || id,
    [clients],
  );

  const reportClient = useMemo(
    () => calculateRevenueByClient(entries, clients, settings.pdvRate),
    [entries, clients, settings.pdvRate],
  );

  const reportProject = useMemo(
    () =>
      calculateRevenueByProject(entries, projects, clients, settings.pdvRate),
    [entries, projects, clients, settings.pdvRate],
  );

  const reportEmployee = useMemo(
    () => calculateRevenueByEmployee(entries, employees),
    [entries, employees],
  );

  const reportMonthly = useMemo(
    () => calculateMonthlySummary(entries, invoices),
    [entries, invoices],
  );

  const totalRevenue = useMemo(
    () => entries.reduce((s, e) => s + e.hours * e.rate, 0),
    [entries],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "client" as const, label: "По клијенту", icon: Users },
          { key: "project" as const, label: "По пројекту", icon: Briefcase },
          { key: "employee" as const, label: "По запосленом", icon: Users },
          { key: "monthly" as const, label: "Месечни преглед", icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeReport === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveReport(key)}
          >
            <Icon className="h-4 w-4 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* Revenue by Client */}
      {activeReport === "client" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Приходи по клијенту
            </CardTitle>
            <CardDescription>Укупни приходи без ПДВ-а</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клијент</TableHead>
                    <TableHead className="text-right">Сати</TableHead>
                    <TableHead className="text-right">Приход (RSD)</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      ПДВ
                    </TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      Фактуре
                    </TableHead>
                    <TableHead className="text-right">% укупно</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportClient.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нема података
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportClient.map((r) => (
                      <TableRow key={r.clientId}>
                        <TableCell className="font-medium text-sm">
                          {r.clientName}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatHours(r.totalHours)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatRSD(r.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">
                          {formatRSD(r.totalPDV)}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm">
                          {r.invoiceCount}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {totalRevenue > 0
                            ? ((r.totalRevenue / totalRevenue) * 100).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {reportClient.length > 0 && (
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell className="text-sm">УКУПНО</TableCell>
                      <TableCell className="text-right text-sm">
                        {formatHours(
                          reportClient.reduce((s, r) => s + r.totalHours, 0),
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatRSD(
                          reportClient.reduce((s, r) => s + r.totalRevenue, 0),
                        )}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-sm">
                        {formatRSD(
                          reportClient.reduce((s, r) => s + r.totalPDV, 0),
                        )}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-sm">
                        {reportClient.reduce((s, r) => s + r.invoiceCount, 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm">100%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Project */}
      {activeReport === "project" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Приходи по пројекту
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пројекат</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Клијент
                    </TableHead>
                    <TableHead className="text-right">Сати</TableHead>
                    <TableHead className="text-right">Приход (RSD)</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      ПДВ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportProject.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нема података
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportProject.map((r) => (
                      <TableRow key={r.projectId}>
                        <TableCell className="font-medium text-sm">
                          {r.projectName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {r.clientName}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatHours(r.totalHours)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatRSD(r.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm text-muted-foreground">
                          {formatRSD(r.totalPDV)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Employee */}
      {activeReport === "employee" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Приходи по запосленом
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Запослени</TableHead>
                    <TableHead className="text-right">Укупно сати</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Фактурисано ч
                    </TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Нефактурисано ч
                    </TableHead>
                    <TableHead className="text-right">Приход (RSD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportEmployee.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нема података
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportEmployee.map((r) => (
                      <TableRow key={r.employeeId}>
                        <TableCell className="font-medium text-sm">
                          {r.employeeName}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatHours(r.totalHours)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-sm text-green-600">
                          {formatHours(r.billableHours)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-sm text-amber-600">
                          {formatHours(r.nonBillableHours)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatRSD(r.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      {activeReport === "monthly" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Месечни преглед
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Месец</TableHead>
                    <TableHead className="text-right">Сати</TableHead>
                    <TableHead className="text-right">Приход (RSD)</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Фактуре
                    </TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      Плаћено
                    </TableHead>
                    <TableHead className="text-right hidden lg:table-cell">
                      Дугује
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMonthly.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нема података
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportMonthly.map((r) => (
                      <TableRow key={r.month}>
                        <TableCell className="font-medium text-sm">
                          {r.label}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatHours(r.totalHours)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatRSD(r.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-sm">
                          {r.invoiceCount}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell text-sm text-green-600">
                          {formatRSD(r.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell text-sm text-red-600">
                          {formatRSD(r.outstandingAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// PODEŠAVANJA TAB – Settings
// ============================================================

interface PodesavanjaTabProps {
  settings: TimeBillingSettings;
  loading: boolean;
  onSave: (settings: TimeBillingSettings) => void;
}

export function PodesavanjaTab({
  settings,
  loading,
  onSave,
}: PodesavanjaTabProps) {
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Општа подешавања
          </CardTitle>
          <CardDescription>
            Подешавања за модул евиденције и факturisanja времена
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Hourly Rate */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Подразумевана часовна цена (RSD/ч)
            </Label>
            <Input
              type="number"
              value={form.defaultHourlyRate}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaultHourlyRate: parseInt(e.target.value) || 0,
                })
              }
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Ова вредност се користи као подразумевана када се креира нова
              ставка
            </p>
          </div>

          {/* PDV Rate */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">ПДВ стопа (%)</Label>
            <Input
              type="number"
              value={form.pdvRate}
              onChange={(e) =>
                setForm({ ...form, pdvRate: parseInt(e.target.value) || 0 })
              }
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Стопа ПДВ-а за израчунавање фактура (обично 20%)
            </p>
          </div>

          {/* Payment Terms */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Подразумевани услов плаћања
            </Label>
            <Select
              value={form.paymentTerms}
              onValueChange={(v) =>
                setForm({ ...form, paymentTerms: v as PaymentTerms })
              }
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net15">15 дана</SelectItem>
                <SelectItem value="net30">30 дана</SelectItem>
                <SelectItem value="net45">45 дана</SelectItem>
                <SelectItem value="net60">60 дана</SelectItem>
                <SelectItem value="on_receipt">По пријему</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Prefix */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Префикс броја фактуре</Label>
            <Input
              value={form.invoicePrefix}
              onChange={(e) =>
                setForm({ ...form, invoicePrefix: e.target.value })
              }
              className="max-w-xs"
              placeholder="нпр. Fakt"
            />
            <p className="text-xs text-muted-foreground">
              Формат: {form.invoicePrefix}-{new Date().getFullYear()}-001
            </p>
          </div>

          {/* Hour Rounding */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Заокруживање сати</Label>
            <Select
              value={form.roundTo}
              onValueChange={(v) =>
                setForm({ ...form, roundTo: v as "none" | "0.5" | "1" })
              }
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без заокруживања</SelectItem>
                <SelectItem value="0.5">На 0,5 сата</SelectItem>
                <SelectItem value="1">На пун сат</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Day Hours */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Радни дан (сати)</Label>
            <Input
              type="number"
              value={form.workDayHours}
              onChange={(e) =>
                setForm({
                  ...form,
                  workDayHours: parseInt(e.target.value) || 8,
                })
              }
              className="max-w-xs"
            />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={!hasChanges}>
              {saved ? (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              ) : (
                <Settings2 className="h-4 w-4 mr-1" />
              )}
              {saved ? "Сачувано!" : "Сачувај подешавања"}
            </Button>
            {hasChanges && (
              <span className="text-xs text-amber-600">
                Имате неизмењене промене
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
