"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
  UserPlus,
  Plus,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Briefcase,
} from "lucide-react";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  applicantCount: number;
  description?: string;
  requirements?: string;
  publishedAt?: string;
  createdAt: string;
}
export interface DashboardData {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplicants: number;
  avgApplicantsPerJob: number;
  recentJobs: JobPosting[];
  departmentBreakdown: Array<{ department: string; count: number }>;
}
export const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Nacrt", color: "bg-gray-100 text-gray-700" },
  open: { label: "Otvoren", color: "bg-green-100 text-green-700" },
  paused: { label: "Pauziran", color: "bg-amber-100 text-amber-700" },
  closed: { label: "Zatvoren", color: "bg-red-100 text-red-700" },
};
export const typeLabels: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Ugovor",
  internship: "Praksa",
  remote: "Remote",
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
            <span className="text-xs text-muted-foreground">Ukupno oglasa</span>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{dashboard.totalJobs}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Aktivni</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {dashboard.openJobs}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Ukupno kandidata
            </span>
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{dashboard.totalApplicants}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Prosek po oglasu
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{dashboard.avgApplicantsPerJob}</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Po departmentu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.departmentBreakdown.map((d) => (
              <div
                key={d.department}
                className="flex items-center justify-between"
              >
                <span className="text-sm">
                  {d.department || "Nije navedeno"}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${dashboard.totalJobs ? (d.count / dashboard.totalJobs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {d.count}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Statistika zapošljavanja</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{dashboard.closedJobs}</p>
              <p className="text-sm text-muted-foreground mt-1">
                zatvorenih pozicija
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Nedavni oglasi</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nema oglasa.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboard.recentJobs.map((j) => {
                const cfg = statusConfig[j.status];
                return (
                  <div
                    key={j.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">{j.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.department} · {j.location} ·{" "}
                        {typeLabels[j.type] || j.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${cfg?.color || ""}`}
                      >
                        {cfg?.label || j.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {j.applicantCount} kandidata
                      </div>
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

interface JobsTabProps {
  items: JobPosting[];
  loading: boolean;
  search: string;
  filter: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: string) => void;
  onView: (item: JobPosting) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}
export function JobsTab({
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
}: JobsTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži oglase..."
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
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema oglasa</p>
          <Button variant="outline" className="mt-3" onClick={onOpenCreate}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj oglas
          </Button>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3">Naziv</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Tip</th>
                  <th className="p-3">Kandidati</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {items.map((j) => {
                  const cfg = statusConfig[j.status];
                  return (
                    <tr key={j.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{j.title}</td>
                      <td className="p-3">{j.department}</td>
                      <td className="p-3">{typeLabels[j.type] || j.type}</td>
                      <td className="p-3">
                        <span className="font-medium">{j.applicantCount}</span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${cfg?.color || ""}`}
                        >
                          {cfg?.label || j.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => onView(j)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {j.status === "draft" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-600"
                              onClick={() => onUpdateStatus(j.id, "open")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {j.status === "open" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-amber-600"
                              onClick={() => onUpdateStatus(j.id, "paused")}
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDelete(j.id)}
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

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Record<string, string | number>;
  onFormChange: (field: string, value: string | number) => void;
  onCreate: () => void;
}
export function CreateJobDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onCreate,
}: CreateDialogProps) {
  const handleStr = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onFormChange(f, e.target.value);
  const handleNum = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onFormChange(f, parseFloat(e.target.value) || 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novi oglas za posao</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Naziv pozicije</Label>
            <Input
              value={form.title}
              onChange={handleStr("title")}
              placeholder="npr. Senior Developer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={handleStr("department")}
                placeholder="npr. IT"
              />
            </div>
            <div className="space-y-2">
              <Label>Lokacija</Label>
              <Input
                value={form.location}
                onChange={handleStr("location")}
                placeholder="npr. Beograd"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tip</Label>
              <Select
                value={form.type}
                onValueChange={(v) => onFormChange("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plata od (RSD)</Label>
              <Input
                type="number"
                value={form.salaryMin || ""}
                onChange={handleNum("salaryMin")}
              />
            </div>
            <div className="space-y-2">
              <Label>Plata do (RSD)</Label>
              <Input
                type="number"
                value={form.salaryMax || ""}
                onChange={handleNum("salaryMax")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Opis</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={handleStr("description")}
              placeholder="Opis posla..."
            />
          </div>
          <div className="space-y-2">
            <Label>Zahtevi</Label>
            <Textarea
              rows={2}
              value={form.requirements}
              onChange={handleStr("requirements")}
              placeholder="Zahtevi za kandidate..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: JobPosting | null;
}
export function DetailDialog({ open, onOpenChange, item }: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalji oglasa</DialogTitle>
        </DialogHeader>
        {item && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Naziv:</span>{" "}
                <span className="font-medium">{item.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <Badge
                  variant="outline"
                  className={statusConfig[item.status]?.color}
                >
                  {statusConfig[item.status]?.label}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>{" "}
                {item.department}
              </div>
              <div>
                <span className="text-muted-foreground">Lokacija:</span>{" "}
                {item.location}
              </div>
              <div>
                <span className="text-muted-foreground">Tip:</span>{" "}
                {typeLabels[item.type] || item.type}
              </div>
              <div>
                <span className="text-muted-foreground">Kandidati:</span>{" "}
                <span className="font-bold">{item.applicantCount}</span>
              </div>
              {item.salaryMin && (
                <div>
                  <span className="text-muted-foreground">Plata:</span>{" "}
                  {item.salaryMin.toLocaleString()} -{" "}
                  {item.salaryMax?.toLocaleString()} RSD
                </div>
              )}
            </div>
            {item.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Opis:</span>{" "}
                {item.description}
              </div>
            )}
            {item.requirements && (
              <div className="text-sm">
                <span className="text-muted-foreground">Zahtevi:</span>{" "}
                {item.requirements}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
