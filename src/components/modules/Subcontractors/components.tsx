"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Building2,
  FileText,
  Truck,
  Wallet,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ChevronDown,
  Filter,
  X,
  Info,
  TrendingUp,
  CalendarDays,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";

import type {
  Subcontractor,
  SubcontractorFormData,
  Contract,
  ContractFormData,
  Delivery,
  DeliveryFormData,
  Payment,
  PaymentFormData,
  SubcontractorStatus,
  ContractStatus,
  DeliveryStatus,
  PaymentStatus,
} from "./types";
import {
  formatRSD,
  formatDatum,
  generateId,
  todayISO,
  subcontractorStatusLabels,
  subcontractorStatusColors,
  contractStatusLabels,
  contractStatusColors,
  deliveryStatusLabels,
  deliveryStatusColors,
  paymentStatusLabels,
  paymentStatusColors,
  paymentMethodLabels,
  unitLabels,
  emptySubcontractorForm,
  emptyContractForm,
  emptyDeliveryForm,
  emptyPaymentForm,
} from "./data";

// ============================================================
// SHARED: Status Badge
// ============================================================

function StatusBadge({
  status,
  labels,
  colors,
}: {
  status: string;
  labels: Record<string, string>;
  colors: Record<string, string>;
}) {
  return (
    <Badge
      className={`${colors[status] || "bg-gray-100 text-gray-800"} border-0 text-xs font-medium`}
    >
      {labels[status] || status}
    </Badge>
  );
}

// ============================================================
// SHARED: Empty State
// ============================================================

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-10 w-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ============================================================
// SHARED: Rating Stars
// ============================================================

function RatingStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          onClick={() => onChange?.(s)}
        >
          <Star
            className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
          />
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TAB 1: PODIZVOĐAČI (Subcontractors)
// ============================================================

interface SubcontractorsTabProps {
  data: Subcontractor[];
  onAdd: (item: SubcontractorFormData) => void;
  onUpdate: (id: string, item: Partial<Subcontractor>) => void;
  onDelete: (id: string) => void;
}

export function SubcontractorsTab({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: SubcontractorsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubcontractorStatus | "sve">(
    "sve",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubcontractorFormData>(
    emptySubcontractorForm,
  );

  const filtered = data.filter((sub) => {
    const matchSearch =
      sub.naziv.toLowerCase().includes(search.toLowerCase()) ||
      sub.pib.includes(search) ||
      sub.mb.includes(search);
    const matchStatus = statusFilter === "sve" || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptySubcontractorForm);
    setDialogOpen(true);
  };

  const openEdit = (sub: Subcontractor) => {
    setEditingId(sub.id);
    setForm({
      naziv: sub.naziv,
      pib: sub.pib,
      mb: sub.mb,
      šifraDelatnosti: sub.šifraDelatnosti,
      pdvObveznik: sub.pdvObveznik,
      adresa: { ...sub.adresa },
      kontakti: sub.kontakti.map((k) => ({ ...k })),
      bankovniRačuni: sub.bankovniRačuni.map((b) => ({ ...b })),
      status: sub.status,
      ocena: sub.ocena,
      napomene: sub.napomene,
    });
    setDialogOpen(true);
  };

  const openView = (sub: Subcontractor) => {
    setViewingId(sub.id);
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!form.naziv || !form.pib || !form.mb) return;
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    setDialogOpen(false);
  };

  const viewing = data.find((s) => s.id === viewingId);

  const stats = {
    ukupno: data.length,
    aktivan: data.filter((d) => d.status === "aktivan").length,
    neaktivan: data.filter((d) => d.status === "neaktivan").length,
    suspendovan: data.filter((d) => d.status === "suspendovan").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Укупно
              </p>
              <p className="text-2xl font-bold mt-1">{stats.ukupno}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Активних
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {stats.aktivan}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Неактивних
              </p>
              <p className="text-2xl font-bold mt-1">{stats.neaktivan}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Суспендованих
              </p>
              <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                {stats.suspendovan}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Списак подизвођаца</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filtered.length} од {data.length} подизвођаца
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-1.5" />
                Додај
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Претрага по називу, ПИБ, МБ..."
                className="pl-8 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as SubcontractorStatus | "sve")
              }
            >
              <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sve">Сви статуси</SelectItem>
                <SelectItem value="aktivan">Активан</SelectItem>
                <SelectItem value="neaktivan">Неактиван</SelectItem>
                <SelectItem value="suspendovan">Суспендован</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Назив</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    ПИБ
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    МБ
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    ПДВ
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Оцена
                  </TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs text-right w-[100px]">
                    Акције
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={Building2}
                        message="Нема подизвођаца за приказ"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sub) => (
                    <TableRow key={sub.id} className="group">
                      <TableCell>
                        <div className="font-medium text-sm">{sub.naziv}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {sub.adresa.grad}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-mono">
                        {sub.pib}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-mono">
                        {sub.mb}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {sub.pdvObveznik ? (
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-400"
                          >
                            Да
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Не
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <RatingStars rating={sub.ocena} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={sub.status}
                          labels={subcontractorStatusLabels}
                          colors={subcontractorStatusColors}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openView(sub)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Преглед</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(sub)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Уреди</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteOpen(sub.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Обриши</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Add/Edit Form */}
      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {editingId ? "Уреди подизвођача" : "Нови подизвођач"}
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Измените податке о подизвођачу"
                    : "Унесите податке за новог подизвођача"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4 py-2">
            {/* Basic info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Назив *</Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Назив firme..."
                  value={form.naziv}
                  onChange={(e) => setForm({ ...form, naziv: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as SubcontractorStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktivan">Активан</SelectItem>
                    <SelectItem value="neaktivan">Неактиван</SelectItem>
                    <SelectItem value="suspendovan">Суспендован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">ПИБ *</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="123456789"
                  maxLength={9}
                  value={form.pib}
                  onChange={(e) => setForm({ ...form, pib: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Матични број *</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="12345678"
                  maxLength={8}
                  value={form.mb}
                  onChange={(e) => setForm({ ...form, mb: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Шифра делатности</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="4311"
                  maxLength={4}
                  value={form.šifraDelatnosti}
                  onChange={(e) =>
                    setForm({ ...form, šifraDelatnosti: e.target.value })
                  }
                />
              </div>
            </div>

            {/* PDV */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.pdvObveznik}
                onCheckedChange={(v) => setForm({ ...form, pdvObveznik: v })}
              />
              <Label className="text-sm">ПДВ обвезник</Label>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Оцена</Label>
              <RatingStars
                rating={form.ocena}
                onChange={(v) => setForm({ ...form, ocena: v })}
              />
            </div>

            <Separator />

            {/* Address */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Адреса
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Улица</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.adresa.ulica}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adresa: { ...form.adresa, ulica: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Број</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.adresa.broj}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adresa: { ...form.adresa, broj: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Општина</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.adresa.opština || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adresa: { ...form.adresa, opština: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Град</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.adresa.grad}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adresa: { ...form.adresa, grad: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Поштански број</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  value={form.adresa.poštanskiBroj}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      adresa: { ...form.adresa, poštanskiBroj: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Контакти
            </p>
            {form.kontakti.map((kontakt, idx) => (
              <div
                key={idx}
                className="grid gap-3 sm:grid-cols-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs">Име</Label>
                  <Input
                    className="h-8 text-sm"
                    value={kontakt.ime}
                    onChange={(e) => {
                      const nk = [...form.kontakti];
                      nk[idx] = { ...nk[idx], ime: e.target.value };
                      setForm({ ...form, kontakti: nk });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Презиме</Label>
                  <Input
                    className="h-8 text-sm"
                    value={kontakt.prezime}
                    onChange={(e) => {
                      const nk = [...form.kontakti];
                      nk[idx] = { ...nk[idx], prezime: e.target.value };
                      setForm({ ...form, kontakti: nk });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Функција</Label>
                  <Input
                    className="h-8 text-sm"
                    value={kontakt.funkcija}
                    onChange={(e) => {
                      const nk = [...form.kontakti];
                      nk[idx] = { ...nk[idx], funkcija: e.target.value };
                      setForm({ ...form, kontakti: nk });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Телефон</Label>
                  <Input
                    className="h-8 text-sm"
                    value={kontakt.telefon}
                    onChange={(e) => {
                      const nk = [...form.kontakti];
                      nk[idx] = { ...nk[idx], telefon: e.target.value };
                      setForm({ ...form, kontakti: nk });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Е-пошта</Label>
                  <Input
                    className="h-8 text-sm"
                    type="email"
                    value={kontakt.email}
                    onChange={(e) => {
                      const nk = [...form.kontakti];
                      nk[idx] = { ...nk[idx], email: e.target.value };
                      setForm({ ...form, kontakti: nk });
                    }}
                  />
                </div>
              </div>
            ))}

            <Separator />

            {/* Bank */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Банковни рачуни
            </p>
            {form.bankovniRačuni.map((bank, idx) => (
              <div
                key={idx}
                className="grid gap-3 sm:grid-cols-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs">Назив банке</Label>
                  <Input
                    className="h-8 text-sm"
                    value={bank.nazivBanke}
                    onChange={(e) => {
                      const nb = [...form.bankovniRačuni];
                      nb[idx] = { ...nb[idx], nazivBanke: e.target.value };
                      setForm({ ...form, bankovniRačuni: nb });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Рачун</Label>
                  <Input
                    className="h-8 text-sm font-mono"
                    value={bank.račun}
                    onChange={(e) => {
                      const nb = [...form.bankovniRačuni];
                      nb[idx] = { ...nb[idx], račun: e.target.value };
                      setForm({ ...form, bankovniRačuni: nb });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Позив на број</Label>
                  <Input
                    className="h-8 text-sm font-mono"
                    value={bank.pozivNaBroj || ""}
                    onChange={(e) => {
                      const nb = [...form.bankovniRačuni];
                      nb[idx] = { ...nb[idx], pozivNaBroj: e.target.value };
                      setForm({ ...form, bankovniRačuni: nb });
                    }}
                  />
                </div>
              </div>
            ))}

            <Separator />

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Напомене</Label>
              <Textarea
                className="text-sm min-h-[60px]"
                value={form.napomene}
                onChange={(e) => setForm({ ...form, napomene: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!form.naziv || !form.pib || !form.mb}
            >
              Сачувај
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Card */}
      {detailOpen && viewing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>
                  {viewing.naziv}
                </CardTitle>
                <StatusBadge
                  status={viewing.status}
                  labels={subcontractorStatusLabels}
                  colors={subcontractorStatusColors}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">ПИБ</p>
                    <p className="text-sm font-mono font-medium">
                      {viewing.pib}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Матични број
                    </p>
                    <p className="text-sm font-mono font-medium">
                      {viewing.mb}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Шифра делатности
                    </p>
                    <p className="text-sm font-mono font-medium">
                      {viewing.šifraDelatnosti}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      ПДВ обвезник
                    </p>
                    <p className="text-sm">
                      {viewing.pdvObveznik ? "Да" : "Не"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Оцена</p>
                    <RatingStars rating={viewing.ocena} />
                  </div>
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Адреса
                </p>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    {viewing.adresa.ulica} {viewing.adresa.broj}
                    {viewing.adresa.opština
                      ? `, ${viewing.adresa.opština}`
                      : ""}
                    , {viewing.adresa.grad} {viewing.adresa.poštanskiBroj}
                  </span>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Контакти
                </p>
                {viewing.kontakti.map((k, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {k.ime} {k.prezime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {k.funkcija}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {k.telefon}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {k.email}
                      </span>
                    </div>
                  </div>
                ))}

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Банковни рачуни
                </p>
                {viewing.bankovniRačuni.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">{b.nazivBanke}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {b.račun}
                      </p>
                    </div>
                    {b.pozivNaBroj && (
                      <p className="ml-auto text-xs text-muted-foreground">
                        Позив: {b.pozivNaBroj}
                      </p>
                    )}
                  </div>
                ))}

                {viewing.napomene && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Напомене</p>
                      <p className="text-sm">{viewing.napomene}</p>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>Датум уноса: {formatDatum(viewing.datumUnosa)}</div>
                  <div>Датум измене: {formatDatum(viewing.datumIzmene)}</div>
                </div>
              </div>
          </CardContent>
        </Card>
      )}
      <AlertDialog
        open={!!deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потврда брисања</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете овог подизвођача? Ова
              акција је неповратна.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteOpen) onDelete(deleteOpen);
                setDeleteOpen(null);
              }}
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// TAB 2: UGOVORI (Contracts)
// ============================================================

interface ContractsTabProps {
  contracts: Contract[];
  subcontractors: Subcontractor[];
  onAdd: (item: ContractFormData) => void;
  onUpdate: (id: string, item: Partial<Contract>) => void;
  onDelete: (id: string) => void;
}

export function ContractsTab({
  contracts,
  subcontractors,
  onAdd,
  onUpdate,
  onDelete,
}: ContractsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "sve">(
    "sve",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [form, setForm] = useState<ContractFormData>(emptyContractForm);

  const filtered = contracts.filter((c) => {
    const sub = subcontractors.find((s) => s.id === c.podizvođačId);
    const matchSearch =
      c.brojUgovora.toLowerCase().includes(search.toLowerCase()) ||
      c.predmetUgovora.toLowerCase().includes(search.toLowerCase()) ||
      (sub?.naziv.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "sve" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getSubName = (id: string) =>
    subcontractors.find((s) => s.id === id)?.naziv || "—";

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyContractForm });
    setDialogOpen(true);
  };

  const openEdit = (c: Contract) => {
    setEditingId(c.id);
    setForm({
      podizvođačId: c.podizvođačId,
      brojUgovora: c.brojUgovora,
      predmetUgovora: c.predmetUgovora,
      opsegRadova: c.opsegRadova,
      vrednost: c.vrednost,
      vrednostNeto: c.vrednostNeto,
      pdvStopa: c.pdvStopa,
      datumPotpisa: c.datumPotpisa,
      datumPočetka: c.datumPočetka,
      datumZavršetka: c.datumZavršetka,
      status: c.status,
      garancijaMeseci: c.garancijaMeseci,
      napomene: c.napomene,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.podizvođačId || !form.brojUgovora || !form.predmetUgovora) return;
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    setDialogOpen(false);
  };

  const totalValue = contracts
    .filter((c) => c.status === "aktivan")
    .reduce((sum, c) => sum + c.vrednost, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Укупно уговора
              </p>
              <p className="text-2xl font-bold mt-1">{contracts.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Активних
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {contracts.filter((c) => c.status === "aktivan").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Вредност (активни)
              </p>
              <p className="text-xl font-bold mt-1">{formatRSD(totalValue)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                На чекању
              </p>
              <p className="text-2xl font-bold mt-1">
                {contracts.filter((c) => c.status === "na_čekanju").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Уговори</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filtered.length} од {contracts.length} уговора
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Нови уговор
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Претрага по броју, предмету..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as ContractStatus | "sve")
              }
            >
              <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sve">Сви статуси</SelectItem>
                <SelectItem value="aktivan">Активан</SelectItem>
                <SelectItem value="istekao">Istekao</SelectItem>
                <SelectItem value="prekinut">Prekinut</SelectItem>
                <SelectItem value="na_čekanju">Na чекању</SelectItem>
                <SelectItem value="u_pripremi">U pripremi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Број</TableHead>
                  <TableHead className="text-xs">Подизвођач</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Предмет
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Вредност
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Период
                  </TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs text-right w-[100px]">
                    Акције
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={FileText}
                        message="Нема уговора за приказ"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="group">
                      <TableCell className="font-mono text-sm font-medium">
                        {c.brojUgovora}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSubName(c.podizvođačId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">
                        {c.predmetUgovora}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">
                        {formatRSD(c.vrednost)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDatum(c.datumPočetka)} —{" "}
                        {formatDatum(c.datumZavršetka)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={c.status}
                          labels={contractStatusLabels}
                          colors={contractStatusColors}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(c)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Уреди</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteOpen(c.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Обриши</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Contract Form Card */}
      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {editingId ? "Уреди уговор" : "Нови уговор"}
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Измените податке уговора"
                    : "Унесите податке за нови уговор"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Подизвођач *</Label>
                <Select
                  value={form.podizvođačId}
                  onValueChange={(v) => setForm({ ...form, podizvođačId: v })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Изаберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontractors
                      .filter((s) => s.status === "aktivan")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.naziv}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Број уговора *</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="UV-2024-XXX"
                  value={form.brojUgovora}
                  onChange={(e) =>
                    setForm({ ...form, brojUgovora: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Предмет уговора *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Предмет уговора..."
                value={form.predmetUgovora}
                onChange={(e) =>
                  setForm({ ...form, predmetUgovora: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Опсег радова</Label>
              <Textarea
                className="text-sm min-h-[60px]"
                value={form.opsegRadova}
                onChange={(e) =>
                  setForm({ ...form, opsegRadova: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Вредност бруто (RSD)
                </Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.vrednost || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const neto = val / (1 + form.pdvStopa / 100);
                    setForm({
                      ...form,
                      vrednost: val,
                      vrednostNeto: Math.round(neto * 100) / 100,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Вредност нето (RSD)
                </Label>
                <Input
                  className="h-9 text-sm bg-muted"
                  type="number"
                  value={form.vrednostNeto || ""}
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">ПДВ стопа (%)</Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.pdvStopa}
                  onChange={(e) => {
                    const stopa = Number(e.target.value);
                    const neto = form.vrednost / (1 + stopa / 100);
                    setForm({
                      ...form,
                      pdvStopa: stopa,
                      vrednostNeto: Math.round(neto * 100) / 100,
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум потписа</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumPotpisa}
                  onChange={(e) =>
                    setForm({ ...form, datumPotpisa: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум почетка</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumPočetka}
                  onChange={(e) =>
                    setForm({ ...form, datumPočetka: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум завршетка</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumZavršetka}
                  onChange={(e) =>
                    setForm({ ...form, datumZavršetka: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as ContractStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u_pripremi">U pripremi</SelectItem>
                    <SelectItem value="na_čekanju">Na чекању</SelectItem>
                    <SelectItem value="aktivan">Активан</SelectItem>
                    <SelectItem value="istekao">Istekao</SelectItem>
                    <SelectItem value="prekinut">Prekinut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Гаранција (месеци)
                </Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.garancijaMeseci}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      garancijaMeseci: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Напомене</Label>
              <Textarea
                className="text-sm min-h-[60px]"
                value={form.napomene}
                onChange={(e) => setForm({ ...form, napomene: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !form.podizvođačId || !form.brojUgovora || !form.predmetUgovora
              }
            >
              Сачувај
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потврда брисања</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете овај уговор?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteOpen) onDelete(deleteOpen);
                setDeleteOpen(null);
              }}
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// TAB 3: ISPORUKE (Deliveries)
// ============================================================

interface DeliveriesTabProps {
  deliveries: Delivery[];
  contracts: Contract[];
  subcontractors: Subcontractor[];
  onAdd: (item: DeliveryFormData) => void;
  onUpdate: (id: string, item: Partial<Delivery>) => void;
  onDelete: (id: string) => void;
}

export function DeliveriesTab({
  deliveries,
  contracts,
  subcontractors,
  onAdd,
  onUpdate,
  onDelete,
}: DeliveriesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "sve">(
    "sve",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [form, setForm] = useState<DeliveryFormData>(emptyDeliveryForm);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const getSubName = (id: string) =>
    subcontractors.find((s) => s.id === id)?.naziv || "—";
  const getContractNumber = (id: string) =>
    contracts.find((c) => c.id === id)?.brojUgovora || "—";

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      d.brojIsporuke.toLowerCase().includes(search.toLowerCase()) ||
      getSubName(d.podizvođačId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "sve" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyDeliveryForm,
      stavke: [
        {
          redniBroj: 1,
          opis: "",
          količина: 0,
          jedinicaMere: "kom",
          jediničnaCena: 0,
          ukupno: 0,
        },
      ],
    });
    setDialogOpen(true);
  };

  const openEdit = (d: Delivery) => {
    setEditingId(d.id);
    setForm({
      ugovorId: d.ugovorId,
      podizvođačId: d.podizvođačId,
      brojIsporuke: d.brojIsporuke,
      datumIsporuke: d.datumIsporuke,
      datumPrijema: d.datumPrijema || "",
      mestoIsporuke: d.mestoIsporuke,
      stavke: d.stavke.map((s) => ({ ...s })),
      ukupanIznos: d.ukupanIznos,
      status: d.status,
      napomene: d.napomene,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.ugovorId || !form.brojIsporuke || !form.datumIsporuke) return;
    const total = form.stavke.reduce((sum, s) => sum + s.ukupno, 0);
    const finalForm = { ...form, ukupanIznos: total };
    if (editingId) {
      onUpdate(editingId, finalForm);
    } else {
      onAdd(finalForm);
    }
    setDialogOpen(false);
  };

  const handleContractChange = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (contract) {
      setForm({
        ...form,
        ugovorId: contractId,
        podizvođačId: contract.podizvođačId,
      });
    }
  };

  const addStavka = () => {
    const max =
      form.stavke.length > 0
        ? Math.max(...form.stavke.map((s) => s.redniBroj))
        : 0;
    setForm({
      ...form,
      stavke: [
        ...form.stavke,
        {
          redniBroj: max + 1,
          opis: "",
          količina: 0,
          jedinicaMere: "kom",
          jediničnaCena: 0,
          ukupno: 0,
        },
      ],
    });
  };

  const updateStavka = (idx: number, field: string, value: string | number) => {
    const updated = form.stavke.map((s, i) => {
      if (i !== idx) return s;
      const newS = { ...s, [field]: value };
      if (field === "količina" || field === "jediničnaCena") {
        newS.ukupno = newS.količina * newS.jediničnaCena;
      }
      return newS;
    });
    setForm({ ...form, stavke: updated });
  };

  const removeStavka = (idx: number) => {
    setForm({ ...form, stavke: form.stavke.filter((_, i) => i !== idx) });
  };

  const viewing = deliveries.find((d) => d.id === viewingId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Укупно испорука
              </p>
              <p className="text-2xl font-bold mt-1">{deliveries.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Прихваћене
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {deliveries.filter((d) => d.status === "prihvaćena").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                У току
              </p>
              <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {deliveries.filter((d) => d.status === "u_toku").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Укупна вредност
              </p>
              <p className="text-xl font-bold mt-1">
                {formatRSD(deliveries.reduce((s, d) => s + d.ukupanIznos, 0))}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-sky-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Испорука (Isporuke)</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filtered.length} од {deliveries.length} испорука
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Нова испорука
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Претрага..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as DeliveryStatus | "sve")
              }
            >
              <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sve">Сви статуси</SelectItem>
                <SelectItem value="zatražena">Zatražena</SelectItem>
                <SelectItem value="u_toku">U toku</SelectItem>
                <SelectItem value="isporučena">Isporučena</SelectItem>
                <SelectItem value="prihvaćena">Prihvaćena</SelectItem>
                <SelectItem value="odbijena">Odbijena</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Број</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Подизвођач
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Уговор
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Датум
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Место
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Износ
                  </TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs text-right w-[100px]">
                    Акције
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState
                        icon={Truck}
                        message="Нема испорука за приказ"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id} className="group">
                      <TableCell className="font-mono text-sm font-medium">
                        {d.brojIsporuke}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {getSubName(d.podizvođačId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-mono">
                        {getContractNumber(d.ugovorId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDatum(d.datumIsporuke)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm max-w-[150px] truncate">
                        {d.mestoIsporuke}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">
                        {formatRSD(d.ukupanIznos)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={d.status}
                          labels={deliveryStatusLabels}
                          colors={deliveryStatusColors}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setViewingId(d.id);
                                    setDetailOpen(true);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Преглед</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(d)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Уреди</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteOpen(d.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Обриши</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Delivery Form Card */}
      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? "Уреди испорукку" : "Нова испорука"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Уговор *</Label>
                <Select
                  value={form.ugovorId}
                  onValueChange={handleContractChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Изаберите уговор..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts
                      .filter((c) => c.status === "aktivan")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.brojUgovora} — {getSubName(c.podizvođačId)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Број испорука *</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="IS-2024-XXX"
                  value={form.brojIsporuke}
                  onChange={(e) =>
                    setForm({ ...form, brojIsporuke: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум испорука *</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumIsporuke}
                  onChange={(e) =>
                    setForm({ ...form, datumIsporuke: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум пријема</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumPrijema}
                  onChange={(e) =>
                    setForm({ ...form, datumPrijema: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Место испорука</Label>
                <Input
                  className="h-9 text-sm"
                  value={form.mestoIsporuke}
                  onChange={(e) =>
                    setForm({ ...form, mestoIsporuke: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as DeliveryStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zatražena">Zatražena</SelectItem>
                    <SelectItem value="u_toku">U toku</SelectItem>
                    <SelectItem value="isporučena">Isporučena</SelectItem>
                    <SelectItem value="prihvaćena">Prihvaćena</SelectItem>
                    <SelectItem value="odbijena">Odbijena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ставке испорука
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={addStavka}
              >
                <Plus className="h-3 w-3 mr-1" />
                Додај ставку
              </Button>
            </div>
            {form.stavke.map((stavka, idx) => (
              <div
                key={idx}
                className="grid gap-2 sm:grid-cols-6 items-end p-3 bg-muted/30 rounded-lg"
              >
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Опис</Label>
                  <Input
                    className="h-8 text-sm"
                    value={stavka.opis}
                    onChange={(e) => updateStavka(idx, "opis", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Количина</Label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    value={stavka.količina || ""}
                    onChange={(e) =>
                      updateStavka(idx, "količина", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ЈМ</Label>
                  <Select
                    value={stavka.jedinicaMere}
                    onValueChange={(v) => updateStavka(idx, "jedinicaMere", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(unitLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Цена (RSD)</Label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    value={stavka.jediničnaCena || ""}
                    onChange={(e) =>
                      updateStavka(idx, "jediničnaCena", Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Укупно</Label>
                    <p className="text-sm font-medium">
                      {formatRSD(stavka.ukupno)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive shrink-0"
                    onClick={() => removeStavka(idx)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <p className="text-sm font-semibold">
                Укупан износ:{" "}
                {formatRSD(form.stavke.reduce((s, st) => s + st.ukupno, 0))}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Напомене</Label>
              <Textarea
                className="text-sm min-h-[50px]"
                value={form.napomene}
                onChange={(e) => setForm({ ...form, napomene: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !form.ugovorId || !form.brojIsporuke || !form.datumIsporuke
              }
            >
              Сачувај
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Card */}
      {detailOpen && viewing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>
                  Испорука {viewing.brojIsporuke}
                </CardTitle>
                <StatusBadge
                  status={viewing.status}
                  labels={deliveryStatusLabels}
                  colors={deliveryStatusColors}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-3 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Подизвођач
                    </span>
                    <p className="font-medium">
                      {getSubName(viewing.podizvođačId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Уговор
                    </span>
                    <p className="font-mono">
                      {getContractNumber(viewing.ugovorId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Датум испорука
                    </span>
                    <p>{formatDatum(viewing.datumIsporuke)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Датум пријема
                    </span>
                    <p>
                      {viewing.datumPrijema
                        ? formatDatum(viewing.datumPrijema)
                        : "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground">Место</span>
                    <p>{viewing.mestoIsporuke}</p>
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ставке
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Опис</TableHead>
                      <TableHead className="text-xs text-right">Кол.</TableHead>
                      <TableHead className="text-xs">ЈМ</TableHead>
                      <TableHead className="text-xs text-right">Цена</TableHead>
                      <TableHead className="text-xs text-right">
                        Укупно
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewing.stavke.map((s) => (
                      <TableRow key={s.redniBroj}>
                        <TableCell className="text-xs">{s.redniBroj}</TableCell>
                        <TableCell className="text-sm">{s.opis}</TableCell>
                        <TableCell className="text-sm text-right">
                          {s.količina}
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.jedinicaMere}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {formatRSD(s.jediničnaCena)}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium">
                          {formatRSD(s.ukupno)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end text-sm font-semibold">
                  Укупно: {formatRSD(viewing.ukupanIznos)}
                </div>
                {viewing.napomene && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Напомене
                      </span>
                      <p>{viewing.napomene}</p>
                    </div>
                  </>
                )}
              </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потврда брисања</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете ову испорукку?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteOpen) onDelete(deleteOpen);
                setDeleteOpen(null);
              }}
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// TAB 4: FINANSIJE (Finance / Payments)
// ============================================================

interface FinanceTabProps {
  payments: Payment[];
  contracts: Contract[];
  subcontractors: Subcontractor[];
  onAdd: (item: PaymentFormData) => void;
  onUpdate: (id: string, item: Partial<Payment>) => void;
  onDelete: (id: string) => void;
}

export function FinanceTab({
  payments,
  contracts,
  subcontractors,
  onAdd,
  onUpdate,
  onDelete,
}: FinanceTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "sve">(
    "sve",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentFormData>(emptyPaymentForm);

  const getSubName = (id: string) =>
    subcontractors.find((s) => s.id === id)?.naziv || "—";
  const getContractNumber = (id: string) =>
    contracts.find((c) => c.id === id)?.brojUgovora || "—";

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.brojFakture.toLowerCase().includes(search.toLowerCase()) ||
      getSubName(p.podizvođačId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "sve" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyPaymentForm });
    setDialogOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditingId(p.id);
    setForm({
      ugovorId: p.ugovorId,
      podizvođačId: p.podizvođačId,
      isporukaId: p.isporukaId || "",
      brojFakture: p.brojFakture,
      datumFakture: p.datumFakture,
      datumValute: p.datumValute,
      iznosFakture: p.iznosFakture,
      pdvIznos: p.pdvIznos,
      iznosPlaćen: p.iznosPlaćen,
      preostaliIznos: p.preostaliIznos,
      status: p.status,
      načinPlaćanja: p.načinPlaćanja,
      referentniBroj: p.referentniBroj,
      napomene: p.napomene,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.ugovorId || !form.brojFakture || !form.datumFakture) return;
    const preostali = form.iznosFakture - form.iznosPlaćen;
    const status: PaymentStatus =
      preostali <= 0
        ? "plaćeno"
        : form.iznosPlaćen > 0
          ? "delačno"
          : "neplaćeno";
    const today = new Date();
    const dueDate = new Date(form.datumValute);
    const finalStatus =
      status === "plaćeno"
        ? "plaćeno"
        : dueDate < today
          ? "prekoračeno"
          : status;
    const finalForm = {
      ...form,
      preostaliIznos: preostali,
      status: finalStatus,
    };

    if (editingId) {
      onUpdate(editingId, finalForm);
    } else {
      onAdd(finalForm);
    }
    setDialogOpen(false);
  };

  const handleContractChange = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (contract) {
      setForm({
        ...form,
        ugovorId: contractId,
        podizvođačId: contract.podizvođačId,
      });
    }
  };

  const totalPlaćeno = payments.reduce((s, p) => s + p.iznosPlaćen, 0);
  const totalPreostalo = payments.reduce((s, p) => s + p.preostaliIznos, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Укупно фактура
              </p>
              <p className="text-2xl font-bold mt-1">{payments.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Плаћено
              </p>
              <p className="text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {formatRSD(totalPlaćeno)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Преостало
              </p>
              <p className="text-lg font-bold mt-1 text-amber-600 dark:text-amber-400">
                {formatRSD(totalPreostalo)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Prekoračeno
              </p>
              <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                {payments.filter((p) => p.status === "prekoračeno").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment progress bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium">Укупна плаћања</p>
          <p className="text-xs text-muted-foreground">
            {formatRSD(totalPlaćeno)} /{" "}
            {formatRSD(totalPlaćeno + totalPreostalo)}
          </p>
        </div>
        <Progress
          value={
            totalPlaćeno + totalPreostalo > 0
              ? (totalPlaćeno / (totalPlaćeno + totalPreostalo)) * 100
              : 0
          }
          className="h-2"
        />
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Плаћања и фактуре</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filtered.length} од {payments.length} ставки
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Ново плаћање
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Претрага по фактури..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PaymentStatus | "sve")}
            >
              <SelectTrigger className="h-9 w-full sm:w-40 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sve">Сви статуси</SelectItem>
                <SelectItem value="plaćeno">Plaćeno</SelectItem>
                <SelectItem value="delačno">Delimično</SelectItem>
                <SelectItem value="neplaćeno">Neplaćeno</SelectItem>
                <SelectItem value="prekoračeno">Prekoračeno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Број фактуре</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Подизвођач
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Уговор
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Датум fakture
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Valuta
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Iznos
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Plaćeno
                  </TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs text-right w-[100px]">
                    Акције
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <EmptyState
                        icon={Wallet}
                        message="Нема плаћања за приказ"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="group">
                      <TableCell className="font-mono text-sm font-medium">
                        {p.brojFakture}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {getSubName(p.podizvođačId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-mono">
                        {getContractNumber(p.ugovorId)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatDatum(p.datumFakture)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {formatDatum(p.datumValute)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm font-medium">
                        {formatRSD(p.iznosFakture)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {formatRSD(p.iznosPlaćen)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={p.status}
                          labels={paymentStatusLabels}
                          colors={paymentStatusColors}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(p)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Уреди</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteOpen(p.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Обриши</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Payment Form Card */}
      {dialogOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? "Уреди плаћање" : "Ново плаћање"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Уговор *</Label>
                <Select
                  value={form.ugovorId}
                  onValueChange={handleContractChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Изаберите уговор..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.brojUgovora} — {getSubName(c.podizvođačId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Број фактуре *</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  placeholder="F-2024-XXX"
                  value={form.brojFakture}
                  onChange={(e) =>
                    setForm({ ...form, brojFakture: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Датум фактуре *</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumFakture}
                  onChange={(e) =>
                    setForm({ ...form, datumFakture: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Валута фактуре *</Label>
                <Input
                  className="h-9 text-sm"
                  type="date"
                  value={form.datumValute}
                  onChange={(e) =>
                    setForm({ ...form, datumValute: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Iznos fakture (RSD бруто)
                </Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.iznosFakture || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const pdv = val - val / (1 + 20 / 100);
                    setForm({
                      ...form,
                      iznosFakture: val,
                      pdvIznos: Math.round(pdv * 100) / 100,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">ПДВ износ (RSD)</Label>
                <Input
                  className="h-9 text-sm bg-muted"
                  type="number"
                  value={form.pdvIznos || ""}
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Iznos plaćeno (RSD)
                </Label>
                <Input
                  className="h-9 text-sm"
                  type="number"
                  value={form.iznosPlaćen || ""}
                  onChange={(e) =>
                    setForm({ ...form, iznosPlaćen: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Начин плаћања</Label>
                <Select
                  value={form.načinPlaćanja}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      načinPlaćanja: v as Payment["načinPlaćanja"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Референтни број</Label>
                <Input
                  className="h-9 text-sm font-mono"
                  value={form.referentniBroj}
                  onChange={(e) =>
                    setForm({ ...form, referentniBroj: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Напомене</Label>
              <Textarea
                className="text-sm min-h-[50px]"
                value={form.napomene}
                onChange={(e) => setForm({ ...form, napomene: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !form.ugovorId || !form.brojFakture || !form.datumFakture
              }
            >
              Сачувај
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потврда брисања</AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да обришете ово плаћање?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteOpen) onDelete(deleteOpen);
                setDeleteOpen(null);
              }}
            >
              Обриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// TAB 5: IZVEŠTAJI (Reports)
// ============================================================

interface ReportsTabProps {
  subcontractors: Subcontractor[];
  contracts: Contract[];
  deliveries: Delivery[];
  payments: Payment[];
}

export function ReportsTab({
  subcontractors,
  contracts,
  deliveries,
  payments,
}: ReportsTabProps) {
  const [activeReport, setActiveReport] = useState<
    "potrošnja" | "istek" | "prekoračenje"
  >("potrošnja");

  const spendingData = calculateSpendingBySubcontractor(
    subcontractors,
    contracts,
    payments,
    deliveries,
  );
  const expiryAlerts = calculateContractExpiryAlerts(contracts, subcontractors);
  const overduePayments = calculateOverduePayments(payments, subcontractors);

  const totalSpent = spendingData.reduce((s, d) => s + d.ukupnoPlaćeno, 0);
  const totalRemaining = spendingData.reduce((s, d) => s + d.preostalo, 0);

  return (
    <div className="space-y-6">
      {/* Report selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeReport === "potrošnja" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveReport("potrošnja")}
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Потрошња по подизвођачу
        </Button>
        <Button
          variant={activeReport === "istek" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveReport("istek")}
        >
          <CalendarDays className="h-4 w-4 mr-1.5" />
          Истек уговора
        </Button>
        <Button
          variant={activeReport === "prekoračenje" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveReport("prekoračenje")}
        >
          <AlertTriangle className="h-4 w-4 mr-1.5" />
          Прекорачена плаћања
        </Button>
      </div>

      {/* Report: Spending by Subcontractor */}
      {activeReport === "potrošnja" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Потрошња по подизвођачу</CardTitle>
            <CardDescription className="text-xs">
              Преглед укупних трошкова по подизвођачу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Укупна вредност уговора
                </p>
                <p className="text-lg font-bold mt-1">
                  {formatRSD(
                    spendingData.reduce((s, d) => s + d.ukupnoUgovori, 0),
                  )}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Укупно плаћено
                </p>
                <p className="text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {formatRSD(totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Преостало за плаћање
                </p>
                <p className="text-lg font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {formatRSD(totalRemaining)}
                </p>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Подизвођач</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">
                      ПИБ
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Уговори
                    </TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">
                      Број
                    </TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">
                      Испоручено
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Плаћено
                    </TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">
                      Преостало
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendingData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState icon={BarChart3} message="Нема података" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    spendingData.map((row) => (
                      <TableRow key={row.podizvođačId}>
                        <TableCell className="text-sm font-medium">
                          {row.naziv}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm font-mono">
                          {row.pib}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {formatRSD(row.ukupnoUgovori)}
                        </TableCell>
                        <TableCell className="text-sm text-right hidden md:table-cell">
                          {row.brojUgovora}
                        </TableCell>
                        <TableCell className="text-sm text-right hidden lg:table-cell">
                          {formatRSD(row.ukupnoIsporučeno)}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatRSD(row.ukupnoPlaćeno)}
                        </TableCell>
                        <TableCell className="text-sm text-right hidden lg:table-cell text-amber-600 dark:text-amber-400">
                          {formatRSD(row.preostalo)}
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

      {/* Report: Contract Expiry */}
      {activeReport === "istek" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Истек уговора
            </CardTitle>
            <CardDescription className="text-xs">
              Уговори којима истиче важност — сортирано по преосталим данима
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expiryAlerts.length === 0 ? (
              <EmptyState icon={CalendarDays} message="Нема активних уговора" />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {expiryAlerts.map((alert) => (
                  <div
                    key={alert.ugovorId}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      alert.danaDoIsteka <= 30
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : alert.danaDoIsteka <= 90
                          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                          : "border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-sm font-semibold">
                          {alert.brojUgovora}
                        </p>
                        <StatusBadge
                          status={alert.status}
                          labels={contractStatusLabels}
                          colors={contractStatusColors}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {alert.podizvođаčNaziv}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Истиче: {formatDatum(alert.datumZavršetka)} — Вредност:{" "}
                        {formatRSD(alert.vrednost)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-2xl font-bold ${
                          alert.danaDoIsteka <= 30
                            ? "text-red-600 dark:text-red-400"
                            : alert.danaDoIsteka <= 90
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                        }`}
                      >
                        {alert.danaDoIsteka > 0 ? alert.danaDoIsteka : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.danaDoIsteka > 0 ? "дана" : "истекао"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report: Overdue Payments */}
      {activeReport === "prekoračenje" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Прекорачена плаћања
            </CardTitle>
            <CardDescription className="text-xs">
              Фактуре са преокораченим валутама — сортирано по данима
              прекорачења
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overduePayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mb-3 opacity-40 text-emerald-500" />
                <p className="text-sm">Нема прекорачених плаћања</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {overduePayments.map((op) => (
                  <div
                    key={op.plaćanjeId}
                    className="flex items-center gap-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-sm font-semibold">
                          {op.brojFakture}
                        </p>
                        <StatusBadge
                          status={op.status}
                          labels={paymentStatusLabels}
                          colors={paymentStatusColors}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {op.podizvođаčNaziv}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Валута: {formatDatum(op.datumValute)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatRSD(op.preostaliIznos)}
                      </p>
                      <p className="text-xs text-red-500 font-medium">
                        {op.danaPrekoračenja} дана прекорачења
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
