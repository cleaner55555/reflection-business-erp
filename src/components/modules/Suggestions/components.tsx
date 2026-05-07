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
import { Progress } from "@/components/ui/progress";
  Plus,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Users,
  Star,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { toast } from "sonner";

// ============ TYPES ============

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  authorName: string;
  authorId: string;
  authorDept: string;
  votesFor: number;
  votesAgainst: number;
  userVote: "for" | "against" | null;
  comments: number;
  createdAt: string;
  updatedAt: string;
  implementedAt: string | null;
  estimatedSaving: number | null;
  implementerName: string | null;
  rejectionReason: string | null;
}

interface SuggestionStats {
  total: number;
  pending: number;
  approved: number;
  implemented: number;
  rejected: number;
  totalVotes: number;
  avgResolutionDays: number;
  categoryBreakdown: Array<{ category: string; count: number; color: string }>;
  monthlyTrend: Array<{
    month: string;
    submitted: number;
    implemented: number;
  }>;
  topContributors: Array<{
    name: string;
    dept: string;
    count: number;
    implemented: number;
  }>;
  deptBreakdown: Array<{
    dept: string;
    total: number;
    implemented: number;
    rate: number;
  }>;
  implementationRate: number;
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Na čekanju",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: "Odobreno",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  implemented: {
    label: "Realizovano",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Odbijeno",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  kvalitet: {
    label: "Kvalitet",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  proces: {
    label: "Proces",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  safety: {
    label: "Bezbednost",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  troskovi: {
    label: "Troškovi",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  organizacija: {
    label: "Organizacija",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: {
    label: "Nizak",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  medium: {
    label: "Srednji",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  high: {
    label: "Visok",
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  critical: {
    label: "Kritičan",
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

const formatCurrency = (val: number) =>
  `${val.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD`;

// ============ MOCK DATA ============

const mockSuggestions: Suggestion[] = [
  {
    id: "s-1",
    title: "Automatizacija pakovanja proizvoda serije A",
    description:
      "Predlažem uvođenje poluautomatske linije za pakovanje proizvoda serije A koja bi smanjila vreme pakovanja za 40% i reducirala greške u etiketiranju. Trenutno se ručno pakuje prosečno 500 jedinica dnevno sa 3% grešaka.",
    category: "proces",
    priority: "high",
    status: "approved",
    authorName: "Marko Petrović",
    authorId: "emp-1",
    authorDept: "Proizvodnja",
    votesFor: 24,
    votesAgainst: 3,
    userVote: "for",
    comments: 8,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-18",
    implementedAt: null,
    estimatedSaving: 1500000,
    implementerName: null,
    rejectionReason: null,
  },
  {
    id: "s-2",
    title: "Uvođenje 5S metode u radionici 3",
    description:
      "Primena 5S metodologije (Sort, Set, Shine, Standardize, Sustain) u radionici 3 bi značajno poboljšala organizaciju radnog prostora, smanjila vreme traženja alata i smanjila rizik od nesreća.",
    category: "organizacija",
    priority: "medium",
    status: "implemented",
    authorName: "Jelena Nikolić",
    authorId: "emp-2",
    authorDept: "Proizvodnja",
    votesFor: 31,
    votesAgainst: 2,
    userVote: "for",
    comments: 12,
    createdAt: "2024-11-05",
    updatedAt: "2025-01-15",
    implementedAt: "2025-01-15",
    estimatedSaving: 350000,
    implementerName: "Jelena Nikolić",
    rejectionReason: null,
  },
  {
    id: "s-3",
    title: "Zamena PVC ambalaže ekološkim materijalima",
    description:
      "Predlažem postepenu zamenu PVC ambalaže za proizvode iz kategorije hrane sa biodegradabilnim alternativama (PLA). To bi poboljšalo imidž kompanije i zadovoljilo nove ekološke standarde EU.",
    category: "kvalitet",
    priority: "high",
    status: "pending",
    authorName: "Ana Stanković",
    authorId: "emp-3",
    authorDept: "Kvalitet",
    votesFor: 18,
    votesAgainst: 7,
    userVote: null,
    comments: 15,
    createdAt: "2025-01-20",
    updatedAt: "2025-01-20",
    implementedAt: null,
    estimatedSaving: 0,
    implementerName: null,
    rejectionReason: null,
  },
  {
    id: "s-4",
    title: "Servisni protokol za mašine CNC br. 7 i 12",
    description:
      "Mašine CNC br. 7 i 12 imaju učestale kvarove poslednjih 6 meseci (prosečno 3 nedelje zastoja/mesec). Predlažem uvođenje preventivnog održavanja po ISO 55001 standardu sa nedeljnim kontrolama.",
    category: "safety",
    priority: "critical",
    status: "approved",
    authorName: "Nenad Jović",
    authorId: "emp-4",
    authorDept: "Održavanje",
    votesFor: 35,
    votesAgainst: 0,
    userVote: "for",
    comments: 6,
    createdAt: "2025-01-08",
    updatedAt: "2025-01-16",
    implementedAt: null,
    estimatedSaving: 800000,
    implementerName: null,
    rejectionReason: null,
  },
  {
    id: "s-5",
    title: "Prebacivanje na LED rasvetu u svim objektima",
    description:
      "Zamena trenutne fluorescentne rasvete sa LED panelima bi smanjila potrošnju struje za osvetljenje za oko 60%. Procenjeni ROI je 14 meseci uz trenutne cene struje.",
    category: "troskovi",
    priority: "medium",
    status: "implemented",
    authorName: "Ivan Đorđević",
    authorId: "emp-5",
    authorDept: "Administracija",
    votesFor: 28,
    votesAgainst: 1,
    userVote: "for",
    comments: 4,
    createdAt: "2024-09-15",
    updatedAt: "2024-12-20",
    implementedAt: "2024-12-20",
    estimatedSaving: 420000,
    implementerName: "Ivan Đorđević",
    rejectionReason: null,
  },
  {
    id: "s-6",
    title: "Digitalizacija nalogа za internu potrošnju",
    description:
      "Trenutno se interni nalozi za potrošnju (kancelarijski materijal, gorivo, alati) popunjavaju na papiru. Predlažem uvođenje digitalnog obrasca sa odobrenjima putem aplikacije, što bi ubrzalo proces za 70%.",
    category: "proces",
    priority: "medium",
    status: "pending",
    authorName: "Sara Kovačević",
    authorId: "emp-6",
    authorDept: "Administracija",
    votesFor: 15,
    votesAgainst: 4,
    userVote: null,
    comments: 7,
    createdAt: "2025-01-22",
    updatedAt: "2025-01-22",
    implementedAt: null,
    estimatedSaving: 200000,
    implementerName: null,
    rejectionReason: null,
  },
  {
    id: "s-7",
    title: "Obuka za rukovaoce viljuškara - godišnja recertifikacija",
    description:
      "Prema novim propisima o bezbednosti na radu, svi rukovaoci viljuškara moraju proći godišnju recertifikaciju. Trenutno imamo 12 rukovlalaca bez važećeg sertifikata.",
    category: "safety",
    priority: "critical",
    status: "implemented",
    authorName: "Dragan Milić",
    authorId: "emp-7",
    authorDept: "Bezbednost",
    votesFor: 32,
    votesAgainst: 0,
    userVote: "for",
    comments: 3,
    createdAt: "2024-12-01",
    updatedAt: "2025-01-10",
    implementedAt: "2025-01-10",
    estimatedSaving: 0,
    implementerName: "Dragan Milić",
    rejectionReason: null,
  },
  {
    id: "s-8",
    title: "Smanjenje količine OTP pakovanja za transport",
    description:
      "Analiza pokazuje da koristimo 30% više pakovnog materijala nego što je neophodno za bezbedan transport. Predlažem optimizaciju dimenzija kartona i uvođenje plenuma umesto punjenja penom.",
    category: "troskovi",
    priority: "low",
    status: "rejected",
    authorName: "Milan Simić",
    authorId: "emp-8",
    authorDept: "Logistika",
    votesFor: 10,
    votesAgainst: 12,
    userVote: "against",
    comments: 9,
    createdAt: "2024-10-20",
    updatedAt: "2024-11-15",
    implementedAt: null,
    estimatedSaving: 280000,
    implementerName: null,
    rejectionReason:
      "Procena rizika pokazuje povećanu verovatnoću oštećenja robe u transportu za 12%. Neophodno dodatno testiranje.",
  },
  {
    id: "s-9",
    title: "Uvođenje dnevnog stand-up sastanka u timu za razvoj",
    description:
      "Predlažem uvođenje 15-minutnih dnevnih stand-up sastanaka (9:00h) u timu za razvoj softvera radi bolje koordinacije, bržeg rešavanja blokera i transparentnosti napretka projekata.",
    category: "organizacija",
    priority: "low",
    status: "implemented",
    authorName: "Marko Petrović",
    authorId: "emp-1",
    authorDept: "IT",
    votesFor: 14,
    votesAgainst: 6,
    userVote: "for",
    comments: 11,
    createdAt: "2024-08-10",
    updatedAt: "2024-09-01",
    implementedAt: "2024-09-01",
    estimatedSaving: 0,
    implementerName: "Marko Petrović",
    rejectionReason: null,
  },
  {
    id: "s-10",
    title: "Kontrola kvaliteta - dodatni check-point pre pakovanja",
    description:
      "Predlažem dodavanje još jedne tačke kontrole kvaliteta neposredno pre pakovanja finalnih proizvoda. Trenutni broj reklamacija (2.3%) bi se mogao smanjiti na ispod 1% sa ovom merom.",
    category: "kvalitet",
    priority: "high",
    status: "pending",
    authorName: "Ana Stanković",
    authorId: "emp-3",
    authorDept: "Kvalitet",
    votesFor: 22,
    votesAgainst: 5,
    userVote: "for",
    comments: 5,
    createdAt: "2025-01-25",
    updatedAt: "2025-01-25",
    implementedAt: null,
    estimatedSaving: 600000,
    implementerName: null,
    rejectionReason: null,
  },
];

const mockStats: SuggestionStats = {
  total: 10,
  pending: 4,
  approved: 2,
  implemented: 4,
  rejected: 1,
  totalVotes: 229,
  avgResolutionDays: 18.5,
  implementationRate: 40,
  categoryBreakdown: [
    { category: "kvalitet", count: 2, color: "bg-green-500" },
    { category: "proces", count: 2, color: "bg-blue-500" },
    { category: "safety", count: 2, color: "bg-red-500" },
    { category: "troskovi", count: 2, color: "bg-amber-500" },
    { category: "organizacija", count: 2, color: "bg-purple-500" },
  ],
  monthlyTrend: [
    { month: "Avg", submitted: 3, implemented: 1 },
    { month: "Sep", submitted: 2, implemented: 1 },
    { month: "Okt", submitted: 2, implemented: 0 },
    { month: "Nov", submitted: 1, implemented: 1 },
    { month: "Dec", submitted: 2, implemented: 1 },
    { month: "Jan", submitted: 4, implemented: 0 },
  ],
  topContributors: [
    { name: "Marko Petrović", dept: "Proizvodnja", count: 2, implemented: 1 },
    { name: "Ana Stanković", dept: "Kvalitet", count: 2, implemented: 0 },
    { name: "Nenad Jović", dept: "Održavanje", count: 1, implemented: 0 },
    { name: "Jelena Nikolić", dept: "Proizvodnja", count: 1, implemented: 1 },
    { name: "Ivan Đorđević", dept: "Administracija", count: 1, implemented: 1 },
  ],
  deptBreakdown: [
    { dept: "Proizvodnja", total: 3, implemented: 2, rate: 67 },
    { dept: "Kvalitet", total: 2, implemented: 0, rate: 0 },
    { dept: "Održavanje", total: 1, implemented: 0, rate: 0 },
    { dept: "Administracija", total: 2, implemented: 1, rate: 50 },
    { dept: "Bezbednost", total: 1, implemented: 1, rate: 100 },
    { dept: "Logistika", total: 1, implemented: 0, rate: 0 },
  ],
};

// ============ COMPONENT ============

export function PredloziContent() {
  const { activeCompanyId, currentUser } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [search, setSearch] = useState("");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);

  // Create form
  const emptyForm = {
    title: "",
    description: "",
    category: "kvalitet",
    priority: "medium",
    estimatedSaving: "",
  };
  const [form, setForm] = useState(emptyForm);

  // Comment dialog
  const [commentOpen, setCommentOpen] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/suggestions?companyId=${activeCompanyId}`);
      if (res.ok) {
        const d = await res.json();
        setSuggestions(d.suggestions?.length ? d.suggestions : mockSuggestions);
        setStats(d.stats || mockStats);
      } else {
        setSuggestions(mockSuggestions);
        setStats(mockStats);
      }
    } catch {
      setSuggestions(mockSuggestions);
      setStats(mockStats);
    }
    setLoading(false);
  }, [activeCompanyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current user ID for "Moji" tab
  const currentUserId = currentUser?.id || "emp-1";

  // Handle create
  const handleCreate = async () => {
    if (!activeCompanyId || !form.title.trim() || !form.description.trim())
      return;
    try {
      const body = {
        companyId: activeCompanyId,
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        estimatedSaving: parseFloat(form.estimatedSaving) || null,
      };
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm(emptyForm);
        loadData();
        toast.success("Predlog uspešno poslat");
      }
    } catch {
      // Fallback: add locally
      const newSuggestion: Suggestion = {
        id: `s-${Date.now()}`,
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: "pending",
        authorName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "Trenutni korisnik",
        authorId: currentUserId,
        authorDept: "IT",
        votesFor: 0,
        votesAgainst: 0,
        userVote: null,
        comments: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        implementedAt: null,
        estimatedSaving: parseFloat(form.estimatedSaving) || null,
        implementerName: null,
        rejectionReason: null,
      };
      setSuggestions((prev) => [newSuggestion, ...prev]);
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success("Predlog uspešno poslat");
    }
  };

  // Handle vote
  const handleVote = (id: string, voteType: "for" | "against") => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.userVote === voteType) {
          // Remove vote
          return {
            ...s,
            votesFor: voteType === "for" ? s.votesFor - 1 : s.votesFor,
            votesAgainst:
              voteType === "against" ? s.votesAgainst - 1 : s.votesAgainst,
            userVote: null,
          };
        }
        return {
          ...s,
          votesFor:
            voteType === "for"
              ? s.votesFor + (s.userVote === "against" ? 1 : 1)
              : s.userVote === "for"
                ? s.votesFor - 1
                : s.votesFor,
          votesAgainst:
            voteType === "against"
              ? s.votesAgainst + (s.userVote === "for" ? 1 : 1)
              : s.userVote === "against"
                ? s.votesAgainst - 1
                : s.votesAgainst,
          userVote: voteType,
        };
      }),
    );
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Predlog obrisan");
    if (selectedSuggestion?.id === id) {
      setDetailOpen(false);
      setSelectedSuggestion(null);
    }
  };

  // Handle status change
  const handleStatusChange = (id: string, newStatus: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: newStatus,
          updatedAt: new Date().toISOString().split("T")[0],
          implementedAt:
            newStatus === "implemented"
              ? new Date().toISOString().split("T")[0]
              : s.implementedAt,
        };
      }),
    );
    toast.success(`Status promenjen na: ${STATUS_CONFIG[newStatus]?.label}`);
  };

  // Add comment
  const handleAddComment = () => {
    if (!commentText.trim() || !commentingSuggestion) return;
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id !== commentingSuggestion.id) return s;
        return { ...s, comments: s.comments + 1 };
      }),
    );
    setCommentText("");
    setCommentOpen(false);
    setCommentingSuggestion(null);
    toast.success("Komentar dodat");
  };

  // Filtered suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (priorityFilter !== "all" && s.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // My suggestions
  const mySuggestions = suggestions.filter((s) => s.authorId === currentUserId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Predlozi</h1>
          <p className="text-sm text-muted-foreground">
            Sistem za upravljanje predlozima zaposlenih, poboljšanje procesa i
            inovacije
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Novi predlog
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Lightbulb className="h-4 w-4 mr-1" /> Predlozi
          </TabsTrigger>
          <TabsTrigger value="mine">
            <Star className="h-4 w-4 mr-1" /> Moji
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-1" /> Statistika
          </TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
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
                      Ukupno predloga
                    </span>
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.totalVotes} glasova ukupno
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Na čekanju
                    </span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.approved} odobreno
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Realizovano
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.implemented}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.implementationRate}% stopa realizacije
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Odbijeno
                    </span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Prosek {stats.avgResolutionDays} dana rešenja
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" /> Po kategorijama
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.categoryBreakdown.map((cb) => {
                      const cfg = CATEGORY_CONFIG[cb.category];
                      return (
                        <div
                          key={cb.category}
                          className="flex items-center gap-3"
                        >
                          <Badge
                            variant="outline"
                            className={`text-[10px] w-24 justify-center ${cfg?.bgColor} ${cfg?.color}`}
                          >
                            {cfg?.label}
                          </Badge>
                          <div className="flex-1 bg-muted rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${cb.color}`}
                              style={{
                                width: `${(cb.count / stats.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">
                            {cb.count}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Mesečni trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.monthlyTrend.map((m) => (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="text-xs w-10">{m.month}</span>
                        <div className="flex-1 grid grid-cols-2 gap-1">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${(m.submitted / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-blue-600 w-5">
                              {m.submitted}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-green-500"
                                style={{
                                  width: `${(m.implemented / 2) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[9px] text-green-600 w-5">
                              {m.implemented}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-4 rounded bg-blue-500" />
                        <span className="text-[9px] text-muted-foreground">
                          Predloženo
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-4 rounded bg-green-500" />
                        <span className="text-[9px] text-muted-foreground">
                          Realizovano
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" /> Top kontributori
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.topContributors.map((c, i) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                      >
                        <span className="text-xs font-bold w-5 text-muted-foreground">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.dept}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-[9px] mr-1">
                            {c.count} predloga
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          >
                            {c.implemented} realizovano
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Stopa realizacije
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          Ukupna stopa realizacije
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {stats.implementationRate}%
                        </span>
                      </div>
                      <Progress
                        value={stats.implementationRate}
                        className="h-3"
                      />
                    </div>
                    <div className="space-y-3 mt-4">
                      {stats.deptBreakdown.slice(0, 5).map((d) => (
                        <div key={d.dept} className="flex items-center gap-3">
                          <span className="text-xs w-28 truncate">
                            {d.dept}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${d.rate >= 50 ? "bg-green-500" : d.rate > 0 ? "bg-amber-500" : "bg-gray-300"}`}
                              style={{ width: `${d.rate}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium w-10 text-right">
                            {d.rate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== PREDLOZI ===== */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži predloge..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioritet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi prioriteti</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredSuggestions.length} predloga</span>
            {(statusFilter !== "all" ||
              categoryFilter !== "all" ||
              priorityFilter !== "all" ||
              search) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setPriorityFilter("all");
                  setSearch("");
                }}
              >
                <Filter className="h-3 w-3 mr-1" /> Poništi filtere
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredSuggestions.map((s) => {
              const sc = STATUS_CONFIG[s.status];
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${sc?.color}`}
                          >
                            {sc?.icon} {sc?.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${cc?.bgColor} ${cc?.color}`}
                          >
                            {cc?.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${pc?.color}`}
                          >
                            {pc?.label}
                          </Badge>
                        </div>
                        <h3
                          className="text-sm font-medium mb-1 cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedSuggestion(s);
                            setDetailOpen(true);
                          }}
                        >
                          {s.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {s.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {s.authorName}
                          </span>
                          <span>{s.authorDept}</span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(s.createdAt)}
                          </span>
                          {s.estimatedSaving && s.estimatedSaving > 0 && (
                            <span className="text-green-600 font-medium">
                              Ušteda: {formatCurrency(s.estimatedSaving)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Voting */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant={
                              s.userVote === "for" ? "default" : "outline"
                            }
                            size="sm"
                            className={`h-7 w-7 p-0 ${s.userVote === "for" ? "bg-green-600 hover:bg-green-700" : ""}`}
                            onClick={() => handleVote(s.id, "for")}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium min-w-[24px] text-center">
                            {s.votesFor}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /
                          </span>
                          <span className="text-xs font-medium min-w-[24px] text-center">
                            {s.votesAgainst}
                          </span>
                          <Button
                            variant={
                              s.userVote === "against" ? "default" : "outline"
                            }
                            size="sm"
                            className={`h-7 w-7 p-0 ${s.userVote === "against" ? "bg-red-600 hover:bg-red-700" : ""}`}
                            onClick={() => handleVote(s.id, "against")}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setSelectedSuggestion(s);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setCommentingSuggestion(s);
                              setCommentOpen(true);
                            }}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Badge variant="outline" className="text-[9px]">
                            {s.comments}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredSuggestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mb-3" />
                <p className="text-sm">Nema predloga koji odgovaraju filteru</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== MOJI ===== */}
        <TabsContent value="mine" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Predlozi koje ste poslali ({mySuggestions.length})
            </p>
            <Button
              size="sm"
              onClick={() => {
                setForm(emptyForm);
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Novi predlog
            </Button>
          </div>

          {mySuggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lightbulb className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Još niste poslali nijedan predlog
                </p>
                <p className="text-xs text-muted-foreground">
                  Podelite svoje ideje za poboljšanje poslovanja
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mySuggestions.map((s) => {
                const sc = STATUS_CONFIG[s.status];
                const totalVotes = s.votesFor + s.votesAgainst;
                const approvalPct =
                  totalVotes > 0
                    ? Math.round((s.votesFor / totalVotes) * 100)
                    : 0;
                return (
                  <Card
                    key={s.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedSuggestion(s);
                      setDetailOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${sc?.color}`}
                            >
                              {sc?.icon} {sc?.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${cc?.bgColor} ${cc?.color}`}
                            >
                              {cc?.label}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-medium mb-1">
                            {s.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {s.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Poslato: {formatDate(s.createdAt)}
                            </span>
                            {s.implementedAt && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Realizovano: {formatDate(s.implementedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {/* Vote score */}
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-bold">
                                {approvalPct}%
                              </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground">
                              {totalVotes} glasova
                            </p>
                          </div>
                          {/* Comments */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{s.comments}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* My summary card */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-3">
                    Pregled mojih predloga
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {mySuggestions.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Ukupno
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">
                        {
                          mySuggestions.filter((s) => s.status === "pending")
                            .length
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Na čekanju
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {
                          mySuggestions.filter(
                            (s) => s.status === "implemented",
                          ).length
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Realizovano
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {
                          mySuggestions.filter((s) => s.status === "rejected")
                            .length
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Odbijeno
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ===== STATISTIKA ===== */}
        <TabsContent value="stats" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Stopa realizacije
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.implementationRate}%
                  </p>
                  <Progress
                    value={stats.implementationRate}
                    className="h-2 mt-2"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {stats.implemented} od {stats.total} predloga
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Prosečno vreme rešenja
                    </span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {stats.avgResolutionDays}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    dana po predlogu
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Ukupna ušteda
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(
                      suggestions
                        .filter(
                          (s) =>
                            s.status === "implemented" && s.estimatedSaving,
                        )
                        .reduce((sum, s) => sum + (s.estimatedSaving || 0), 0),
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    od realizovanih predloga
                  </p>
                </Card>
              </div>

              {/* Implementation rate by category */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Stopa realizacije po
                    kategoriji
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                      const catSuggestions = suggestions.filter(
                        (s) => s.category === key,
                      );
                      const catTotal = catSuggestions.length;
                      const catImplemented = catSuggestions.filter(
                        (s) => s.status === "implemented",
                      ).length;
                      const catApproved = catSuggestions.filter(
                        (s) => s.status === "approved",
                      ).length;
                      const catRejected = catSuggestions.filter(
                        (s) => s.status === "rejected",
                      ).length;
                      const catRate =
                        catTotal > 0
                          ? Math.round((catImplemented / catTotal) * 100)
                          : 0;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${cfg.bgColor} ${cfg.color}`}
                              >
                                {cfg.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {catTotal} predloga
                              </span>
                            </div>
                            <span className="text-sm font-bold">
                              {catRate}%
                            </span>
                          </div>
                          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                            {catTotal > 0 && (
                              <>
                                <div
                                  className="bg-green-500 h-full transition-all"
                                  style={{
                                    width: `${(catImplemented / catTotal) * 100}%`,
                                  }}
                                />
                                <div
                                  className="bg-blue-500 h-full transition-all"
                                  style={{
                                    width: `${(catApproved / catTotal) * 100}%`,
                                  }}
                                />
                                <div
                                  className="bg-amber-500 h-full transition-all"
                                  style={{
                                    width: `${((catTotal - catImplemented - catApproved - catRejected) / catTotal) * 100}%`,
                                  }}
                                />
                                <div
                                  className="bg-red-400 h-full transition-all"
                                  style={{
                                    width: `${(catRejected / catTotal) * 100}%`,
                                  }}
                                />
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-green-600">
                              {catImplemented} realizovano
                            </span>
                            <span className="text-[9px] text-blue-600">
                              {catApproved} odobreno
                            </span>
                            <span className="text-[9px] text-amber-600">
                              {catTotal -
                                catImplemented -
                                catApproved -
                                catRejected}{" "}
                              na čekanju
                            </span>
                            {catRejected > 0 && (
                              <span className="text-[9px] text-red-500">
                                {catRejected} odbijeno
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Department breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> Podela po odeljenjima
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                            Odeljenje
                          </th>
                          <th className="text-center py-2 text-xs font-medium text-muted-foreground">
                            Ukupno
                          </th>
                          <th className="text-center py-2 text-xs font-medium text-muted-foreground">
                            Na čekanju
                          </th>
                          <th className="text-center py-2 text-xs font-medium text-muted-foreground">
                            Realizovano
                          </th>
                          <th className="text-center py-2 text-xs font-medium text-muted-foreground">
                            Odbijeno
                          </th>
                          <th className="text-center py-2 text-xs font-medium text-muted-foreground">
                            Stopa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.deptBreakdown.map((d) => (
                          <tr
                            key={d.dept}
                            className="border-b hover:bg-muted/30"
                          >
                            <td className="py-2.5 font-medium">{d.dept}</td>
                            <td className="text-center py-2.5">{d.total}</td>
                            <td className="text-center py-2.5 text-amber-600">
                              {d.total -
                                d.implemented -
                                (d.rate === 0 ? d.total : 0)}
                            </td>
                            <td className="text-center py-2.5 text-green-600 font-medium">
                              {d.implemented}
                            </td>
                            <td className="text-center py-2.5 text-red-500">
                              {d.total -
                                d.implemented -
                                Math.max(
                                  0,
                                  d.total -
                                    d.implemented -
                                    (d.rate < 100 ? 1 : 0),
                                )}
                            </td>
                            <td className="text-center py-2.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${d.rate >= 50 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : d.rate > 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
                              >
                                {d.rate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Average resolution time & savings analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Analiza vremena rešenja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(PRIORITY_CONFIG).map(([key, pcfg]) => {
                      const ps = suggestions.filter(
                        (s) =>
                          s.priority === key &&
                          (s.status === "implemented" ||
                            s.status === "rejected"),
                      );
                      const avgDays =
                        ps.length > 0
                          ? Math.round(
                              ps.reduce((sum, s) => {
                                const start = new Date(s.createdAt).getTime();
                                const end = new Date(
                                  s.implementedAt || s.updatedAt,
                                ).getTime();
                                return (
                                  sum + (end - start) / (1000 * 60 * 60 * 24)
                                );
                              }, 0) / ps.length,
                            )
                          : 0;
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${pcfg.color} w-20 justify-center`}
                          >
                            {pcfg.label}
                          </Badge>
                          <div className="flex-1">
                            <div className="bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{
                                  width: `${Math.min((avgDays / 45) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium w-16 text-right">
                            {avgDays > 0 ? `~${avgDays} dana` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Procenjene uštede
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                      const catSavings = suggestions.filter(
                        (s) =>
                          s.category === key &&
                          s.estimatedSaving &&
                          s.estimatedSaving > 0,
                      );
                      const totalSaving = catSavings.reduce(
                        (sum, s) => sum + (s.estimatedSaving || 0),
                        0,
                      );
                      const implSaving = catSavings
                        .filter((s) => s.status === "implemented")
                        .reduce((sum, s) => sum + (s.estimatedSaving || 0), 0);
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                        >
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${cfg.bgColor} ${cfg.color}`}
                          >
                            {cfg.label}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {formatCurrency(implSaving)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              od {formatCurrency(totalSaving)} procenjeno
                            </p>
                          </div>
                          <Progress
                            value={
                              totalSaving > 0
                                ? (implSaving / totalSaving) * 100
                                : 0
                            }
                            className="w-16 h-2"
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Novi predlog
            </DialogTitle>
            <DialogDescription>
              Podelite svoju ideju za poboljšanje poslovanja kompanije
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naslov *</Label>
              <Input
                placeholder="Kratak opis predloga..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Detaljan opis *</Label>
              <Textarea
                placeholder="Opišite predlog u detaljima, uključujući problem i predloženo rešenje..."
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                        {v.label}
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
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Procenjena godišnja ušteda (RSD)</Label>
              <Input
                type="number"
                placeholder="npr. 500000"
                value={form.estimatedSaving}
                onChange={(e) =>
                  setForm({ ...form, estimatedSaving: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Otkaži
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.description.trim()}
            >
              <Send className="h-4 w-4 mr-1" /> Pošalji predlog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedSuggestion &&
            (() => {
              const s = selectedSuggestion;
              const sc = STATUS_CONFIG[s.status];
              const totalVotes = s.votesFor + s.votesAgainst;
              const approvalPct =
                totalVotes > 0
                  ? Math.round((s.votesFor / totalVotes) * 100)
                  : 0;
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${sc?.color}`}
                      >
                        {sc?.icon} {sc?.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${cc?.bgColor} ${cc?.color}`}
                      >
                        {cc?.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${pc?.color}`}
                      >
                        {pc?.label}
                      </Badge>
                    </div>
                    <DialogTitle className="text-lg">{s.title}</DialogTitle>
                    <DialogDescription>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {s.authorName}
                      </span>
                      <span className="mx-2">·</span>
                      <span>{s.authorDept}</span>
                      <span className="mx-2">·</span>
                      <span>{formatDate(s.createdAt)}</span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Opis</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {s.description}
                      </p>
                    </div>

                    {/* Voting */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          Podrška zajednice
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-green-500"
                              style={{ width: `${approvalPct}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">
                            {approvalPct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="text-green-600">
                            <ThumbsUp className="h-3 w-3 inline mr-1" />
                            {s.votesFor} za
                          </span>
                          <span className="text-red-500">
                            <ThumbsDown className="h-3 w-3 inline mr-1" />
                            {s.votesAgainst} protiv
                          </span>
                          <span>
                            <MessageSquare className="h-3 w-3 inline mr-1" />
                            {s.comments} komentara
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant={s.userVote === "for" ? "default" : "outline"}
                          size="sm"
                          className={
                            s.userVote === "for"
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                          onClick={() => handleVote(s.id, "for")}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" /> Za
                        </Button>
                        <Button
                          variant={
                            s.userVote === "against" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            s.userVote === "against"
                              ? "bg-red-600 hover:bg-red-700"
                              : ""
                          }
                          onClick={() => handleVote(s.id, "against")}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" /> Protiv
                        </Button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-4">
                      {s.estimatedSaving && s.estimatedSaving > 0 && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <p className="text-[10px] text-muted-foreground">
                            Procenjena ušteda
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(s.estimatedSaving)}/god
                          </p>
                        </div>
                      )}
                      {s.implementedAt && (
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <p className="text-[10px] text-muted-foreground">
                            Datum realizacije
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            {formatDate(s.implementedAt)}
                          </p>
                        </div>
                      )}
                      {s.implementerName && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-[10px] text-muted-foreground">
                            Realizator
                          </p>
                          <p className="text-sm font-medium">
                            {s.implementerName}
                          </p>
                        </div>
                      )}
                      {s.rejectionReason && (
                        <div className="col-span-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Razlog odbijanja
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {s.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status change actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {s.status !== "implemented" &&
                        s.status !== "rejected" && (
                          <>
                            <Label className="text-xs text-muted-foreground">
                              Promeni status:
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() =>
                                handleStatusChange(s.id, "approved")
                              }
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1 text-blue-500" />{" "}
                              Odobri
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() =>
                                handleStatusChange(s.id, "implemented")
                              }
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />{" "}
                              Realizuj
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() =>
                                handleStatusChange(s.id, "rejected")
                              }
                            >
                              <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />{" "}
                              Odbij
                            </Button>
                          </>
                        )}
                      {s.status === "pending" && <div className="flex-1" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-red-500 hover:text-red-600 ml-auto"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Obriši
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* ===== COMMENT DIALOG ===== */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Dodaj komentar
            </DialogTitle>
            <DialogDescription>{commentingSuggestion?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Napišite vaš komentar..."
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCommentOpen(false);
                setCommentText("");
              }}
            >
              Otkaži
            </Button>
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              <Send className="h-4 w-4 mr-1" /> Pošalji
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
