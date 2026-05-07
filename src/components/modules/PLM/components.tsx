"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
  Layers,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  AlertCircle,
  GitBranch,
  GitCommit,
  FileText,
  FolderOpen,
  Upload,
  Download,
  Copy,
  ArrowRight,
  Users,
  Calendar,
  Filter,
  History,
  Package,
  Cog,
  Shield,
  Target,
  Zap,
} from "lucide-react";

// ======================== TYPES ========================

interface PLMProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  lifecycleStage: string;
  status: string;
  version: string;
  owner: string;
  lastUpdated: string;
  createdAt: string;
  description: string;
  bomRef: string;
  revisionCount: number;
}

interface PLMRevision {
  id: string;
  productId: string;
  productName: string;
  version: string;
  description: string;
  author: string;
  date: string;
  status: string;
  changeType: string;
  affectedComponents: string;
}

interface PLMDocument {
  id: string;
  title: string;
  productId: string;
  productName: string;
  docType: string;
  version: string;
  status: string;
  author: string;
  date: string;
  hasFile: boolean;
  size: string;
}

interface PLM_ECR {
  id: string;
  number: string;
  productId: string;
  productName: string;
  description: string;
  priority: string;
  requester: string;
  status: string;
  justification: string;
  affectedAreas: string;
  createdAt: string;
  convertedToECO: boolean;
  ecoNumber: string | null;
}

interface PLM_ECO {
  id: string;
  ecrNumber: string;
  productName: string;
  implementationPlan: string;
  assignedTeam: string;
  targetDate: string;
  completion: number;
  status: string;
  approvalChain: string[];
}

// ======================== CONFIG ========================

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  concept: { label: "Koncept", color: "bg-slate-100 text-slate-700" },
  design: { label: "Dizajn", color: "bg-violet-100 text-violet-700" },
  prototype: { label: "Prototip", color: "bg-cyan-100 text-cyan-700" },
  testing: { label: "Testiranje", color: "bg-amber-100 text-amber-700" },
  launch: { label: "Lansiranje", color: "bg-emerald-100 text-emerald-700" },
  production: { label: "Proizvodnja", color: "bg-green-100 text-green-700" },
  eol: { label: "Kraj života", color: "bg-red-100 text-red-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Aktivan", color: "bg-green-100 text-green-700" },
  development: { label: "U razvoju", color: "bg-amber-100 text-amber-700" },
  discontinued: { label: "Prekinut", color: "bg-red-100 text-red-700" },
};

const REVISION_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
    draft: { label: "Nacrt", color: "bg-slate-100 text-slate-700" },
    submitted: { label: "Podnet", color: "bg-amber-100 text-amber-700" },
    approved: { label: "Odobren", color: "bg-green-100 text-green-700" },
    rejected: { label: "Odbijen", color: "bg-red-100 text-red-700" },
  };

const DOC_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  drawing: { label: "Crtež", color: "bg-blue-100 text-blue-700" },
  specification: {
    label: "Specifikacija",
    color: "bg-violet-100 text-violet-700",
  },
  material_cert: {
    label: "Sertifikat",
    color: "bg-emerald-100 text-emerald-700",
  },
  test_report: {
    label: "Izveštaj testa",
    color: "bg-amber-100 text-amber-700",
  },
  manual: { label: "Uputstvo", color: "bg-cyan-100 text-cyan-700" },
};

const ECR_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Nacrt", color: "bg-slate-100 text-slate-700" },
  under_review: { label: "Na pregledu", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Odobren", color: "bg-green-100 text-green-700" },
  implemented: {
    label: "Implementiran",
    color: "bg-emerald-100 text-emerald-700",
  },
  rejected: { label: "Odbijen", color: "bg-red-100 text-red-700" },
};

const ECO_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planned: { label: "Planirano", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "U toku", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Završeno", color: "bg-green-100 text-green-700" },
  on_hold: { label: "Na čekanju", color: "bg-slate-100 text-slate-700" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Nizak", color: "bg-slate-100 text-slate-700" },
  medium: { label: "Srednji", color: "bg-amber-100 text-amber-700" },
  high: { label: "Visok", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Kritičan", color: "bg-red-100 text-red-700" },
};

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#22c55e",
  "#ef4444",
];

// ======================== MOCK DATA ========================

const MOCK_PRODUCTS: PLMProduct[] = [
  {
    id: "p1",
    name: "Kontrolna ploča KP-200",
    sku: "KP-200-001",
    category: "Elektronika",
    lifecycleStage: "production",
    status: "active",
    version: "3.2.1",
    owner: "Marko Petrović",
    lastUpdated: "2024-12-08",
    createdAt: "2023-06-15",
    description: "Glavna kontrolna ploča za industrijske sisteme",
    bomRef: "BOM-KP200-v3",
    revisionCount: 7,
  },
  {
    id: "p2",
    name: "Hidraulični cilindar HC-150",
    sku: "HC-150-002",
    category: "Mehanika",
    lifecycleStage: "design",
    status: "development",
    version: "2.0.0",
    owner: "Jelena Stanković",
    lastUpdated: "2024-12-10",
    createdAt: "2024-03-01",
    description: "Hidraulični cilindar nove generacije",
    bomRef: "BOM-HC150-v2",
    revisionCount: 4,
  },
  {
    id: "p3",
    name: "Senzor temperature ST-80",
    sku: "ST-80-003",
    category: "Elektronika",
    lifecycleStage: "testing",
    status: "development",
    version: "1.5.0",
    owner: "Nenad Jovanović",
    lastUpdated: "2024-12-09",
    createdAt: "2024-01-20",
    description: "Digitalni senzor temperature sa I2C interfejsom",
    bomRef: "BOM-ST80-v1",
    revisionCount: 5,
  },
  {
    id: "p4",
    name: "Aluminijsko kućište AK-300",
    sku: "AK-300-004",
    category: "Mehanika",
    lifecycleStage: "production",
    status: "active",
    version: "4.1.0",
    owner: "Ana Nikolić",
    lastUpdated: "2024-11-28",
    createdAt: "2022-09-10",
    description: "Aluminijsko kućište za elektroniku",
    bomRef: "BOM-AK300-v4",
    revisionCount: 9,
  },
  {
    id: "p5",
    name: "Power Supply PS-500",
    sku: "PS-500-005",
    category: "Elektronika",
    lifecycleStage: "prototype",
    status: "development",
    version: "1.0.0",
    owner: "Dejan Milić",
    lastUpdated: "2024-12-11",
    createdAt: "2024-08-15",
    description: "Prekidački napajanje 500W",
    bomRef: "BOM-PS500-v1",
    revisionCount: 2,
  },
  {
    id: "p6",
    name: "Plastična maska PM-100",
    sku: "PM-100-006",
    category: "Dizajn",
    lifecycleStage: "launch",
    status: "active",
    version: "2.3.0",
    owner: "Ivana Đorđević",
    lastUpdated: "2024-12-05",
    createdAt: "2023-11-22",
    description: "Prednja maska za kontrolni panel",
    bomRef: "BOM-PM100-v2",
    revisionCount: 6,
  },
  {
    id: "p7",
    name: "Servo motor SM-60",
    sku: "SM-60-007",
    category: "Mehanika",
    lifecycleStage: "concept",
    status: "development",
    version: "0.1.0",
    owner: "Slobodan Tanasijević",
    lastUpdated: "2024-12-12",
    createdAt: "2024-11-01",
    description: "Servo motor za robotiku",
    bomRef: "",
    revisionCount: 1,
  },
  {
    id: "p8",
    name: "Konektor za ploču CP-12",
    sku: "CP-12-008",
    category: "Elektronika",
    lifecycleStage: "production",
    status: "active",
    version: "5.0.2",
    owner: "Marko Petrović",
    lastUpdated: "2024-12-01",
    createdAt: "2021-04-08",
    description: "Visokopin konektor za PCB",
    bomRef: "BOM-CP12-v5",
    revisionCount: 11,
  },
  {
    id: "p9",
    name: "Ventil za rashladni sistem VR-45",
    sku: "VR-45-009",
    category: "Mehanika",
    lifecycleStage: "eol",
    status: "discontinued",
    version: "3.8.0",
    owner: "Jelena Stanković",
    lastUpdated: "2024-06-15",
    createdAt: "2019-02-20",
    description: "Ventil za rashladni sistem - zastareo",
    bomRef: "BOM-VR45-v3",
    revisionCount: 8,
  },
  {
    id: "p10",
    name: "LED modul LM-250",
    sku: "LM-250-010",
    category: "Elektronika",
    lifecycleStage: "production",
    status: "active",
    version: "2.0.0",
    owner: "Nenad Jovanović",
    lastUpdated: "2024-12-07",
    createdAt: "2023-08-05",
    description: "LED modul za indikaciju",
    bomRef: "BOM-LM250-v2",
    revisionCount: 3,
  },
];

const MOCK_REVISIONS: PLMRevision[] = [
  {
    id: "r1",
    productId: "p1",
    productName: "Kontrolna ploča KP-200",
    version: "3.2.1",
    description: "Dodat novi ADC kanal za senzor pritiska",
    author: "Marko Petrović",
    date: "2024-12-08",
    status: "approved",
    changeType: "Minor",
    affectedComponents: "U9, R12, C5",
  },
  {
    id: "r2",
    productId: "p1",
    productName: "Kontrolna ploča KP-200",
    version: "3.2.0",
    description: "Popravka bug-a u firmware bootloaderu",
    author: "Marko Petrović",
    date: "2024-11-20",
    status: "approved",
    changeType: "Patch",
    affectedComponents: "U1 firmware",
  },
  {
    id: "r3",
    productId: "p2",
    productName: "Hidraulični cilindar HC-150",
    version: "2.0.0",
    description: "Kompletna redizajn osovine i zaptivki",
    author: "Jelena Stanković",
    date: "2024-12-10",
    status: "submitted",
    changeType: "Major",
    affectedComponents: "Osovina, zaptivke, cilindar",
  },
  {
    id: "r4",
    productId: "p3",
    productName: "Senzor temperature ST-80",
    version: "1.5.0",
    description: "Prošireni temperaturni raspon na -40°C do +125°C",
    author: "Nenad Jovanović",
    date: "2024-12-09",
    status: "draft",
    changeType: "Major",
    affectedComponents: "NTC termistor, kalibracija",
  },
  {
    id: "r5",
    productId: "p4",
    productName: "Aluminijsko kućište AK-300",
    version: "4.1.0",
    description: "Nova ventilaciona rupa na gornjoj strani",
    author: "Ana Nikolić",
    date: "2024-11-28",
    status: "approved",
    changeType: "Minor",
    affectedComponents: "Gornji poklopac",
  },
  {
    id: "r6",
    productId: "p5",
    productName: "Power Supply PS-500",
    version: "1.0.0",
    description: "Inicijalna revizija - prototip napravljen",
    author: "Dejan Milić",
    date: "2024-12-11",
    status: "submitted",
    changeType: "Major",
    affectedComponents: "Kompletna ploča",
  },
  {
    id: "r7",
    productId: "p6",
    productName: "Plastična maska PM-100",
    version: "2.3.0",
    description: "Promena boje i logotipa",
    author: "Ivana Đorđević",
    date: "2024-12-05",
    status: "approved",
    changeType: "Patch",
    affectedComponents: "Prednja površina",
  },
  {
    id: "r8",
    productId: "p8",
    productName: "Konektor za ploču CP-12",
    version: "5.0.2",
    description: "Ispravka tolerancije pinova",
    author: "Marko Petrović",
    date: "2024-12-01",
    status: "approved",
    changeType: "Patch",
    affectedComponents: "Pinovi konektora",
  },
];

const MOCK_DOCUMENTS: PLMDocument[] = [
  {
    id: "d1",
    title: "Šema KP-200 Rev 3.2",
    productId: "p1",
    productName: "Kontrolna ploča KP-200",
    docType: "drawing",
    version: "3.2.1",
    status: "approved",
    author: "Marko Petrović",
    date: "2024-12-08",
    hasFile: true,
    size: "2.4 MB",
  },
  {
    id: "d2",
    title: "Specifikacija KP-200",
    productId: "p1",
    productName: "Kontrolna ploča KP-200",
    docType: "specification",
    version: "3.2",
    status: "approved",
    author: "Jelena Stanković",
    date: "2024-12-08",
    hasFile: true,
    size: "1.1 MB",
  },
  {
    id: "d3",
    title: "Crtež cilindra HC-150",
    productId: "p2",
    productName: "Hidraulični cilindar HC-150",
    docType: "drawing",
    version: "2.0",
    status: "submitted",
    author: "Ana Nikolić",
    date: "2024-12-10",
    hasFile: true,
    size: "3.7 MB",
  },
  {
    id: "d4",
    title: "Test izveštaj ST-80",
    productId: "p3",
    productName: "Senzor temperature ST-80",
    docType: "test_report",
    version: "1.5",
    status: "draft",
    author: "Nenad Jovanović",
    date: "2024-12-09",
    hasFile: true,
    size: "890 KB",
  },
  {
    id: "d5",
    title: "Sertifikat materijala AK-300",
    productId: "p4",
    productName: "Aluminijsko kućište AK-300",
    docType: "material_cert",
    version: "4.1",
    status: "approved",
    author: "Dejan Milić",
    date: "2024-11-28",
    hasFile: true,
    size: "450 KB",
  },
  {
    id: "d6",
    title: "Uputstvo za montažu PM-100",
    productId: "p6",
    productName: "Plastična maska PM-100",
    docType: "manual",
    version: "2.3",
    status: "approved",
    author: "Ivana Đorđević",
    date: "2024-12-05",
    hasFile: true,
    size: "1.8 MB",
  },
  {
    id: "d7",
    title: "Specifikacija napajanja PS-500",
    productId: "p5",
    productName: "Power Supply PS-500",
    docType: "specification",
    version: "1.0",
    status: "submitted",
    author: "Dejan Milić",
    date: "2024-12-11",
    hasFile: false,
    size: "-",
  },
  {
    id: "d8",
    title: "Crtež kućišta PS-500",
    productId: "p5",
    productName: "Power Supply PS-500",
    docType: "drawing",
    version: "1.0",
    status: "draft",
    author: "Ana Nikolić",
    date: "2024-12-11",
    hasFile: true,
    size: "5.2 MB",
  },
  {
    id: "d9",
    title: "Test izveštaj CP-12",
    productId: "p8",
    productName: "Konektor za ploču CP-12",
    docType: "test_report",
    version: "5.0",
    status: "approved",
    author: "Nenad Jovanović",
    date: "2024-12-01",
    hasFile: true,
    size: "670 KB",
  },
  {
    id: "d10",
    title: "Sertifikat LM-250 CE",
    productId: "p10",
    productName: "LED modul LM-250",
    docType: "material_cert",
    version: "2.0",
    status: "approved",
    author: "Jelena Stanković",
    date: "2024-12-07",
    hasFile: true,
    size: "320 KB",
  },
  {
    id: "d11",
    title: "Uputstvo za kalibraciju ST-80",
    productId: "p3",
    productName: "Senzor temperature ST-80",
    docType: "manual",
    version: "1.4",
    status: "approved",
    author: "Nenad Jovanović",
    date: "2024-10-15",
    hasFile: true,
    size: "1.5 MB",
  },
  {
    id: "d12",
    title: "Crtež konektora CP-12",
    productId: "p8",
    productName: "Konektor za ploču CP-12",
    docType: "drawing",
    version: "5.0.2",
    status: "approved",
    author: "Marko Petrović",
    date: "2024-12-01",
    hasFile: true,
    size: "4.1 MB",
  },
];

const MOCK_ECRS: PLM_ECR[] = [
  {
    id: "ecr1",
    number: "ECR-2024-001",
    productId: "p1",
    productName: "Kontrolna ploča KP-200",
    description: "Zamena ADC konvertora za bolju preciznost",
    priority: "high",
    requester: "Nenad Jovanović",
    status: "approved",
    justification: "Trenutni ADC ima grešku od ±2 LSB, potrebno ±0.5 LSB",
    affectedAreas: "Hardver, Firmware",
    createdAt: "2024-11-25",
    convertedToECO: true,
    ecoNumber: "ECO-2024-001",
  },
  {
    id: "ecr2",
    number: "ECR-2024-002",
    productId: "p2",
    productName: "Hidraulični cilindar HC-150",
    description: "Promena materijala zaptivki na Viton",
    priority: "critical",
    requester: "Jelena Stanković",
    status: "under_review",
    justification: "Trenutne zaptivke ne podnose visoke temperature",
    affectedAreas: "Mehanika, Nabavka",
    createdAt: "2024-12-01",
    convertedToECO: false,
    ecoNumber: null,
  },
  {
    id: "ecr3",
    number: "ECR-2024-003",
    productId: "p3",
    productName: "Senzor temperature ST-80",
    description: "Proširenje temperaturnog raspona",
    priority: "medium",
    requester: "Dejan Milić",
    status: "approved",
    justification: "Klijent zahteva rad na temperaturama ispod -20°C",
    affectedAreas: "Hardver, Testiranje",
    createdAt: "2024-12-03",
    convertedToECO: true,
    ecoNumber: "ECO-2024-002",
  },
  {
    id: "ecr4",
    number: "ECR-2024-004",
    productId: "p4",
    productName: "Aluminijsko kućište AK-300",
    description: "Dodat konektor za spoljni ventilator",
    priority: "low",
    requester: "Ana Nikolić",
    status: "draft",
    justification: "Poboljšanje hlađenja za nove konfiguracije",
    affectedAreas: "Mehanika, Dizajn",
    createdAt: "2024-12-08",
    convertedToECO: false,
    ecoNumber: null,
  },
  {
    id: "ecr5",
    number: "ECR-2024-005",
    productId: "p8",
    productName: "Konektor za ploču CP-12",
    description: "Povećanje broja pinova sa 12 na 16",
    priority: "high",
    requester: "Marko Petrović",
    status: "implemented",
    justification: "Novi interfejs zahteva 4 dodatna signala",
    affectedAreas: "Hardver, Proizvodnja",
    createdAt: "2024-11-10",
    convertedToECO: true,
    ecoNumber: "ECO-2024-003",
  },
  {
    id: "ecr6",
    number: "ECR-2024-006",
    productId: "p10",
    productName: "LED modul LM-250",
    description: "Prebačen na SMD LED diode",
    priority: "medium",
    requester: "Nenad Jovanović",
    status: "rejected",
    justification: "Smanjenje troškova proizvodnje za 30%",
    affectedAreas: "Hardver, Proizvodnja, Nabavka",
    createdAt: "2024-11-18",
    convertedToECO: false,
    ecoNumber: null,
  },
];

const MOCK_ECOS: PLM_ECO[] = [
  {
    id: "eco1",
    ecrNumber: "ECR-2024-001",
    productName: "Kontrolna ploča KP-200",
    implementationPlan: "Zamena ADC chipa, ažuriranje PCB layauta, testiranje",
    assignedTeam: "Tim za elektroniku",
    targetDate: "2025-01-15",
    completion: 65,
    status: "in_progress",
    approvalChain: ["Nenad J.", "Marko P.", "Jelena S."],
  },
  {
    id: "eco2",
    ecrNumber: "ECR-2024-003",
    productName: "Senzor temperature ST-80",
    implementationPlan:
      "Novi NTC termistor, rekalibracija, test na ekstremnim temperaturama",
    assignedTeam: "Tim za senzore",
    targetDate: "2025-02-01",
    completion: 30,
    status: "in_progress",
    approvalChain: ["Dejan M.", "Nenad J."],
  },
  {
    id: "eco3",
    ecrNumber: "ECR-2024-005",
    productName: "Konektor za ploču CP-12",
    implementationPlan: "Redizajn konektora, nova masnica, kvalitetna kontrola",
    assignedTeam: "Tim za konektore",
    targetDate: "2024-12-20",
    completion: 100,
    status: "completed",
    approvalChain: ["Marko P.", "Ana N.", "Ivana Đ."],
  },
];

const MOCK_STAGE_PIE = [
  { name: "Koncept", value: 1 },
  { name: "Dizajn", value: 1 },
  { name: "Prototip", value: 1 },
  { name: "Testiranje", value: 1 },
  { name: "Lansiranje", value: 1 },
  { name: "Proizvodnja", value: 4 },
  { name: "Kraj života", value: 1 },
];

const MOCK_NPD_TREND = [
  { month: "Jul", count: 2 },
  { month: "Avg", count: 1 },
  { month: "Sep", count: 3 },
  { month: "Okt", count: 2 },
  { month: "Nov", count: 4 },
  { month: "Dec", count: 3 },
];

const MOCK_MILESTONES = [
  {
    id: "m1",
    title: "PS-500 Prototip",
    date: "2024-12-20",
    stage: "prototype",
    status: "upcoming",
  },
  {
    id: "m2",
    title: "HC-150 Testiranje",
    date: "2024-12-25",
    stage: "testing",
    status: "upcoming",
  },
  {
    id: "m3",
    title: "KP-200 Rev 3.3",
    date: "2025-01-10",
    stage: "production",
    status: "planned",
  },
  {
    id: "m4",
    title: "SM-60 Koncept",
    date: "2025-01-15",
    stage: "concept",
    status: "planned",
  },
  {
    id: "m5",
    title: "LM-250 CE sertifikacija",
    date: "2025-01-20",
    stage: "testing",
    status: "planned",
  },
];

const MOCK_TTM_TREND = [
  { month: "Jul", days: 145 },
  { month: "Avg", days: 132 },
  { month: "Sep", days: 128 },
  { month: "Okt", days: 120 },
  { month: "Nov", days: 115 },
  { month: "Dec", days: 108 },
];

const MOCK_COMPLEXITY_COST = [
  { name: "KP-200", complexity: 82, cost: 12500, category: "Elektronika" },
  { name: "HC-150", complexity: 65, cost: 8900, category: "Mehanika" },
  { name: "ST-80", complexity: 45, cost: 3200, category: "Elektronika" },
  { name: "AK-300", complexity: 55, cost: 5600, category: "Mehanika" },
  { name: "PS-500", complexity: 90, cost: 15800, category: "Elektronika" },
  { name: "PM-100", complexity: 30, cost: 1800, category: "Dizajn" },
  { name: "SM-60", complexity: 75, cost: 11200, category: "Mehanika" },
  { name: "CP-12", complexity: 40, cost: 2800, category: "Elektronika" },
  { name: "VR-45", complexity: 60, cost: 7500, category: "Mehanika" },
  { name: "LM-250", complexity: 35, cost: 2100, category: "Elektronika" },
];

const MOCK_CHANGE_FREQ = [
  { name: "CP-12", changes: 11 },
  { name: "AK-300", changes: 9 },
  { name: "VR-45", changes: 8 },
  { name: "KP-200", changes: 7 },
  { name: "PM-100", changes: 6 },
  { name: "ST-80", changes: 5 },
  { name: "HC-150", changes: 4 },
  { name: "LM-250", changes: 3 },
];

const MOCK_APPROVAL_CYCLE = [
  { range: "1-3 dana", count: 3 },
  { range: "4-7 dana", count: 5 },
  { range: "8-14 dana", count: 2 },
  { range: "15+ dana", count: 1 },
];

const MOCK_TOP_INNOVATORS = [
  { name: "Marko Petrović", approved: 8 },
  { name: "Nenad Jovanović", approved: 6 },
  { name: "Jelena Stanković", approved: 5 },
  { name: "Ana Nikolić", approved: 4 },
  { name: "Dejan Milić", approved: 3 },
];

// ======================== COMPONENT ========================

export function PLMContent() {
  const { activeCompanyId } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Products state
  const [products, setProducts] = useState<PLMProduct[]>(MOCK_PRODUCTS);

  // Revisions state
  const [revisions, setRevisions] = useState<PLMRevision[]>(MOCK_REVISIONS);

  // Documents state
  const [documents, setDocuments] = useState<PLMDocument[]>(MOCK_DOCUMENTS);

  // ECR/ECO state
  const [ecrs, setEcrs] = useState<PLM_ECR[]>(MOCK_ECRS);

  // Forms
  const emptyProductForm = {
    name: "",
    sku: "",
    category: "Elektronika",
    lifecycleStage: "concept",
    status: "development",
    version: "0.1.0",
    owner: "",
    description: "",
  };
  const [productForm, setProductForm] = useState(emptyProductForm);

  const emptyRevisionForm = {
    productId: "",
    version: "",
    description: "",
    changeType: "Minor" as string,
    affectedComponents: "",
  };
  const [revisionForm, setRevisionForm] = useState(emptyRevisionForm);

  const emptyDocForm = {
    title: "",
    productId: "",
    docType: "drawing",
    version: "1.0",
    status: "draft",
  };
  const [docForm, setDocForm] = useState(emptyDocForm);

  const emptyEcrForm = {
    productId: "",
    description: "",
    priority: "medium" as string,
    justification: "",
    affectedAreas: "",
  };
  const [ecrForm, setEcrForm] = useState(emptyEcrForm);

  // ======================== DERIVED ========================

  const uniqueCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory =
        productCategoryFilter === "all" || p.category === productCategoryFilter;
      const matchStage =
        productStageFilter === "all" || p.lifecycleStage === productStageFilter;
      const matchStatus =
        productStatusFilter === "all" || p.status === productStatusFilter;
      return matchSearch && matchCategory && matchStage && matchStatus;
    });
  }, [
    products,
    productSearch,
    productCategoryFilter,
    productStageFilter,
    productStatusFilter,
  ]);

  const filteredRevisions = useMemo(() => {
    return revisions.filter((r) => {
      const matchSearch =
        !revisionSearch ||
        r.productName.toLowerCase().includes(revisionSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(revisionSearch.toLowerCase());
      const matchStatus =
        revisionStatusFilter === "all" || r.status === revisionStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [revisions, revisionSearch, revisionStatusFilter]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        !docSearch ||
        d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
        d.productName.toLowerCase().includes(docSearch.toLowerCase());
      const matchType = docTypeFilter === "all" || d.docType === docTypeFilter;
      const matchStatus =
        docStatusFilter === "all" || d.status === docStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [documents, docSearch, docTypeFilter, docStatusFilter]);

  const filteredEcrs = useMemo(() => {
    return ecrs.filter((e) => {
      const matchStatus =
        ecrStatusFilter === "all" || e.status === ecrStatusFilter;
      return matchStatus;
    });
  }, [ecrs, ecrStatusFilter]);

  const kpiData = useMemo(() => {
    const activeCount = products.filter((p) => p.status === "active").length;
    const devCount = products.filter((p) => p.status === "development").length;
    const reviewCount = revisions.filter(
      (r) => r.status === "submitted",
    ).length;
    const changesThisMonth = revisions.filter((r) => {
      const d = new Date(r.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    const avgTimeToMarket = 108;
    const openEcrs = ecrs.filter((e) =>
      ["draft", "under_review", "approved"].includes(e.status),
    ).length;
    return {
      activeCount,
      devCount,
      reviewCount,
      changesThisMonth,
      avgTimeToMarket,
      openEcrs,
    };
  }, [products, revisions, ecrs]);

  const topRevisionProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.revisionCount - a.revisionCount)
      .slice(0, 5);
  }, [products]);

  // ======================== HANDLERS ========================

  const handleCreateProduct = useCallback(() => {
    if (!activeCompanyId) return;
    const newProduct: PLMProduct = {
      id: `p-${Date.now()}`,
      ...productForm,
      lastUpdated: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      bomRef: "",
      revisionCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    setProductDialogOpen(false);
    setProductForm(emptyProductForm);
  }, [activeCompanyId, productForm]);

  const handleDeleteProduct = useCallback(
    (id: string) => {
      if (!confirm(t("plm.confirmDelete"))) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [t],
  );

  const handleCreateRevision = useCallback(() => {
    if (!activeCompanyId || !revisionForm.productId) return;
    const product = products.find((p) => p.id === revisionForm.productId);
    if (!product) return;
    const newRevision: PLMRevision = {
      id: `r-${Date.now()}`,
      productId: revisionForm.productId,
      productName: product.name,
      version: revisionForm.version || "0.1.0",
      description: revisionForm.description,
      author: t("plm.currentUser"),
      date: new Date().toISOString().split("T")[0],
      status: "draft",
      changeType: revisionForm.changeType,
      affectedComponents: revisionForm.affectedComponents,
    };
    setRevisions((prev) => [newRevision, ...prev]);
    setRevisionDialogOpen(false);
    setRevisionForm(emptyRevisionForm);
  }, [activeCompanyId, revisionForm, products, t]);

  const handleRevisionAction = useCallback((revId: string, action: string) => {
    setRevisions((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, status: action } : r)),
    );
  }, []);

  const handleCreateDoc = useCallback(() => {
    if (!activeCompanyId || !docForm.productId) return;
    const product = products.find((p) => p.id === docForm.productId);
    if (!product) return;
    const newDoc: PLMDocument = {
      id: `d-${Date.now()}`,
      title: docForm.title,
      productId: docForm.productId,
      productName: product.name,
      docType: docForm.docType,
      version: docForm.version,
      status: docForm.status,
      author: t("plm.currentUser"),
      date: new Date().toISOString().split("T")[0],
      hasFile: false,
      size: "-",
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setDocDialogOpen(false);
    setDocForm(emptyDocForm);
  }, [activeCompanyId, docForm, products, t]);

  const handleDeleteDoc = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleCreateEcr = useCallback(() => {
    if (!activeCompanyId || !ecrForm.productId) return;
    const product = products.find((p) => p.id === ecrForm.productId);
    if (!product) return;
    const newEcr: PLM_ECR = {
      id: `ecr-${Date.now()}`,
      number: `ECR-2024-${String(ecrs.length + 1).padStart(3, "0")}`,
      productId: ecrForm.productId,
      productName: product.name,
      description: ecrForm.description,
      priority: ecrForm.priority,
      requester: t("plm.currentUser"),
      status: "draft",
      justification: ecrForm.justification,
      affectedAreas: ecrForm.affectedAreas,
      createdAt: new Date().toISOString().split("T")[0],
      convertedToECO: false,
      ecoNumber: null,
    };
    setEcrs((prev) => [newEcr, ...prev]);
    setEcrDialogOpen(false);
    setEcrForm(emptyEcrForm);
  }, [activeCompanyId, ecrForm, products, ecrs.length, t]);

  const handleConvertToEco = useCallback(
    (ecrId: string) => {
      const ecr = ecrs.find((e) => e.id === ecrId);
      if (!ecr) return;
      const ecoNumber = `ECO-2024-${String(ecos.length + 1).padStart(3, "0")}`;
      setEcrs((prev) =>
        prev.map((e) =>
          e.id === ecrId
            ? { ...e, convertedToECO: true, ecoNumber, status: "approved" }
            : e,
        ),
      );
      const newEco: PLM_ECO = {
        id: `eco-${Date.now()}`,
        ecrNumber: ecr.number,
        productName: ecr.productName,
        implementationPlan: t("plm.toBeDefined"),
        assignedTeam: t("plm.toBeAssigned"),
        targetDate: "",
        completion: 0,
        status: "planned",
        approvalChain: [t("plm.currentUser")],
      };
      setEcos((prev) => [newEco, ...prev]);
    },
    [ecrs, ecos.length, t],
  );

  // ======================== RENDER ========================

  if (!activeCompanyId) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PLM</h1>
          <p className="text-sm text-muted-foreground">{t("plm.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProducts(MOCK_PRODUCTS)}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> {t("plm.refresh")}
          </Button>
          {activeTab === "products" && (
            <Button size="sm" onClick={() => setProductDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.newProduct")}
            </Button>
          )}
          {activeTab === "revisions" && (
            <Button size="sm" onClick={() => setRevisionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.newRevision")}
            </Button>
          )}
          {activeTab === "documents" && (
            <Button size="sm" onClick={() => setDocDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.newDocument")}
            </Button>
          )}
          {activeTab === "ecr-eco" && (
            <Button size="sm" onClick={() => setEcrDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.newECR")}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />{" "}
            {t("plm.overview")}
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-1 hidden sm:inline" />{" "}
            {t("plm.products")}
          </TabsTrigger>
          <TabsTrigger value="revisions">
            <GitBranch className="h-4 w-4 mr-1 hidden sm:inline" />{" "}
            {t("plm.revisions")}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-1 hidden sm:inline" />{" "}
            {t("plm.documents")}
          </TabsTrigger>
          <TabsTrigger value="ecr-eco">
            <Cog className="h-4 w-4 mr-1 hidden sm:inline" /> ECR/ECO
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />{" "}
            {t("plm.analytics")}
          </TabsTrigger>
        </TabsList>

        {/* ====== TAB 1: OVERVIEW ====== */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.activeProducts")}
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{kpiData.activeCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.inDevelopment")}
                </span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {kpiData.devCount}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.pendingReview")}
                </span>
                <Clock className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-violet-600">
                {kpiData.reviewCount}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.changesThisMonth")}
                </span>
                <GitCommit className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-cyan-600">
                {kpiData.changesThisMonth}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.avgTimeToMarket")}
                </span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{kpiData.avgTimeToMarket}</p>
              <p className="text-xs text-muted-foreground">{t("plm.days")}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {t("plm.openECNs")}
                </span>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {kpiData.openEcrs}
              </p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lifecycle Stage Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.stageDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_STAGE_PIE}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {MOCK_STAGE_PIE.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NPD Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("plm.npdTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_NPD_TREND}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2}
                        name={t("plm.newProducts")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestones + Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Milestones */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.upcomingMilestones")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {MOCK_MILESTONES.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            milestone.status === "upcoming"
                              ? "#f59e0b"
                              : "#6366f1",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {milestone.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${STAGE_CONFIG[milestone.stage]?.color || ""}`}
                          >
                            {STAGE_CONFIG[milestone.stage]?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {milestone.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products by Revision Count */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.topByRevisions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRevisionProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {idx + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {product.sku}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${STATUS_CONFIG[product.status]?.color || ""}`}
                          >
                            {STATUS_CONFIG[product.status]?.label}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary text-xs">
                        {product.revisionCount} {t("plm.revisions")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====== TAB 2: PRODUCTS ====== */}
        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("plm.searchProducts")}
                className="pl-9"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <Select
              value={productCategoryFilter}
              onValueChange={setProductCategoryFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allCategories")}</SelectItem>
                {uniqueCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={productStageFilter}
              onValueChange={setProductStageFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allStages")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allStages")}</SelectItem>
                {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={productStatusFilter}
              onValueChange={setProductStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allStatuses")}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("plm.name")}</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>{t("plm.category")}</TableHead>
                    <TableHead>{t("plm.lifecycleStage")}</TableHead>
                    <TableHead>{t("plm.status")}</TableHead>
                    <TableHead>{t("plm.version")}</TableHead>
                    <TableHead>{t("plm.owner")}</TableHead>
                    <TableHead>{t("plm.lastUpdated")}</TableHead>
                    <TableHead>{t("plm.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STAGE_CONFIG[product.lifecycleStage]?.color || ""}`}
                        >
                          {STAGE_CONFIG[product.lifecycleStage]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_CONFIG[product.status]?.color || ""}`}
                        >
                          {STATUS_CONFIG[product.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        v{product.version}
                      </TableCell>
                      <TableCell className="text-xs">{product.owner}</TableCell>
                      <TableCell className="text-xs">
                        {product.lastUpdated}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setProductDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== TAB 3: REVISIONS ====== */}
        <TabsContent value="revisions" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("plm.searchRevisions")}
                className="pl-9"
                value={revisionSearch}
                onChange={(e) => setRevisionSearch(e.target.value)}
              />
            </div>
            <Select
              value={revisionStatusFilter}
              onValueChange={setRevisionStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allStatuses")}</SelectItem>
                {Object.entries(REVISION_STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Revisions Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("plm.product")}</TableHead>
                    <TableHead>{t("plm.version")}</TableHead>
                    <TableHead>{t("plm.description")}</TableHead>
                    <TableHead>{t("plm.changeType")}</TableHead>
                    <TableHead>{t("plm.affectedComponents")}</TableHead>
                    <TableHead>{t("plm.author")}</TableHead>
                    <TableHead>{t("plm.date")}</TableHead>
                    <TableHead>{t("plm.status")}</TableHead>
                    <TableHead>{t("plm.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRevisions.map((rev) => (
                    <TableRow key={rev.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">
                        {rev.productName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        v{rev.version}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {rev.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${rev.changeType === "Major" ? "bg-red-100 text-red-700" : rev.changeType === "Minor" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {rev.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {rev.affectedComponents}
                      </TableCell>
                      <TableCell className="text-xs">{rev.author}</TableCell>
                      <TableCell className="text-xs">{rev.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${REVISION_STATUS_CONFIG[rev.status]?.color || ""}`}
                        >
                          {REVISION_STATUS_CONFIG[rev.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rev.status === "draft" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-amber-600"
                              title={t("plm.submit")}
                              onClick={() =>
                                handleRevisionAction(rev.id, "submitted")
                              }
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {rev.status === "submitted" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600"
                                title={t("plm.approve")}
                                onClick={() =>
                                  handleRevisionAction(rev.id, "approved")
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600"
                                title={t("plm.reject")}
                                onClick={() =>
                                  handleRevisionAction(rev.id, "rejected")
                                }
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {(rev.status === "approved" ||
                            rev.status === "rejected") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title={t("plm.compare")}
                              onClick={() => {}}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ECN Status Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("plm.ecnStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(REVISION_STATUS_CONFIG).map(([key, config]) => {
                  const count = revisions.filter(
                    (r) => r.status === key,
                  ).length;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${config.color}`}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TAB 4: DOCUMENTS ====== */}
        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("plm.searchDocs")}
                className="pl-9"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />
            </div>
            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allTypes")}</SelectItem>
                {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={docStatusFilter} onValueChange={setDocStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("plm.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("plm.draft")}</SelectItem>
                <SelectItem value="submitted">{t("plm.submitted")}</SelectItem>
                <SelectItem value="approved">{t("plm.approved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("plm.title")}</TableHead>
                    <TableHead>{t("plm.product")}</TableHead>
                    <TableHead>{t("plm.type")}</TableHead>
                    <TableHead>{t("plm.version")}</TableHead>
                    <TableHead>{t("plm.status")}</TableHead>
                    <TableHead>{t("plm.author")}</TableHead>
                    <TableHead>{t("plm.date")}</TableHead>
                    <TableHead>{t("plm.file")}</TableHead>
                    <TableHead>{t("plm.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">
                        {doc.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {doc.productName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${DOC_TYPE_CONFIG[doc.docType]?.color || ""}`}
                        >
                          {DOC_TYPE_CONFIG[doc.docType]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        v{doc.version}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${REVISION_STATUS_CONFIG[doc.status]?.color || ""}`}
                        >
                          {REVISION_STATUS_CONFIG[doc.status]?.label ||
                            doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{doc.author}</TableCell>
                      <TableCell className="text-xs">{doc.date}</TableCell>
                      <TableCell>
                        {doc.hasFile ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                            <Upload className="h-3 w-3" /> {doc.size}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            -
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.hasFile && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title={t("plm.download")}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title={t("plm.edit")}
                            onClick={() => {}}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            title={t("plm.delete")}
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== TAB 5: ECR/ECO ====== */}
        <TabsContent value="ecr-eco" className="space-y-6">
          {/* ECR Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={ecrStatusFilter} onValueChange={setEcrStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("plm.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("plm.allStatuses")}</SelectItem>
                {Object.entries(ECR_STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ECR List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("plm.ecrList")} ({filteredEcrs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("plm.number")}</TableHead>
                        <TableHead>{t("plm.product")}</TableHead>
                        <TableHead>{t("plm.description")}</TableHead>
                        <TableHead>{t("plm.priority")}</TableHead>
                        <TableHead>{t("plm.requester")}</TableHead>
                        <TableHead>{t("plm.status")}</TableHead>
                        <TableHead>{t("plm.eco")}</TableHead>
                        <TableHead>{t("plm.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEcrs.map((ecr) => (
                        <TableRow key={ecr.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-medium">
                            {ecr.number}
                          </TableCell>
                          <TableCell className="text-sm">
                            {ecr.productName}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {ecr.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${PRIORITY_CONFIG[ecr.priority]?.color || ""}`}
                            >
                              {PRIORITY_CONFIG[ecr.priority]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {ecr.requester}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${ECR_STATUS_CONFIG[ecr.status]?.color || ""}`}
                            >
                              {ECR_STATUS_CONFIG[ecr.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {ecr.ecoNumber ? (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                                {ecr.ecoNumber}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!ecr.convertedToECO &&
                                ["draft", "under_review", "approved"].includes(
                                  ecr.status,
                                ) && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-emerald-600"
                                    title={t("plm.convertToECO")}
                                    onClick={() => handleConvertToEco(ecr.id)}
                                  >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title={t("plm.viewDetails")}
                                onClick={() => {}}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ECO List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("plm.ecoList")} ({ecos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ecos.map((eco) => (
                  <div key={eco.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm font-medium">
                          {eco.ecrNumber}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {eco.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${ECO_STATUS_CONFIG[eco.status]?.color || ""}`}
                        >
                          {ECO_STATUS_CONFIG[eco.status]?.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedEco(eco);
                            setEcoDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" /> {t("plm.details")}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">
                          {t("plm.team")}:
                        </span>{" "}
                        <span className="font-medium">{eco.assignedTeam}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("plm.targetDate")}:
                        </span>{" "}
                        <span className="font-medium">
                          {eco.targetDate || "-"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">
                            {t("plm.completion")}:
                          </span>
                          <span className="font-medium">{eco.completion}%</span>
                        </div>
                        <Progress value={eco.completion} className="h-2" />
                      </div>
                    </div>
                    {/* Approval chain */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {t("plm.approvalChain")}:
                      </span>
                      {eco.approvalChain.map((approver, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-700"
                          >
                            <Shield className="h-3 w-3 mr-0.5" /> {approver}
                          </Badge>
                          {idx < eco.approvalChain.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TAB 6: ANALYTICS ====== */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time to Market Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.timeToMarketTrend")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_TTM_TREND}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="days"
                        stroke="#10b981"
                        strokeWidth={2}
                        name={t("plm.daysAvg")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Product Complexity vs Cost */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.complexityVsCost")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_COMPLEXITY_COST}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar
                        dataKey="cost"
                        fill="#6366f1"
                        name={t("plm.costRSD")}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Frequency by Product */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.changeFrequency")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHANGE_FREQ} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        width={80}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="changes"
                        fill="#f59e0b"
                        name={t("plm.changes")}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Approval Cycle Time Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.approvalCycleTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_APPROVAL_CYCLE}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#06b6d4"
                        name={t("plm.revisions")}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Gate Pass Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.stageGatePassRate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { stage: "Koncept → Dizajn", rate: 92 },
                    { stage: "Dizajn → Prototip", rate: 87 },
                    { stage: "Prototip → Testiranje", rate: 78 },
                    { stage: "Testiranje → Lansiranje", rate: 85 },
                    { stage: "Lansiranje → Proizvodnja", rate: 95 },
                  ].map((item) => (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {item.stage}
                        </span>
                        <span
                          className={`text-xs font-bold ${item.rate >= 90 ? "text-green-600" : item.rate >= 80 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {item.rate}%
                        </span>
                      </div>
                      <Progress value={item.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Innovators */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("plm.topInnovators")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_TOP_INNOVATORS.map((innovator, idx) => (
                    <div
                      key={innovator.name}
                      className="flex items-center gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {innovator.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{
                                width: `${(innovator.approved / MOCK_TOP_INNOVATORS[0].approved) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-primary">
                            {innovator.approved}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ====== DIALOGS ====== */}

      {/* New Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plm.newProduct")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("plm.name")}</Label>
              <Input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm({ ...productForm, sku: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("plm.category")}</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) =>
                    setProductForm({ ...productForm, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    <SelectItem value="Ostalo">Ostalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.lifecycleStage")}</Label>
                <Select
                  value={productForm.lifecycleStage}
                  onValueChange={(v) =>
                    setProductForm({ ...productForm, lifecycleStage: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("plm.status")}</Label>
                <Select
                  value={productForm.status}
                  onValueChange={(v) =>
                    setProductForm({ ...productForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.version")}</Label>
                <Input
                  value={productForm.version}
                  onChange={(e) =>
                    setProductForm({ ...productForm, version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("plm.owner")}</Label>
                <Input
                  value={productForm.owner}
                  onChange={(e) =>
                    setProductForm({ ...productForm, owner: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("plm.description")}</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
            >
              {t("plm.cancel")}
            </Button>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={productDetailOpen} onOpenChange={setProductDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>{" "}
                  <span className="font-mono font-medium">
                    {selectedProduct.sku}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.category")}:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedProduct.category}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.version")}:
                  </span>{" "}
                  <span className="font-mono font-medium">
                    v{selectedProduct.version}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.lifecycleStage")}:
                  </span>{" "}
                  <Badge
                    variant="outline"
                    className={
                      STAGE_CONFIG[selectedProduct.lifecycleStage]?.color
                    }
                  >
                    {STAGE_CONFIG[selectedProduct.lifecycleStage]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.status")}:
                  </span>{" "}
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[selectedProduct.status]?.color}
                  >
                    {STATUS_CONFIG[selectedProduct.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.owner")}:
                  </span>{" "}
                  <span className="font-medium">{selectedProduct.owner}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.revisions")}:
                  </span>{" "}
                  <span className="font-bold">
                    {selectedProduct.revisionCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("plm.bom")}:</span>{" "}
                  <span className="font-mono text-xs">
                    {selectedProduct.bomRef || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.lastUpdated")}:
                  </span>{" "}
                  <span>{selectedProduct.lastUpdated}</span>
                </div>
              </div>
              {selectedProduct.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">
                      {t("plm.description")}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProduct.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Version History */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t("plm.versionHistory")}
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("plm.version")}</TableHead>
                        <TableHead>{t("plm.description")}</TableHead>
                        <TableHead>{t("plm.date")}</TableHead>
                        <TableHead>{t("plm.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revisions
                        .filter((r) => r.productId === selectedProduct.id)
                        .map((rev) => (
                          <TableRow key={rev.id}>
                            <TableCell className="font-mono text-xs">
                              v{rev.version}
                            </TableCell>
                            <TableCell className="text-sm">
                              {rev.description}
                            </TableCell>
                            <TableCell className="text-xs">
                              {rev.date}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${REVISION_STATUS_CONFIG[rev.status]?.color || ""}`}
                              >
                                {REVISION_STATUS_CONFIG[rev.status]?.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {revisions.filter(
                        (r) => r.productId === selectedProduct.id,
                      ).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground text-sm py-4"
                          >
                            {t("plm.noRevisions")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Linked Documents */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t("plm.linkedDocuments")}
                </h4>
                <div className="space-y-2">
                  {documents
                    .filter((d) => d.productId === selectedProduct.id)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 border rounded-md p-2"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1 truncate">
                          {doc.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] shrink-0 ${DOC_TYPE_CONFIG[doc.docType]?.color || ""}`}
                        >
                          {DOC_TYPE_CONFIG[doc.docType]?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          v{doc.version}
                        </span>
                      </div>
                    ))}
                  {documents.filter((d) => d.productId === selectedProduct.id)
                    .length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      {t("plm.noDocuments")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plm.newRevision")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("plm.product")}</Label>
              <Select
                value={revisionForm.productId}
                onValueChange={(v) =>
                  setRevisionForm({ ...revisionForm, productId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("plm.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (v{p.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.version")}</Label>
                <Input
                  value={revisionForm.version}
                  onChange={(e) =>
                    setRevisionForm({
                      ...revisionForm,
                      version: e.target.value,
                    })
                  }
                  placeholder="npr. 3.3.0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("plm.changeType")}</Label>
                <Select
                  value={revisionForm.changeType}
                  onValueChange={(v) =>
                    setRevisionForm({ ...revisionForm, changeType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Major">Major</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Patch">Patch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("plm.description")}</Label>
              <Textarea
                value={revisionForm.description}
                onChange={(e) =>
                  setRevisionForm({
                    ...revisionForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("plm.affectedComponents")}</Label>
              <Input
                value={revisionForm.affectedComponents}
                onChange={(e) =>
                  setRevisionForm({
                    ...revisionForm,
                    affectedComponents: e.target.value,
                  })
                }
                placeholder="npr. U9, R12, C5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevisionDialogOpen(false)}
            >
              {t("plm.cancel")}
            </Button>
            <Button onClick={handleCreateRevision}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.createRevision")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Document Dialog */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plm.newDocument")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("plm.title")}</Label>
              <Input
                value={docForm.title}
                onChange={(e) =>
                  setDocForm({ ...docForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.product")}</Label>
                <Select
                  value={docForm.productId}
                  onValueChange={(v) =>
                    setDocForm({ ...docForm, productId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("plm.selectProduct")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("plm.type")}</Label>
                <Select
                  value={docForm.docType}
                  onValueChange={(v) => setDocForm({ ...docForm, docType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_TYPE_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.version")}</Label>
                <Input
                  value={docForm.version}
                  onChange={(e) =>
                    setDocForm({ ...docForm, version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("plm.status")}</Label>
                <Select
                  value={docForm.status}
                  onValueChange={(v) => setDocForm({ ...docForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("plm.draft")}</SelectItem>
                    <SelectItem value="submitted">
                      {t("plm.submitted")}
                    </SelectItem>
                    <SelectItem value="approved">
                      {t("plm.approved")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("plm.uploadFile")}
              </span>
              <Button variant="outline" size="sm" className="ml-auto">
                <FolderOpen className="h-3.5 w-3.5 mr-1" /> {t("plm.browse")}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocDialogOpen(false)}>
              {t("plm.cancel")}
            </Button>
            <Button onClick={handleCreateDoc}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New ECR Dialog */}
      <Dialog open={ecrDialogOpen} onOpenChange={setEcrDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plm.newECR")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("plm.product")}</Label>
              <Select
                value={ecrForm.productId}
                onValueChange={(v) => setEcrForm({ ...ecrForm, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("plm.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("plm.description")}</Label>
              <Textarea
                value={ecrForm.description}
                onChange={(e) =>
                  setEcrForm({ ...ecrForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plm.priority")}</Label>
                <Select
                  value={ecrForm.priority}
                  onValueChange={(v) => setEcrForm({ ...ecrForm, priority: v })}
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
              <div className="space-y-2">
                <Label>{t("plm.affectedAreas")}</Label>
                <Input
                  value={ecrForm.affectedAreas}
                  onChange={(e) =>
                    setEcrForm({ ...ecrForm, affectedAreas: e.target.value })
                  }
                  placeholder="npr. Hardver, Firmware"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("plm.justification")}</Label>
              <Textarea
                value={ecrForm.justification}
                onChange={(e) =>
                  setEcrForm({ ...ecrForm, justification: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEcrDialogOpen(false)}>
              {t("plm.cancel")}
            </Button>
            <Button onClick={handleCreateEcr}>
              <Plus className="h-4 w-4 mr-1" /> {t("plm.createECR")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ECO Detail Dialog */}
      <Dialog open={ecoDialogOpen} onOpenChange={setEcoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("plm.ecoDetails")}</DialogTitle>
          </DialogHeader>
          {selectedEco && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ECR:</span>{" "}
                  <span className="font-mono font-medium">
                    {selectedEco.ecrNumber}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.product")}:
                  </span>{" "}
                  <span className="font-medium">{selectedEco.productName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.status")}:
                  </span>{" "}
                  <Badge
                    variant="outline"
                    className={ECO_STATUS_CONFIG[selectedEco.status]?.color}
                  >
                    {ECO_STATUS_CONFIG[selectedEco.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.completion")}:
                  </span>{" "}
                  <span className="font-bold">{selectedEco.completion}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.team")}:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedEco.assignedTeam}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("plm.targetDate")}:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedEco.targetDate || "-"}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium">
                  {t("plm.implementationPlan")}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedEco.implementationPlan}
                </p>
              </div>
              <Progress value={selectedEco.completion} className="h-3" />
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t("plm.approvalChain")}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedEco.approvalChain.map((approver, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div className="flex items-center gap-1.5 border rounded-md px-2 py-1">
                        <Shield className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs font-medium">{approver}</span>
                      </div>
                      {idx < selectedEco.approvalChain.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
