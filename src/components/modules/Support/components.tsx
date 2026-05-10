// ============================================================
// Support Module – Sub-Components
// ============================================================
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Headphones,
  Plus,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  BarChart3,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  customerName: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DashboardData {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResolutionHours: number;
  recentTickets: Ticket[];
  categoryBreakdown: Array<{ category: string; count: number }>;
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Otvoren", color: "bg-red-100 text-red-700" },
  in_progress: { label: "U toku", color: "bg-amber-100 text-amber-700" },
  waiting: { label: "Čeka odgovor", color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Rešeno", color: "bg-green-100 text-green-700" },
  closed: { label: "Zatvoreno", color: "bg-gray-100 text-gray-700" },
};

export const priorityConfig: Record<string, { label: string; color: string }> =
  {
    low: { label: "Nizak", color: "bg-gray-100 text-gray-700" },
    medium: { label: "Srednji", color: "bg-amber-100 text-amber-700" },
    high: { label: "Visok", color: "bg-orange-100 text-orange-700" },
    critical: { label: "Kritičan", color: "bg-red-100 text-red-700" },
  };

export const categoryLabels: Record<string, string> = {
  technical: "Tehnički",
  billing: "Naplata",
  general: "Opšte",
  feature: "Funkcionalnost",
  bug: "Greška",
};

export function OverviewTab({
  dashboard,
}: {
  dashboard: DashboardData | null;
}) {
  if (!dashboard)
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Otvoreni</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {dashboard.openTickets}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">U toku</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {dashboard.inProgressTickets}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Rešeni</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {dashboard.resolvedTickets}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Prosečno rešenje
            </span>
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{dashboard.avgResolutionHours}h</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Po kategoriji</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.categoryBreakdown.map((c) => (
              <div
                key={c.category}
                className="flex items-center justify-between"
              >
                <span className="text-sm">
                  {categoryLabels[c.category] || c.category}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${dashboard.totalTickets ? (c.count / dashboard.totalTickets) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {c.count}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Statistika</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{dashboard.totalTickets}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ukupno tiketa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Nedavni tiketi</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nema tiketa. Kreirajte prvi tiket.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboard.recentTickets.map((tk) => {
                const cfg = statusConfig[tk.status];
                return (
                  <div
                    key={tk.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">{tk.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {tk.customerName} ·{" "}
                        {categoryLabels[tk.category] || tk.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${pCfg?.color || ""}`}
                      >
                        {pCfg?.label || tk.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${cfg?.color || ""}`}
                      >
                        {cfg?.label || tk.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

interface TicketsTabProps {
  items: Ticket[];
  loading: boolean;
  search: string;
  filter: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: string) => void;
  onView: (item: Ticket) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}

export function TicketsTab({
  items,
  loading,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onView,
  onUpdateStatus,
  onDelete,
  onOpenCreate,
}: TicketsTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži tikete..."
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Svi statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <Headphones className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema tiketa</p>
          <Button variant="outline" className="mt-3" onClick={onOpenCreate}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj tiket
          </Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Broj</th>
                  <th className="p-3">Naslov</th>
                  <th className="p-3">Klijent</th>
                  <th className="p-3">Prioritet</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {items.map((tk) => {
                  const sCfg = statusConfig[tk.status];
                  const pCfg = priorityConfig[tk.priority];
                  return (
                    <tr key={tk.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">
                        {tk.ticketNumber}
                      </td>
                      <td className="p-3 font-medium">{tk.subject}</td>
                      <td className="p-3">{tk.customerName}</td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${pCfg?.color || ""}`}
                        >
                          {pCfg?.label || tk.priority}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${sCfg?.color || ""}`}
                        >
                          {sCfg?.label || tk.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => onView(tk)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {tk.status === "open" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-amber-600"
                              onClick={() =>
                                onUpdateStatus(tk.id, "in_progress")
                              }
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {tk.status === "in_progress" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-600"
                              onClick={() => onUpdateStatus(tk.id, "resolved")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDelete(tk.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

