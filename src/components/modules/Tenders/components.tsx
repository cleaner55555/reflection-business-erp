"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  Users,
  Gavel,
  ChevronRight,
  BarChart3,
  Copy,
  ExternalLink,
  Star,
  Send,
  X,
  Banknote,
  Building2,
  Trophy,
  Target,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { toast } from "sonner";

// ============ TYPES ============

interface Tender {
  id: string;
  number: string;
  title: string;
  description: string;
  type: string;
  procedureType: string;
  status: string;
  priority: string;
  sector: string;
  buyerName: string;
  buyerPib: string;
  buyerAddress: string;
  estimatedValue: number;
  currency: string;
  cpvCode: string;
  deadlineSubmission: string;
  deadlineClarification: string;
  openingDate: string;
  awardDate: string;
  contractSigningDate: string;
  requirements: string[];
  criteria: TenderCriterion[];
  bidders: TenderBidder[];
  winnerId: string | null;
  notes: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TenderEvent[];
}

interface TenderCriterion {
  id: string;
  name: string;
  weight: number;
  type: string;
}

interface TenderBidder {
  id: string;
  name: string;
  pib: string;
  price: number;
  score: number;
  status: string;
  submittedAt: string | null;
  disqualified: boolean;
  disqualificationReason: string;
}

interface TenderEvent {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

interface TenderStats {
  total: number;
  open: number;
  inEvaluation: number;
  awarded: number;
  cancelled: number;
  totalValue: number;
  avgBidders: number;
  byType: Array<{ type: string; count: number; label: string }>;
  bySector: Array<{ sector: string; count: number; label: string }>;
  byStatus: Array<{ status: string; count: number; label: string }>;
  monthlyTrend: Array<{
    month: string;
    opened: number;
    awarded: number;
    cancelled: number;
  }>;
  topBuyers: Array<{ buyer: string; count: number; value: number }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    daysLeft: number;
  }>;
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: {
    label: "Priprema",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
  published: {
    label: "Objavljen",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  clarification: {
    label: "Razjašnjenje",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  submission_closed: {
    label: "Prijava zatvorena",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  evaluation: {
    label: "Evaluacija",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  awarded: {
    label: "Dodeljen",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  contract_signed: {
    label: "Ugovor potpisan",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Otkazan",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  goods: { label: "Roba", icon: "📦" },
  services: { label: "Usluge", icon: "🔧" },
  works: { label: "Radovi", icon: "🏗️" },
  concession: { label: "Koncesija", icon: "📜" },
  ppp: { label: "JPP", icon: "🤝" },
};

const PROCEDURE_CONFIG: Record<string, { label: string; description: string }> =
  {
    open: {
      label: "Otvoreni postupak",
      description: "Svi zainteresovani ponuđači mogu podneti ponudu",
    },
    restricted: {
      label: "Ograničeni postupak",
      description: "Samo pozvani ponuđači mogu učestvovati",
    },
    negotiated: {
      label: "Pregovarački postupak",
      description: "Direktni pregovori sa ponuđačima",
    },
    competitive_dialogue: {
      label: "Kompetitivni dijalog",
      description: "Složeni projekti sa više faza",
    },
    framework: {
      label: "Okvirni sporazum",
      description: "Dugoročni ugovor za ponavljajuće nabavke",
    },
    below_threshold: {
      label: "Ispod praga",
      description: "Nabavka ispod praga za javnu nabavku",
    },
  };

const SECTOR_CONFIG: Record<string, { label: string; icon: string }> = {
  it: { label: "IT & Telekomunikacije", icon: "💻" },
  construction: { label: "Građevinarstvo", icon: "🏗️" },
  health: { label: "Zdravstvo", icon: "🏥" },
  education: { label: "Obrazovanje", icon: "📚" },
  transport: { label: "Transport", icon: "🚛" },
  energy: { label: "Energetika", icon: "⚡" },
  defense: { label: "Odbrana", icon: "🛡️" },
  agriculture: { label: "Poljoprivreda", icon: "🌾" },
  environment: { label: "Zaštita životne sredine", icon: "🌱" },
  finance: { label: "Finansije", icon: "🏦" },
  other: { label: "Ostalo", icon: "📋" },
};

const BIDDER_STATUS: Record<string, { label: string; color: string }> = {
  invited: { label: "Pozvan", color: "bg-gray-100 text-gray-700" },
  submitted: { label: "Podneo", color: "bg-blue-100 text-blue-700" },
  qualified: { label: "Kvalifikovan", color: "bg-green-100 text-green-700" },
  winner: { label: "Dobitnik", color: "bg-emerald-100 text-emerald-700" },
  disqualified: { label: "Diskvalifikovan", color: "bg-red-100 text-red-700" },
};

const formatCurrency = (val: number, curr: string = "RSD") => {
  if (curr === "EUR")
    return `€${val.toLocaleString("sr-RS", { minimumFractionDigits: 2 })}`;
  return `${val.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD`;
};

// ============ MOCK DATA ============

const mockTenders: Tender[] = [
  {
    id: "tnd-1",
    number: "JN-2025-001",
    title: "Nabavka server opreme za Data Center",
    description:
      "Nabavka 10 servera za potrebe novog Data Centra u Beogradu. Konfiguracija: 2x CPU, 256GB RAM, 4x 2TB NVMe.",
    type: "goods",
    procedureType: "open",
    status: "evaluation",
    priority: "high",
    sector: "it",
    buyerName: "Ministarstvo finansija",
    buyerPib: "100123456",
    buyerAddress: "Nemanjina 22, Beograd",
    estimatedValue: 15000000,
    currency: "RSD",
    cpvCode: "30200000-3",
    deadlineSubmission: "2025-01-25T23:59:00",
    deadlineClarification: "2025-01-15T23:59:00",
    openingDate: "2025-01-28T10:00:00",
    awardDate: "",
    contractSigningDate: "",
    requirements: [
      "Garancija minimum 3 godine",
      "SLA 99.9%",
      "Instalacija uključena",
      "Podrška 24/7",
    ],
    criteria: [
      { id: "c1", name: "Cena", weight: 40, type: "price" },
      {
        id: "c2",
        name: "Tehničke karakteristike",
        weight: 30,
        type: "technical",
      },
      { id: "c3", name: "Garancija i podrška", weight: 20, type: "quality" },
      { id: "c4", name: "Iskustvo ponuđača", weight: 10, type: "experience" },
    ],
    bidders: [
      {
        id: "b1",
        name: "Tech Solutions d.o.o.",
        pib: "200123456",
        price: 14500000,
        score: 87,
        status: "qualified",
        submittedAt: "2025-01-24T16:00:00",
        disqualified: false,
        disqualificationReason: "",
      },
      {
        id: "b2",
        name: "IT Systems d.o.o.",
        pib: "200789012",
        price: 15200000,
        score: 82,
        status: "qualified",
        submittedAt: "2025-01-25T10:00:00",
        disqualified: false,
        disqualificationReason: "",
      },
      {
        id: "b3",
        name: "DataCore d.o.o.",
        pib: "200345678",
        price: 13800000,
        score: 91,
        status: "winner",
        submittedAt: "2025-01-24T14:30:00",
        disqualified: false,
        disqualificationReason: "",
      },
    ],
    winnerId: "b3",
    notes: "DataCore ima najbolji odnos cena/kvalitet.",
    publishedAt: "2025-01-05T08:00:00",
    createdAt: "2025-01-04T10:00:00",
    updatedAt: "2025-01-28T11:00:00",
    timeline: [
      {
        id: "e1",
        action: "Objavljen",
        description: "Tender objavljen na portalu",
        performedBy: "Admin",
        timestamp: "2025-01-05T08:00:00",
      },
      {
        id: "e2",
        action: "Rok za razjašnjenje",
        description: "Rok za postavljanje pitanja",
        performedBy: "Sistem",
        timestamp: "2025-01-15T23:59:00",
      },
      {
        id: "e3",
        action: "Zatvorena prijava",
        description: "Rok za podnošenje ponuda",
        performedBy: "Sistem",
        timestamp: "2025-01-25T23:59:00",
      },
      {
        id: "e4",
        action: "Otvaranje ponuda",
        description: "Javno otvaranje ponuda",
        performedBy: "Komisija",
        timestamp: "2025-01-28T10:00:00",
      },
    ],
  },
  {
    id: "tnd-2",
    number: "JN-2025-002",
    title: "Izgradnja vrtića u Novom Sadu",
    description:
      "Kompletna izgradnja vrtića kapaciteta 120 dece, sa igralištem i parkingom.",
    type: "works",
    procedureType: "open",
    status: "published",
    priority: "high",
    sector: "construction",
    buyerName: "Gradska uprava Novi Sad",
    buyerPib: "100456789",
    buyerAddress: "Trg slobode 1, Novi Sad",
    estimatedValue: 85000000,
    currency: "RSD",
    cpvCode: "45200000-5",
    deadlineSubmission: "2025-02-20T23:59:00",
    deadlineClarification: "2025-02-05T23:59:00",
    openingDate: "2025-02-25T10:00:00",
    awardDate: "",
    contractSigningDate: "",
    requirements: [
      "Sertifikat ISO 9001",
      "Min 3 slična projekta u poslednjih 5 godina",
      "Garancija 5 godina",
      "Ročno osiguranje",
    ],
    criteria: [
      { id: "c5", name: "Cena", weight: 50, type: "price" },
      { id: "c6", name: "Tehničko rešenje", weight: 25, type: "technical" },
      { id: "c7", name: "Rok izgradnje", weight: 15, type: "time" },
      { id: "c8", name: "Reference", weight: 10, type: "experience" },
    ],
    bidders: [],
    winnerId: null,
    notes: "",
    publishedAt: "2025-01-10T08:00:00",
    createdAt: "2025-01-08T10:00:00",
    updatedAt: "2025-01-10T08:00:00",
    timeline: [
      {
        id: "e5",
        action: "Objavljen",
        description: "Tender objavljen",
        performedBy: "Admin",
        timestamp: "2025-01-10T08:00:00",
      },
    ],
  },
  {
    id: "tnd-3",
    number: "JN-2024-015",
    title: "Servisiranje medicinske opreme — KBC",
    description:
      "Godišnji servis i održavanje medicinske opreme za Klinički centar.",
    type: "services",
    procedureType: "negotiated",
    status: "contract_signed",
    priority: "medium",
    sector: "health",
    buyerName: "KBC Beograd",
    buyerPib: "100987654",
    buyerAddress: "Višegradska 26, Beograd",
    estimatedValue: 5000000,
    currency: "RSD",
    cpvCode: "50400000-2",
    deadlineSubmission: "2024-11-15T23:59:00",
    deadlineClarification: "2024-11-01T23:59:00",
    openingDate: "2024-11-18T10:00:00",
    awardDate: "2024-12-01",
    contractSigningDate: "2024-12-15",
    requirements: [
      "Licence za medicinsku opremu",
      "Sertifikovan serviser",
      "Dostupnost delova",
    ],
    criteria: [
      { id: "c9", name: "Cena", weight: 35, type: "price" },
      { id: "c10", name: "Kvalitet servisa", weight: 35, type: "quality" },
      { id: "c11", name: "Vreme odziva", weight: 30, type: "time" },
    ],
    bidders: [
      {
        id: "b4",
        name: "MedServis d.o.o.",
        pib: "200111222",
        price: 4200000,
        score: 89,
        status: "winner",
        submittedAt: "2024-11-14T12:00:00",
        disqualified: false,
        disqualificationReason: "",
      },
      {
        id: "b5",
        name: "HealthTech d.o.o.",
        pib: "200333444",
        price: 4800000,
        score: 78,
        status: "qualified",
        submittedAt: "2024-11-15T09:00:00",
        disqualified: false,
        disqualificationReason: "",
      },
    ],
    winnerId: "b4",
    notes: "Ugovor potpisan na 2 godine.",
    publishedAt: "2024-10-20T08:00:00",
    createdAt: "2024-10-18T10:00:00",
    updatedAt: "2024-12-15T16:00:00",
    timeline: [
      {
        id: "e6",
        action: "Objavljen",
        description: "Tender objavljen",
        performedBy: "Admin",
        timestamp: "2024-10-20T08:00:00",
      },
      {
        id: "e7",
        action: "Dodeljen",
        description: "Ponuđač MedServis d.o.o. odabran",
        performedBy: "Komisija",
        timestamp: "2024-12-01T14:00:00",
      },
      {
        id: "e8",
        action: "Ugovor",
        description: "Ugovor potpisan",
        performedBy: "Admin",
        timestamp: "2024-12-15T16:00:00",
      },
    ],
  },
  {
    id: "tnd-4",
    number: "JN-2025-003",
    title: "Nabavka办公si softvera za javnu upravu",
    description:
      "Licence za Office softver za 500 radnih stanica u državnoj upravi.",
    type: "goods",
    procedureType: "framework",
    status: "draft",
    priority: "low",
    sector: "it",
    buyerName: "Ministarstvo javne uprave",
    buyerPib: "100654321",
    buyerAddress: "Kneza Miloša 19, Beograd",
    estimatedValue: 8000000,
    currency: "RSD",
    cpvCode: "48000000-8",
    deadlineSubmission: "",
    deadlineClarification: "",
    openingDate: "",
    awardDate: "",
    contractSigningDate: "",
    requirements: [],
    criteria: [],
    bidders: [],
    winnerId: null,
    notes: "U pripremi — čeka odobrenje budžeta.",
    publishedAt: null,
    createdAt: "2025-01-18T10:00:00",
    updatedAt: "2025-01-18T10:00:00",
    timeline: [
      {
        id: "e9",
        action: "Kreiran",
        description: "Tender kreiran u režimu pripreme",
        performedBy: "Admin",
        timestamp: "2025-01-18T10:00:00",
      },
    ],
  },
  {
    id: "tnd-5",
    number: "JN-2024-012",
    title: "Održavanje puteva — Opština Zemun",
    description:
      "Zimsko održavanje i popravke puteva na teritoriji opštine Zemun.",
    type: "works",
    procedureType: "below_threshold",
    status: "cancelled",
    priority: "medium",
    sector: "transport",
    buyerName: "Opština Zemun",
    buyerPib: "100777888",
    buyerAddress: "Glavna 1, Zemun",
    estimatedValue: 3000000,
    currency: "RSD",
    cpvCode: "45230000-9",
    deadlineSubmission: "2024-10-01T23:59:00",
    deadlineClarification: "",
    openingDate: "",
    awardDate: "",
    contractSigningDate: "",
    requirements: ["Licenca za rad na putevima"],
    criteria: [],
    bidders: [],
    winnerId: null,
    notes: "Otkazano zbog nedostatka budžeta.",
    publishedAt: "2024-09-10T08:00:00",
    createdAt: "2024-09-08T10:00:00",
    updatedAt: "2024-09-25T10:00:00",
    timeline: [
      {
        id: "e10",
        action: "Objavljen",
        description: "Tender objavljen",
        performedBy: "Admin",
        timestamp: "2024-09-10T08:00:00",
      },
      {
        id: "e11",
        action: "Otkazan",
        description: "Tender otkazan — nedostatak budžeta",
        performedBy: "Admin",
        timestamp: "2024-09-25T10:00:00",
      },
    ],
  },
];

const mockStats: TenderStats = {
  total: 48,
  open: 5,
  inEvaluation: 3,
  awarded: 32,
  cancelled: 8,
  totalValue: 125000000,
  avgBidders: 4.2,
  byType: [
    { type: "goods", count: 20, label: "Roba" },
    { type: "services", count: 15, label: "Usluge" },
    { type: "works", count: 10, label: "Radovi" },
    { type: "concession", count: 3, label: "Koncesija" },
  ],
  bySector: [
    { sector: "it", count: 14, label: "IT & Telecom" },
    { sector: "construction", count: 12, label: "Građevinarstvo" },
    { sector: "health", count: 8, label: "Zdravstvo" },
    { sector: "transport", count: 6, label: "Transport" },
    { sector: "education", count: 4, label: "Obrazovanje" },
    { sector: "energy", count: 2, label: "Energetika" },
    { sector: "other", count: 2, label: "Ostalo" },
  ],
  byStatus: [
    { status: "draft", count: 3, label: "Priprema" },
    { status: "published", count: 5, label: "Objavljeni" },
    { status: "clarification", count: 2, label: "Razjašnjenje" },
    { status: "evaluation", count: 3, label: "Evaluacija" },
    { status: "awarded", count: 24, label: "Dodeljeni" },
    { status: "contract_signed", count: 8, label: "Potpisani" },
    { status: "cancelled", count: 8, label: "Otkazani" },
  ],
  monthlyTrend: [
    { month: "Avg", opened: 6, awarded: 4, cancelled: 1 },
    { month: "Sep", opened: 8, awarded: 5, cancelled: 2 },
    { month: "Okt", opened: 7, awarded: 6, cancelled: 1 },
    { month: "Nov", opened: 5, awarded: 7, cancelled: 1 },
    { month: "Dec", opened: 3, awarded: 4, cancelled: 2 },
    { month: "Jan", opened: 4, awarded: 3, cancelled: 1 },
  ],
  topBuyers: [
    { buyer: "Ministarstvo finansija", count: 8, value: 35000000 },
    { buyer: "Gradska uprava Beograd", count: 6, value: 28000000 },
    { buyer: "KBC Beograd", count: 5, value: 18000000 },
    { buyer: "Ministarstvo odbrane", count: 4, value: 22000000 },
    { buyer: "JP Putevi Srbije", count: 3, value: 12000000 },
  ],
  upcomingDeadlines: [
    {
      id: "tnd-1",
      title: "Nabavka server opreme",
      deadline: "2025-01-25T23:59:00",
      daysLeft: 3,
    },
    {
      id: "tnd-2",
      title: "Izgradnja vrtića NS",
      deadline: "2025-02-20T23:59:00",
      daysLeft: 29,
    },
  ],
};

// ============ COMPONENT ============

export function Natečaji() {
  const { activeCompanyId } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const [detailOpen, setDetailOpen] = useState(false);

  const emptyForm = {
    title: "",
    description: "",
    type: "goods",
    procedureType: "open",
    sector: "it",
    priority: "medium",
    buyerName: "",
    buyerPib: "",
    estimatedValue: "",
    currency: "RSD",
    cpvCode: "",
    deadlineSubmission: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const emptyBidder = { name: "", pib: "", price: "" };
  const [bidderForm, setBidderForm] = useState(emptyBidder);

  const loadTenders = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tenders?companyId=${activeCompanyId}&limit=100`,
      );
      if (res.ok) {
        const d = await res.json();
        setTenders(d.items?.length ? d.items : mockTenders);
      } else {
        setTenders(mockTenders);
      }
    } catch {
      setTenders(mockTenders);
    }
    setLoading(false);
  }, [activeCompanyId]);

  const loadStats = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(
        `/api/tenders/stats?companyId=${activeCompanyId}`,
      );
      if (res.ok) {
        const d = await res.json();
        setStats(d);
      } else {
        setStats(mockStats);
      }
    } catch {
      setStats(mockStats);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadTenders();
    loadStats();
  }, [activeCompanyId, loadTenders, loadStats]);

  const filtered = tenders.filter((tn) => {
    if (
      activeTab === "active" &&
      (tn.status === "awarded" ||
        tn.status === "contract_signed" ||
        tn.status === "cancelled")
    )
      return false;
    if (
      activeTab === "awarded" &&
      tn.status !== "awarded" &&
      tn.status !== "contract_signed"
    )
      return false;
    if (activeTab === "cancelled" && tn.status !== "cancelled") return false;
    if (activeTab === "draft" && tn.status !== "draft") return false;
    if (statusFilter !== "all" && tn.status !== statusFilter) return false;
    if (typeFilter !== "all" && tn.type !== typeFilter) return false;
    if (sectorFilter !== "all" && tn.sector !== sectorFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        tn.number.toLowerCase().includes(s) ||
        tn.title.toLowerCase().includes(s) ||
        tn.buyerName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleCreate = async () => {
    if (!activeCompanyId || !form.title.trim()) return;
    try {
      const res = await fetch("/api/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          estimatedValue: parseFloat(form.estimatedValue) || 0,
          status: "draft",
        }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(emptyForm);
        loadTenders();
        loadStats();
        toast.success("Tender kreiran");
      }
    } catch {
      /* silent */
    }
  };

  const handleStatusChange = async (tender: Tender, newStatus: string) => {
    try {
      const res = await fetch("/api/tenders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tender.id, status: newStatus }),
      });
      if (res.ok) {
        loadTenders();
        loadStats();
        toast.success(`Status: ${STATUS_CONFIG[newStatus]?.label}`);
      }
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Obrisati tender?")) return;
    await fetch(`/api/tenders?id=${id}`, { method: "DELETE" });
    loadTenders();
    loadStats();
  };

  const handleAddBidder = () => {
    if (!selected || !bidderForm.name.trim()) return;
    const newBidder: TenderBidder = {
      id: `b-${Date.now()}`,
      name: bidderForm.name,
      pib: bidderForm.pib,
      price: parseFloat(bidderForm.price) || 0,
      score: 0,
      status: "submitted",
      submittedAt: new Date().toISOString(),
      disqualified: false,
      disqualificationReason: "",
    };
    setSelected({ ...selected, bidders: [...selected.bidders, newBidder] });
    setBidderForm(emptyBidder);
    setBidderOpen(false);
  };

  const handleAward = (tender: Tender, bidderId: string) => {
    const updatedBidders = tender.bidders.map((b) => ({
      ...b,
      status:
        b.id === bidderId
          ? "winner"
          : b.status === "winner"
            ? "qualified"
            : b.status,
    }));
    setSelected({
      ...tender,
      winnerId: bidderId,
      bidders: updatedBidders,
      status: "awarded",
    });
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Natečaji</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje tenderima, javnim nabavkama i konkursima
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadTenders();
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
            <Plus className="h-4 w-4 mr-1" /> Novi tender
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="active">
            <Gavel className="h-4 w-4 mr-1" /> Aktivni
          </TabsTrigger>
          <TabsTrigger value="awarded">
            <Trophy className="h-4 w-4 mr-1" /> Dodeljeni
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            <XCircle className="h-4 w-4 mr-1" /> Otkazani
          </TabsTrigger>
          <TabsTrigger value="draft">
            <FileText className="h-4 w-4 mr-1" /> Priprema
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
                    <Gavel className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.open + stats.inEvaluation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingDeadlines.length} uskoro rok
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Dodeljeni
                    </span>
                    <Trophy className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.awarded}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    prosek {stats.avgBidders} ponuđača
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Ukupna vrednost
                    </span>
                    <Banknote className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Otkazani
                    </span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.cancelled}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0
                      ? Math.round((stats.cancelled / stats.total) * 100)
                      : 0}
                    %
                  </p>
                </Card>
              </div>

              {/* Upcoming Deadlines */}
              {stats.upcomingDeadlines.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Uskoro ističu rokovi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.upcomingDeadlines.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{d.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Rok: {formatDate(d.deadline)}
                          </p>
                        </div>
                        <Badge
                          variant={d.daysLeft <= 5 ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {d.daysLeft} dana
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Po tipu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byType.map((tp) => {
                      const cfg = TYPE_CONFIG[tp.type];
                      const max = Math.max(...stats.byType.map((t) => t.count));
                      return (
                        <div key={tp.type} className="flex items-center gap-3">
                          <span className="text-sm w-6">{cfg?.icon}</span>
                          <span className="text-xs w-24">{tp.label}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${(tp.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">
                            {tp.count}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Po sektoru</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.bySector.map((s) => {
                      const cfg = SECTOR_CONFIG[s.sector];
                      const max = Math.max(
                        ...stats.bySector.map((x) => x.count),
                      );
                      return (
                        <div key={s.sector} className="flex items-center gap-3">
                          <span className="text-sm w-6">{cfg?.icon}</span>
                          <span className="text-xs w-28 truncate">
                            {s.label}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${(s.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">
                            {s.count}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Mesečni trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 h-36">
                    {stats.monthlyTrend.map((m) => {
                      const max = Math.max(
                        ...stats.monthlyTrend.map((x) =>
                          Math.max(x.opened, x.awarded),
                        ),
                      );
                      return (
                        <div
                          key={m.month}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full flex gap-0.5 items-end justify-center"
                            style={{ height: "110px" }}
                          >
                            <div
                              className="w-3 bg-blue-400 rounded-t"
                              style={{
                                height: `${max > 0 ? (m.opened / max) * 100 : 0}%`,
                              }}
                              title={`Otvoreni: ${m.opened}`}
                            />
                            <div
                              className="w-3 bg-green-400 rounded-t"
                              style={{
                                height: `${max > 0 ? (m.awarded / max) * 100 : 0}%`,
                              }}
                              title={`Dodeljeni: ${m.awarded}`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {m.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded" />{" "}
                      Otvoreni
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded" />{" "}
                      Dodeljeni
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Buyers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Najveći naručioci</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.topBuyers.map((b, i) => (
                    <div key={b.buyer} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-5 text-muted-foreground">
                        {i + 1}.
                      </span>
                      <span className="text-xs flex-1 truncate">{b.buyer}</span>
                      <Badge variant="outline" className="text-xs">
                        {b.count}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-24 text-right">
                        {formatCurrency(b.value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* LIST TABS */}
        {["active", "awarded", "cancelled", "draft"].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži tendere..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.icon} {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sektor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi sektori</SelectItem>
                  {Object.entries(SECTOR_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.icon} {v.label}
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
                <Gavel className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema tendera</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((tn) => {
                  const sCfg = STATUS_CONFIG[tn.status];
                  const tCfg = TYPE_CONFIG[tn.type];
                  const sCfg2 = SECTOR_CONFIG[tn.sector];
                  const daysLeft = getDaysLeft(tn.deadlineSubmission);
                  return (
                    <Card
                      key={tn.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelected(tn);
                        setDetailOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">
                                {tn.number}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${sCfg?.color}`}
                              >
                                {sCfg?.label}
                              </Badge>
                              <span className="text-xs">
                                {tCfg?.icon} {tCfg?.label}
                              </span>
                              <span className="text-xs">
                                {sCfg2?.icon} {sCfg2?.label}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium">{tn.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {tn.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {tn.buyerName}
                              </span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(tn.estimatedValue, tn.currency)}
                              </span>
                              {daysLeft !== null && daysLeft > 0 && (
                                <span
                                  className={
                                    daysLeft <= 5
                                      ? "text-red-500 font-medium"
                                      : ""
                                  }
                                >
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {daysLeft} dana
                                </span>
                              )}
                              {tn.bidders.length > 0 && (
                                <span>
                                  <Users className="h-3 w-3 inline mr-1" />
                                  {tn.bidders.length} ponuđača
                                </span>
                              )}
                            </div>
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

    </div>
  );
}
