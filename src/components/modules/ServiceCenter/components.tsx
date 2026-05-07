"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
  Plus,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  CalendarDays,
  Wrench,
  Users,
  Package,
  Truck,
  Phone,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Timer,
  MapPin,
  Star,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { toast } from "sonner";

// ============ TYPES ============

interface ServiceOrder {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  productBrand: string;
  productModel: string;
  serialNumber: string;
  category: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  diagnosis: string;
  repairNotes: string;
  assignedTechnician: string;
  estimatedCost: number;
  actualCost: number;
  partsCost: number;
  laborCost: number;
  currency: string;
  receivedDate: string;
  promisedDate: string;
  completedDate: string | null;
  deliveredDate: string | null;
  warranty: boolean;
  warrantyMonths: number;
  invoiceNumber: string;
  rating: number;
  timeline: ServiceEvent[];
  parts: ServicePart[];
}

interface ServiceEvent {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

interface ServicePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ServiceStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  delivered: number;
  avgRepairDays: number;
  avgCost: number;
  totalRevenue: number;
  byCategory: Array<{ category: string; count: number; label: string }>;
  byTechnician: Array<{ tech: string; count: number; revenue: number }>;
  byStatus: Array<{ status: string; count: number }>;
  topBrands: Array<{ brand: string; count: number }>;
  monthly: Array<{ month: string; received: number; completed: number }>;
  satisfactionAvg: number;
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received: {
    label: "Primljen",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  diagnosing: {
    label: "Dijagnoza",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  waiting_parts: {
    label: "Čeka delove",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  in_repair: {
    label: "U popravci",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  testing: {
    label: "Testiranje",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  completed: {
    label: "Gotov",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  delivered: {
    label: "Isporučen",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Otkazan",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  electronics: { label: "Elektronika", icon: "💻" },
  appliances: { label: "Bela tehnika", icon: "🔌" },
  phones: { label: "Telefoni", icon: "📱" },
  laptops: { label: "Laptopovi", icon: "🖥️" },
  vehicles: { label: "Vozila", icon: "🚗" },
  tools: { label: "Alati", icon: "🔧" },
  hvac: { label: "Grejanje/Ventilacija", icon: "🌡️" },
  plumbing: { label: "Vodovod", icon: "🚿" },
  other: { label: "Ostalo", icon: "📋" },
};

const TYPE_CONFIG: Record<string, string> = {
  repair: "Popravka",
  maintenance: "Održavanje",
  installation: "Instalacija",
  diagnosis_only: "Samo dijagnoza",
  calibration: "Kalibracija",
  upgrade: "Nadogradnja",
};

const TECHNICIANS = [
  "Marko Petrović",
  "Nikola Nikolić",
  "Jelena Stanković",
  "Petar Jovanović",
];

const formatCurrency = (val: number) =>
  `${val.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD`;

// ============ MOCK DATA ============

const mockOrders: ServiceOrder[] = [
  {
    id: "svc-1",
    number: "SRV-2025-001",
    clientName: "Jovan Đorđević",
    clientPhone: "+381631234567",
    clientEmail: "jovan@email.com",
    clientAddress: "Vojvode Mišića 15, Beograd",
    productBrand: "Apple",
    productModel: 'MacBook Pro 14" M3',
    serialNumber: "C02GQ1XXHASH",
    category: "laptops",
    type: "repair",
    priority: "high",
    status: "in_repair",
    description:
      "Prekida se ekran, pojavljuju se linije i artefakti. Problem se javlja nakon 30-60 min rada.",
    diagnosis:
      "Defektan fleks kabl ekrana — potrebna zamena kompletnog displej sklopa.",
    repairNotes: "Naručene delovi od dobavljača.",
    assignedTechnician: "Nikola Nikolić",
    estimatedCost: 35000,
    actualCost: 32000,
    partsCost: 28000,
    laborCost: 4000,
    currency: "RSD",
    receivedDate: "2025-01-15",
    promisedDate: "2025-01-22",
    completedDate: null,
    deliveredDate: null,
    warranty: true,
    warrantyMonths: 3,
    invoiceNumber: "",
    rating: 0,
    timeline: [
      {
        id: "e1",
        action: "Primljen",
        description: "Uređaj primljen na servis",
        performedBy: "Sistem",
        timestamp: "2025-01-15T10:00:00",
      },
      {
        id: "e2",
        action: "Dijagnoza",
        description: "Defektan fleks kabl",
        performedBy: "Nikola Nikolić",
        timestamp: "2025-01-16T14:00:00",
      },
      {
        id: "e3",
        action: "Čeka delove",
        description: "Naručen displej sklop",
        performedBy: "Nikola Nikolić",
        timestamp: "2025-01-17T09:00:00",
      },
      {
        id: "e4",
        action: "U popravci",
        description: "Započeta zamena displeja",
        performedBy: "Nikola Nikolić",
        timestamp: "2025-01-19T10:00:00",
      },
    ],
    parts: [
      {
        id: "p1",
        name: 'Display Assembly 14" A2992',
        partNumber: "APL-DSP-14-M3",
        quantity: 1,
        unitPrice: 28000,
        total: 28000,
      },
    ],
  },
  {
    id: "svc-2",
    number: "SRV-2025-002",
    clientName: "D.o.o. TechPro",
    clientPhone: "+38111234567",
    clientEmail: "office@techpro.rs",
    clientAddress: "Bulevar Mihajla Pupina 10a, Novi Beograd",
    productBrand: "HP",
    productModel: "LaserJet Enterprise M507dn",
    serialNumber: "VND2P18012",
    category: "electronics",
    type: "maintenance",
    priority: "medium",
    status: "diagnosing",
    description:
      "Stampač stampa crne trake, kvalitet štampe je loš. Potrebno servisiranje i čišćenje.",
    diagnosis: "",
    repairNotes: "",
    assignedTechnician: "Marko Petrović",
    estimatedCost: 8000,
    actualCost: 0,
    partsCost: 0,
    laborCost: 0,
    currency: "RSD",
    receivedDate: "2025-01-18",
    promisedDate: "2025-01-24",
    completedDate: null,
    deliveredDate: null,
    warranty: false,
    warrantyMonths: 0,
    invoiceNumber: "",
    rating: 0,
    timeline: [
      {
        id: "e5",
        action: "Primljen",
        description: "Stampač primljen",
        performedBy: "Sistem",
        timestamp: "2025-01-18T09:00:00",
      },
    ],
    parts: [],
  },
  {
    id: "svc-3",
    number: "SRV-2025-003",
    clientName: "Milica Ilić",
    clientPhone: "+381648765432",
    clientEmail: "milica.i@email.com",
    clientAddress: "Kneza Miloša 45, Zemun",
    productBrand: "Samsung",
    productModel: "Galaxy S24 Ultra",
    serialNumber: "R5CX90AABCD",
    category: "phones",
    type: "repair",
    priority: "high",
    status: "completed",
    description: "Pukla zadnja staklena maska, kamera lepeza je ogrebana.",
    diagnosis: "Potrebna zamena zadnje maske i lepeza kamere.",
    assignedTechnician: "Jelena Stanković",
    estimatedCost: 15000,
    actualCost: 14000,
    partsCost: 11000,
    laborCost: 3000,
    currency: "RSD",
    receivedDate: "2025-01-10",
    promisedDate: "2025-01-14",
    completedDate: "2025-01-13",
    deliveredDate: "2025-01-14",
    warranty: true,
    warrantyMonths: 3,
    invoiceNumber: "INV-2025-SR003",
    rating: 5,
    timeline: [
      {
        id: "e6",
        action: "Primljen",
        description: "Telefon primljen",
        performedBy: "Sistem",
        timestamp: "2025-01-10T08:00:00",
      },
      {
        id: "e7",
        action: "Dijagnoza",
        description: "Pukla maska i ogrebana lepeza",
        performedBy: "Jelena Stanković",
        timestamp: "2025-01-10T16:00:00",
      },
      {
        id: "e8",
        action: "Gotov",
        description: "Popravka završena",
        performedBy: "Jelena Stanković",
        timestamp: "2025-01-13T15:00:00",
      },
      {
        id: "e9",
        action: "Isporučen",
        description: "Kupac preuzeo uređaj",
        performedBy: "Sistem",
        timestamp: "2025-01-14T11:00:00",
      },
    ],
    parts: [
      {
        id: "p2",
        name: "Back Glass S24 Ultra",
        partNumber: "SAM-BG-S24U",
        quantity: 1,
        unitPrice: 8000,
        total: 8000,
      },
      {
        id: "p3",
        name: "Camera Lens Cover",
        partNumber: "SAM-CL-S24U",
        quantity: 1,
        unitPrice: 3000,
        total: 3000,
      },
    ],
  },
  {
    id: "svc-4",
    number: "SRV-2025-004",
    clientName: "Dragan Milić",
    clientPhone: "+381655556677",
    clientEmail: "dragan.m@email.com",
    clientAddress: "Tolstojeva 22, Vračar",
    productBrand: "Bosch",
    productModel: "WAS28460",
    serialNumber: "SN-BOS-2021-98765",
    category: "appliances",
    type: "repair",
    priority: "low",
    status: "waiting_parts",
    description:
      "Mašina za veš ne centriše veš, baca u svim pravcima. Problematična je već mesec dana.",
    diagnosis:
      "Defektan motor za centrisanje i amortizer bubnja. Potrebna zamena oba dela.",
    assignedTechnician: "Petar Jovanović",
    estimatedCost: 12000,
    actualCost: 0,
    partsCost: 0,
    laborCost: 0,
    currency: "RSD",
    receivedDate: "2025-01-12",
    promisedDate: "2025-01-25",
    completedDate: null,
    deliveredDate: null,
    warranty: false,
    warrantyMonths: 0,
    invoiceNumber: "",
    rating: 0,
    timeline: [
      {
        id: "e10",
        action: "Primljen",
        description: "Mašina primljena",
        performedBy: "Sistem",
        timestamp: "2025-01-12T10:00:00",
      },
      {
        id: "e11",
        action: "Dijagnoza",
        description: "Defektan motor + amortizer",
        performedBy: "Petar Jovanović",
        timestamp: "2025-01-13T16:00:00",
      },
      {
        id: "e12",
        action: "Čeka delove",
        description: "Delovi naručeni od dobavljača",
        performedBy: "Petar Jovanović",
        timestamp: "2025-01-14T09:00:00",
      },
    ],
    parts: [
      {
        id: "p4",
        name: "Motor za centrisanje",
        partNumber: "BOS-MOT-WAS28",
        quantity: 1,
        unitPrice: 5500,
        total: 5500,
      },
      {
        id: "p5",
        name: "Amortizer bubnja",
        partNumber: "BOS-AMP-WAS28",
        quantity: 2,
        unitPrice: 2500,
        total: 5000,
      },
    ],
  },
  {
    id: "svc-5",
    number: "SRV-2024-045",
    clientName: "Sara Kovačević",
    clientPhone: "+381601112233",
    clientEmail: "sara.k@email.com",
    clientAddress: "Gundulićev venac 28, Beograd",
    productBrand: "Bosch",
    productModel: "PWS 750-125",
    serialNumber: "",
    category: "tools",
    type: "repair",
    priority: "low",
    status: "delivered",
    description: "Kučište brusilice je puklo, motor radi ali kućište vibrira.",
    diagnosis: "Puklo kućište — lemljenje nije moguće, potrebna zamena.",
    assignedTechnician: "Marko Petrović",
    estimatedCost: 3000,
    actualCost: 2800,
    partsCost: 1500,
    laborCost: 1300,
    currency: "RSD",
    receivedDate: "2024-12-20",
    promisedDate: "2024-12-27",
    completedDate: "2024-12-24",
    deliveredDate: "2024-12-26",
    warranty: true,
    warrantyMonths: 3,
    invoiceNumber: "INV-2024-SR045",
    rating: 4,
    timeline: [
      {
        id: "e13",
        action: "Primljen",
        description: "Brusilica primljena",
        performedBy: "Sistem",
        timestamp: "2024-12-20T10:00:00",
      },
      {
        id: "e14",
        action: "Gotov",
        description: "Kućište zamenjeno",
        performedBy: "Marko Petrović",
        timestamp: "2024-12-24T14:00:00",
      },
      {
        id: "e15",
        action: "Isporučen",
        description: "Preuzeta",
        performedBy: "Sistem",
        timestamp: "2024-12-26T10:00:00",
      },
    ],
    parts: [
      {
        id: "p6",
        name: "Housing PWS 750",
        partNumber: "BOS-HSG-PWS750",
        quantity: 1,
        unitPrice: 1500,
        total: 1500,
      },
    ],
  },
];

const mockStats: ServiceStats = {
  total: 156,
  open: 8,
  inProgress: 12,
  completed: 118,
  delivered: 112,
  avgRepairDays: 3.5,
  avgCost: 8500,
  totalRevenue: 1326000,
  byCategory: [
    { category: "phones", count: 42, label: "Telefoni" },
    { category: "laptops", count: 35, label: "Laptopovi" },
    { category: "appliances", count: 30, label: "Bela tehnika" },
    { category: "electronics", count: 25, label: "Elektronika" },
    { category: "tools", count: 12, label: "Alati" },
    { category: "vehicles", count: 8, label: "Vozila" },
    { category: "other", count: 4, label: "Ostalo" },
  ],
  byTechnician: [
    { tech: "Nikola Nikolić", count: 48, revenue: 420000 },
    { tech: "Marko Petrović", count: 42, revenue: 350000 },
    { tech: "Jelena Stanković", count: 38, revenue: 310000 },
    { tech: "Petar Jovanović", count: 28, revenue: 246000 },
  ],
  byStatus: mockOrders.reduce(
    (acc, o) => {
      const s = acc.find((x) => x.status === o.status);
      if (s) s.count++;
      else acc.push({ status: o.status, count: 1 });
      return acc;
    },
    [] as Array<{ status: string; count: number }>,
  ),
  topBrands: [
    { brand: "Apple", count: 38 },
    { brand: "Samsung", count: 32 },
    { brand: "HP", count: 18 },
    { brand: "Dell", count: 15 },
    { brand: "Bosch", count: 12 },
  ],
  monthly: [
    { month: "Avg", received: 18, completed: 16 },
    { month: "Sep", received: 22, completed: 20 },
    { month: "Okt", received: 20, completed: 19 },
    { month: "Nov", received: 25, completed: 23 },
    { month: "Dec", received: 28, completed: 24 },
    { month: "Jan", received: 15, completed: 10 },
  ],
  satisfactionAvg: 4.3,
};

// ============ COMPONENT ============

export function Servis() {
  const { activeCompanyId } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const [detailOpen, setDetailOpen] = useState(false);

  const emptyForm = {
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    productBrand: "",
    productModel: "",
    serialNumber: "",
    category: "phones",
    type: "repair",
    priority: "medium",
    description: "",
    assignedTechnician: TECHNICIANS[0],
    estimatedCost: "",
    promisedDate: "",
    warranty: "no",
    warrantyMonths: "",
  };
  const [form, setForm] = useState(emptyForm);

  const loadOrders = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/service-orders?companyId=${activeCompanyId}&limit=100`,
      );
      if (res.ok) {
        const d = await res.json();
        setOrders(d.items?.length ? d.items : mockOrders);
      } else {
        setOrders(mockOrders);
      }
    } catch {
      setOrders(mockOrders);
    }
    setLoading(false);
  }, [activeCompanyId]);

  const loadStats = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(
        `/api/service-orders/stats?companyId=${activeCompanyId}`,
      );
      if (res.ok) setStats(await res.json());
      else setStats(mockStats);
    } catch {
      setStats(mockStats);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [activeCompanyId, loadOrders, loadStats]);

  const filtered = orders.filter((o) => {
    if (
      activeTab === "active" &&
      (o.status === "completed" ||
        o.status === "delivered" ||
        o.status === "cancelled")
    )
      return false;
    if (
      activeTab === "completed" &&
      o.status !== "completed" &&
      o.status !== "delivered"
    )
      return false;
    if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (techFilter !== "all" && o.assignedTechnician !== techFilter)
      return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.number.toLowerCase().includes(s) ||
        o.clientName.toLowerCase().includes(s) ||
        o.productModel.toLowerCase().includes(s) ||
        o.productBrand.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleCreate = async () => {
    if (!activeCompanyId || !form.clientName.trim()) return;
    try {
      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          estimatedCost: parseFloat(form.estimatedCost) || 0,
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(emptyForm);
        loadOrders();
        loadStats();
        toast.success("Servisni nalog kreiran");
      }
    } catch {
      /* silent */
    }
  };

  const handleStatusAdvance = async (order: ServiceOrder) => {
    const flow: Record<string, string> = {
      received: "diagnosing",
      diagnosing: "waiting_parts",
      waiting_parts: "in_repair",
      in_repair: "testing",
      testing: "completed",
      completed: "delivered",
    };
    const next = flow[order.status];
    if (!next) return;
    try {
      const res = await fetch("/api/service-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: next }),
      });
      if (res.ok) {
        loadOrders();
        loadStats();
        toast.success(`Status: ${STATUS_CONFIG[next]?.label}`);
      }
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Obrisati nalog?")) return;
    await fetch(`/api/service-orders?id=${id}`, { method: "DELETE" });
    loadOrders();
    loadStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Servis</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje servisnim nalozima i popravkama
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadOrders();
              loadStats();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Novi nalog
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="active">
            <Wrench className="h-4 w-4 mr-1" /> Aktivni
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Završeni
          </TabsTrigger>
        </TabsList>

        {/* PREGLED */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Aktivni
                    </span>
                    <Wrench className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.open + stats.inProgress}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Završeni
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.delivered}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Prosečno dana
                    </span>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{stats.avgRepairDays}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Prihodi
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    prosek {formatCurrency(stats.avgCost)}/nalog
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Po kategoriji</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byCategory.map((c) => {
                      const cfg = CATEGORY_CONFIG[c.category];
                      const max = Math.max(
                        ...stats.byCategory.map((x) => x.count),
                      );
                      return (
                        <div
                          key={c.category}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm w-6">{cfg?.icon}</span>
                          <span className="text-xs w-24">{c.label}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${(c.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">
                            {c.count}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tehničari</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byTechnician.map((t) => {
                      const max = Math.max(
                        ...stats.byTechnician.map((x) => x.count),
                      );
                      return (
                        <div key={t.tech} className="flex items-center gap-3">
                          <span className="text-xs w-32 truncate">
                            {t.tech}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${(t.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">
                            {t.count}
                          </span>
                          <span className="text-[10px] text-muted-foreground w-20 text-right">
                            {formatCurrency(t.revenue)}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Najviše servisirani brendovi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.topBrands.map((b, i) => (
                    <div key={b.brand} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-5 text-muted-foreground">
                        {i + 1}.
                      </span>
                      <span className="text-xs flex-1">{b.brand}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {b.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* LIST TABS */}
        {["active", "completed"].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Kategorija" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.icon} {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tehničar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi</SelectItem>
                  {TECHNICIANS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema naloga</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((o) => {
                  const sCfg = STATUS_CONFIG[o.status];
                  const cCfg = CATEGORY_CONFIG[o.category];
                  return (
                    <Card
                      key={o.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelected(o);
                        setDetailOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">
                                {o.number}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${sCfg?.color}`}
                              >
                                {sCfg?.label}
                              </Badge>
                              <span className="text-[10px]">
                                {cCfg?.icon} {o.productBrand} {o.productModel}
                              </span>
                              {o.warranty && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  Garancija
                                </Badge>
                              )}
                              {o.parts.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {o.parts.length} delova
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm font-medium">
                              {o.clientName}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {o.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                <Users className="h-3 w-3 inline mr-1" />
                                {o.assignedTechnician}
                              </span>
                              <span>
                                <CalendarDays className="h-3 w-3 inline mr-1" />
                                {formatDate(o.receivedDate)}
                              </span>
                              {o.promisedDate && (
                                <span
                                  className={
                                    new Date(o.promisedDate) < new Date()
                                      ? "text-red-500 font-medium"
                                      : ""
                                  }
                                >
                                  Rok: {formatDate(o.promisedDate)}
                                </span>
                              )}
                              {o.estimatedCost > 0 && (
                                <span className="font-medium text-foreground">
                                  {formatCurrency(o.estimatedCost)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {o.status !== "delivered" &&
                              o.status !== "cancelled" &&
                              o.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusAdvance(o);
                                  }}
                                >
                                  Napred{" "}
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <ScrollArea className="max-h-[75vh] pr-4">
            {selected && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {selected.number} — {selected.productBrand}{" "}
                    {selected.productModel}
                  </DialogTitle>
                  <DialogDescription>
                    {selected.clientName} · {selected.clientPhone}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[selected.status]?.color}
                  >
                    {STATUS_CONFIG[selected.status]?.label}
                  </Badge>
                  <Badge variant="secondary">
                    {TYPE_CONFIG[selected.type]}
                  </Badge>
                  {selected.warranty && (
                    <Badge variant="secondary">
                      Garancija {selected.warrantyMonths} mes.
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Klijent</p>
                    <p className="text-sm font-medium">{selected.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.clientAddress}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">
                      Tehničar
                    </p>
                    <p className="text-sm font-medium">
                      {selected.assignedTechnician}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">
                      Procenjeni trošak
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(selected.estimatedCost)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">
                      Stvarni trošak
                    </p>
                    <p className="text-sm font-bold">
                      {selected.actualCost > 0
                        ? formatCurrency(selected.actualCost)
                        : "—"}
                    </p>
                    {selected.actualCost > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Delovi: {formatCurrency(selected.partsCost)} · Rad:{" "}
                        {formatCurrency(selected.laborCost)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Opis kvara</h4>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                    {selected.description}
                  </div>
                </div>
                {selected.diagnosis && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dijagnoza</h4>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">
                      {selected.diagnosis}
                    </div>
                  </div>
                )}

                {selected.parts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Delovi ({selected.parts.length})
                    </h4>
                    <div className="space-y-2">
                      {selected.parts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded border text-xs"
                        >
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground ml-2">
                              ({p.partNumber})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>x{p.quantity}</span>
                            <span className="font-medium">
                              {formatCurrency(p.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-3">Vremenska linija</h4>
                  <div className="space-y-3">
                    {selected.timeline.map((ev) => (
                      <div key={ev.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium">{ev.action}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {ev.description} · {ev.performedBy} ·{" "}
                            {new Date(ev.timestamp).toLocaleString("sr-RS")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.rating > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-sm">Ocena kupca:</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < selected.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novi servisni nalog</DialogTitle>
            <DialogDescription>Podaci o klijentu i uređaju</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Klijent *</Label>
                <Input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={form.clientPhone}
                  onChange={(e) =>
                    setForm({ ...form, clientPhone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.clientEmail}
                onChange={(e) =>
                  setForm({ ...form, clientEmail: e.target.value })
                }
              />
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Brend</Label>
                <Input
                  value={form.productBrand}
                  onChange={(e) =>
                    setForm({ ...form, productBrand: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={form.productModel}
                  onChange={(e) =>
                    setForm({ ...form, productModel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>S/N</Label>
                <Input
                  value={form.serialNumber}
                  onChange={(e) =>
                    setForm({ ...form, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.icon} {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nizak</SelectItem>
                    <SelectItem value="medium">Srednji</SelectItem>
                    <SelectItem value="high">Visok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis kvara *</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Tehničar</Label>
                <Select
                  value={form.assignedTechnician}
                  onValueChange={(v) =>
                    setForm({ ...form, assignedTechnician: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIANS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rok</Label>
                <Input
                  type="date"
                  value={form.promisedDate}
                  onChange={(e) =>
                    setForm({ ...form, promisedDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Procena (RSD)</Label>
                <Input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) =>
                    setForm({ ...form, estimatedCost: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleCreate} disabled={!form.clientName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Kreiraj nalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
