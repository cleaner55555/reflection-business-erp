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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Award,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  Target,
  BookOpen,
  Star,
  Lightbulb,
  ChevronRight,
  Zap,
  Shield,
  Code,
  Database,
  Globe,
  Palette,
  Brain,
  Wrench,
  UserCheck,
  BarChart2,
  ListChecks,
  FileCheck,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: SkillLevel;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

interface SkillLevel {
  id: string;
  name: string;
  value: number;
  color: string;
  description: string;
}

interface EmployeeSkill {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  skillId: string;
  skillName: string;
  level: number;
  yearsExperience: number;
  lastAssessed: string;
  certification?: string;
}

interface Certification {
  id: string;
  name: string;
  employeeId: string;
  employeeName: string;
  skillId: string;
  skillName: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  certificateNumber?: string;
}

interface SkillAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  skillId: string;
  skillName: string;
  previousLevel: number;
  newLevel: number;
  assessedBy: string;
  assessmentDate: string;
  notes: string;
}

interface SkillGap {
  skillName: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  employeeCount: number;
  priority: string;
}

interface SkillsDashboard {
  totalSkills: number;
  totalCategories: number;
  certifiedEmployees: number;
  averageSkillLevel: number;
  skillCoverage: number;
  totalCertifications: number;
  expiringCertifications: number;
  topSkills: Array<{ name: string; employeeCount: number; avgLevel: number }>;
  skillsByCategory: Array<{ category: string; count: number; color: string }>;
  recentAssessments: SkillAssessment[];
  skillGaps: SkillGap[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const skillLevels: SkillLevel[] = [
  {
    id: "beginner",
    name: "Početnik",
    value: 1,
    color: "bg-gray-400",
    description: "Osnovno znanje",
  },
  {
    id: "elementary",
    name: "Elementarni",
    value: 2,
    color: "bg-blue-400",
    description: "Razume osnove, može raditi pod nadzorom",
  },
  {
    id: "intermediate",
    name: "Srednji",
    value: 3,
    color: "bg-yellow-400",
    description: "Samostalan rad, solidno znanje",
  },
  {
    id: "advanced",
    name: "Napredni",
    value: 4,
    color: "bg-orange-400",
    description: "Duboko znanje, može voditi projekte",
  },
  {
    id: "expert",
    name: "Ekspert",
    value: 5,
    color: "bg-red-400",
    description: "Najviši nivo, mentori ostale",
  },
];

const skillCategories = [
  {
    id: "programming",
    name: "Programiranje",
    icon: <Code className="h-4 w-4" />,
    color: "#3b82f6",
  },
  {
    id: "database",
    name: "Baze podataka",
    icon: <Database className="h-4 w-4" />,
    color: "#8b5cf6",
  },
  {
    id: "devops",
    name: "DevOps & Infrastruktura",
    icon: <Wrench className="h-4 w-4" />,
    color: "#f97316",
  },
  {
    id: "design",
    name: "Dizajn",
    icon: <Palette className="h-4 w-4" />,
    color: "#ec4899",
  },
  {
    id: "soft_skills",
    name: "Meke veštine",
    icon: <Users className="h-4 w-4" />,
    color: "#10b981",
  },
  {
    id: "management",
    name: "Menadžment",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "#f59e0b",
  },
  {
    id: "languages",
    name: "Jezici",
    icon: <Globe className="h-4 w-4" />,
    color: "#06b6d4",
  },
  {
    id: "analytical",
    name: "Analitika",
    icon: <Brain className="h-4 w-4" />,
    color: "#6366f1",
  },
];

const certStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktivan", color: "bg-green-100 text-green-700" },
  expired: { label: "Istekao", color: "bg-red-100 text-red-700" },
  expiring_soon: {
    label: "Uskoro ističe",
    color: "bg-amber-100 text-amber-700",
  },
  revoked: { label: "Opozvan", color: "bg-gray-100 text-gray-700" },
};

const gapPriorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Kritičan", color: "bg-red-100 text-red-700" },
  high: { label: "Visok", color: "bg-orange-100 text-orange-700" },
  medium: { label: "Srednji", color: "bg-amber-100 text-amber-700" },
  low: { label: "Nizak", color: "bg-blue-100 text-blue-700" },
};

const mockSkills: Skill[] = [
  {
    id: "sk-1",
    name: "JavaScript",
    category: "programming",
    description: "JavaScript programski jezik za web razvoj",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 12,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-2",
    name: "TypeScript",
    category: "programming",
    description: "TypeScript - tipizirani JavaScript",
    level: skillLevels[4],
    isActive: true,
    employeeCount: 10,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-3",
    name: "React",
    category: "programming",
    description: "React biblioteka za korisničke interfejse",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 9,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-4",
    name: "Node.js",
    category: "programming",
    description: "Node.js runtime za server-side JavaScript",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 7,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-5",
    name: "Python",
    category: "programming",
    description: "Python programski jezik",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 6,
    createdAt: "2024-02-01",
  },
  {
    id: "sk-6",
    name: "PostgreSQL",
    category: "database",
    description: "PostgreSQL relaciona baza podataka",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 8,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-7",
    name: "MongoDB",
    category: "database",
    description: "MongoDB NoSQL baza podataka",
    level: skillLevels[2],
    isActive: true,
    employeeCount: 4,
    createdAt: "2024-03-01",
  },
  {
    id: "sk-8",
    name: "Docker",
    category: "devops",
    description: "Docker kontejnerizacija",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 6,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-9",
    name: "Kubernetes",
    category: "devops",
    description: "Kubernetes orkestracija kontejnera",
    level: skillLevels[2],
    isActive: true,
    employeeCount: 3,
    createdAt: "2024-02-01",
  },
  {
    id: "sk-10",
    name: "Figma",
    category: "design",
    description: "Figma alat za UI/UX dizajn",
    level: skillLevels[2],
    isActive: true,
    employeeCount: 4,
    createdAt: "2024-03-01",
  },
  {
    id: "sk-11",
    name: "Komunikacija",
    category: "soft_skills",
    description: "Komunikacione veštine",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 18,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-12",
    name: "Timski rad",
    category: "soft_skills",
    description: "Rad u timu",
    level: skillLevels[4],
    isActive: true,
    employeeCount: 20,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-13",
    name: "Engleski jezik",
    category: "languages",
    description: "Engleski jezik - poslovni",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 15,
    createdAt: "2024-01-01",
  },
  {
    id: "sk-14",
    name: "Nemački jezik",
    category: "languages",
    description: "Nemački jezik",
    level: skillLevels[1],
    isActive: true,
    employeeCount: 3,
    createdAt: "2024-04-01",
  },
  {
    id: "sk-15",
    name: "Projektni menadžment",
    category: "management",
    description: "Upravljanje projektima",
    level: skillLevels[3],
    isActive: true,
    employeeCount: 5,
    createdAt: "2024-02-01",
  },
];

const mockEmployeeSkills: EmployeeSkill[] = [
  {
    id: "es-1",
    employeeId: "emp-1",
    employeeName: "Marko Petrović",
    employeeDepartment: "Razvoj",
    skillId: "sk-1",
    skillName: "JavaScript",
    level: 4,
    yearsExperience: 6,
    lastAssessed: "2025-01-10",
  },
  {
    id: "es-2",
    employeeId: "emp-1",
    employeeName: "Marko Petrović",
    employeeDepartment: "Razvoj",
    skillId: "sk-2",
    skillName: "TypeScript",
    level: 5,
    yearsExperience: 4,
    lastAssessed: "2025-01-10",
    certification: "MS TypeScript Certified",
  },
  {
    id: "es-3",
    employeeId: "emp-1",
    employeeName: "Marko Petrović",
    employeeDepartment: "Razvoj",
    skillId: "sk-3",
    skillName: "React",
    level: 4,
    yearsExperience: 5,
    lastAssessed: "2025-01-10",
  },
  {
    id: "es-4",
    employeeId: "emp-2",
    employeeName: "Ana Nikolić",
    employeeDepartment: "Razvoj",
    skillId: "sk-2",
    skillName: "TypeScript",
    level: 5,
    yearsExperience: 7,
    lastAssessed: "2025-01-12",
  },
  {
    id: "es-5",
    employeeId: "emp-2",
    employeeName: "Ana Nikolić",
    employeeDepartment: "Razvoj",
    skillId: "sk-3",
    skillName: "React",
    level: 5,
    yearsExperience: 6,
    lastAssessed: "2025-01-12",
  },
  {
    id: "es-6",
    employeeId: "emp-2",
    employeeName: "Ana Nikolić",
    employeeDepartment: "Razvoj",
    skillId: "sk-6",
    skillName: "PostgreSQL",
    level: 3,
    yearsExperience: 3,
    lastAssessed: "2025-01-12",
  },
  {
    id: "es-7",
    employeeId: "emp-3",
    employeeName: "Jelena Stanković",
    employeeDepartment: "Razvoj",
    skillId: "sk-4",
    skillName: "Node.js",
    level: 4,
    yearsExperience: 5,
    lastAssessed: "2025-01-08",
  },
  {
    id: "es-8",
    employeeId: "emp-3",
    employeeName: "Jelena Stanković",
    employeeDepartment: "Razvoj",
    skillId: "sk-8",
    skillName: "Docker",
    level: 4,
    yearsExperience: 4,
    lastAssessed: "2025-01-08",
  },
  {
    id: "es-9",
    employeeId: "emp-3",
    employeeName: "Jelena Stanković",
    employeeDepartment: "Razvoj",
    skillId: "sk-9",
    skillName: "Kubernetes",
    level: 3,
    yearsExperience: 2,
    lastAssessed: "2025-01-08",
  },
  {
    id: "es-10",
    employeeId: "emp-4",
    employeeName: "Petar Jovanović",
    employeeDepartment: "Razvoj",
    skillId: "sk-5",
    skillName: "Python",
    level: 5,
    yearsExperience: 8,
    lastAssessed: "2025-01-15",
  },
  {
    id: "es-11",
    employeeId: "emp-4",
    employeeName: "Petar Jovanović",
    employeeDepartment: "Razvoj",
    skillId: "sk-6",
    skillName: "PostgreSQL",
    level: 5,
    yearsExperience: 8,
    lastAssessed: "2025-01-15",
    certification: "PostgreSQL Certified Professional",
  },
  {
    id: "es-12",
    employeeId: "emp-5",
    employeeName: "Ivan Đorđević",
    employeeDepartment: "Dizajn",
    skillId: "sk-10",
    skillName: "Figma",
    level: 4,
    yearsExperience: 3,
    lastAssessed: "2025-01-05",
  },
  {
    id: "es-13",
    employeeId: "emp-5",
    employeeName: "Ivan Đorđević",
    employeeDepartment: "Dizajn",
    skillId: "sk-1",
    skillName: "JavaScript",
    level: 3,
    yearsExperience: 3,
    lastAssessed: "2025-01-05",
  },
  {
    id: "es-14",
    employeeId: "emp-6",
    employeeName: "Nikola Ilić",
    employeeDepartment: "DevOps",
    skillId: "sk-8",
    skillName: "Docker",
    level: 5,
    yearsExperience: 6,
    lastAssessed: "2025-01-14",
  },
  {
    id: "es-15",
    employeeId: "emp-6",
    employeeName: "Nikola Ilić",
    employeeDepartment: "DevOps",
    skillId: "sk-9",
    skillName: "Kubernetes",
    level: 4,
    yearsExperience: 4,
    lastAssessed: "2025-01-14",
    certification: "CKA - Kubernetes Administrator",
  },
];

const mockCertifications: Certification[] = [
  {
    id: "cert-1",
    name: "MS TypeScript Certified",
    employeeId: "emp-1",
    employeeName: "Marko Petrović",
    skillId: "sk-2",
    skillName: "TypeScript",
    issuedBy: "Microsoft",
    issueDate: "2024-06-15",
    expiryDate: "2026-06-15",
    status: "active",
    certificateNumber: "MS-TS-2024-1234",
  },
  {
    id: "cert-2",
    name: "AWS Solutions Architect",
    employeeId: "emp-4",
    employeeName: "Petar Jovanović",
    skillId: "sk-5",
    skillName: "Python",
    issuedBy: "Amazon",
    issueDate: "2024-03-20",
    expiryDate: "2027-03-20",
    status: "active",
    certificateNumber: "AWS-SA-2024-5678",
  },
  {
    id: "cert-3",
    name: "PostgreSQL Certified Professional",
    employeeId: "emp-4",
    employeeName: "Petar Jovanović",
    skillId: "sk-6",
    skillName: "PostgreSQL",
    issuedBy: "PostgreSQL Global",
    issueDate: "2023-11-10",
    expiryDate: "2025-11-10",
    status: "expiring_soon",
    certificateNumber: "PG-CP-2023-9012",
  },
  {
    id: "cert-4",
    name: "CKA - Kubernetes Administrator",
    employeeId: "emp-6",
    employeeName: "Nikola Ilić",
    skillId: "sk-9",
    skillName: "Kubernetes",
    issuedBy: "CNCF",
    issueDate: "2024-08-01",
    expiryDate: "2027-08-01",
    status: "active",
    certificateNumber: "CKA-2024-3456",
  },
  {
    id: "cert-5",
    name: "Docker Certified Associate",
    employeeId: "emp-6",
    employeeName: "Nikola Ilić",
    skillId: "sk-8",
    skillName: "Docker",
    issuedBy: "Docker Inc.",
    issueDate: "2023-05-15",
    expiryDate: "2025-05-15",
    status: "expired",
    certificateNumber: "DCA-2023-7890",
  },
  {
    id: "cert-6",
    name: "Google UX Design Certificate",
    employeeId: "emp-5",
    employeeName: "Ivan Đorđević",
    skillId: "sk-10",
    skillName: "Figma",
    issuedBy: "Google",
    issueDate: "2024-09-01",
    expiryDate: "2026-09-01",
    status: "active",
    certificateNumber: "GUX-2024-1111",
  },
];

const mockAssessments: SkillAssessment[] = [
  {
    id: "assess-1",
    employeeId: "emp-1",
    employeeName: "Marko Petrović",
    skillId: "sk-2",
    skillName: "TypeScript",
    previousLevel: 4,
    newLevel: 5,
    assessedBy: "Ana Nikolić",
    assessmentDate: "2025-01-10",
    notes: "Odlično poznavanje naprednih tipova i generika",
  },
  {
    id: "assess-2",
    employeeId: "emp-2",
    employeeName: "Ana Nikolić",
    skillId: "sk-3",
    skillName: "React",
    previousLevel: 4,
    newLevel: 5,
    assessedBy: "Jelena Stanković",
    assessmentDate: "2025-01-12",
    notes: "Implementirala kompleksan state management sistem",
  },
  {
    id: "assess-3",
    employeeId: "emp-3",
    employeeName: "Jelena Stanković",
    skillId: "sk-9",
    skillName: "Kubernetes",
    previousLevel: 2,
    newLevel: 3,
    assessedBy: "Nikola Ilić",
    assessmentDate: "2025-01-08",
    notes: "Uspješno deployovala microservices arhitekturu",
  },
  {
    id: "assess-4",
    employeeId: "emp-5",
    employeeName: "Ivan Đorđević",
    skillId: "sk-10",
    skillName: "Figma",
    previousLevel: 3,
    newLevel: 4,
    assessedBy: "Ana Nikolić",
    assessmentDate: "2025-01-05",
    notes: "Kreirao design system za ceo tim",
  },
  {
    id: "assess-5",
    employeeId: "emp-6",
    employeeName: "Nikola Ilić",
    skillId: "sk-8",
    skillName: "Docker",
    previousLevel: 4,
    newLevel: 5,
    assessedBy: "Petar Jovanović",
    assessmentDate: "2025-01-14",
    notes: "Optimizovao Docker image za produkciju",
  },
];

const mockGaps: SkillGap[] = [
  {
    skillName: "Kubernetes",
    requiredLevel: 4,
    currentLevel: 2.5,
    gap: 1.5,
    employeeCount: 6,
    priority: "critical",
  },
  {
    skillName: "Python",
    requiredLevel: 3,
    currentLevel: 1.8,
    gap: 1.2,
    employeeCount: 8,
    priority: "high",
  },
  {
    skillName: "TypeScript",
    requiredLevel: 4,
    currentLevel: 3.2,
    gap: 0.8,
    employeeCount: 5,
    priority: "high",
  },
  {
    skillName: "PostgreSQL",
    requiredLevel: 3,
    currentLevel: 2.3,
    gap: 0.7,
    employeeCount: 4,
    priority: "medium",
  },
  {
    skillName: "Figma",
    requiredLevel: 3,
    currentLevel: 2.5,
    gap: 0.5,
    employeeCount: 3,
    priority: "low",
  },
  {
    skillName: "Projektni menadžment",
    requiredLevel: 3,
    currentLevel: 2.0,
    gap: 1.0,
    employeeCount: 7,
    priority: "medium",
  },
];

const mockDashboard: SkillsDashboard = {
  totalSkills: 15,
  totalCategories: 8,
  certifiedEmployees: 5,
  averageSkillLevel: 3.4,
  skillCoverage: 72,
  totalCertifications: 6,
  expiringCertifications: 1,
  topSkills: [
    { name: "Timski rad", employeeCount: 20, avgLevel: 4.0 },
    { name: "Komunikacija", employeeCount: 18, avgLevel: 3.5 },
    { name: "Engleski jezik", employeeCount: 15, avgLevel: 3.2 },
    { name: "JavaScript", employeeCount: 12, avgLevel: 3.8 },
    { name: "TypeScript", employeeCount: 10, avgLevel: 4.2 },
  ],
  skillsByCategory: [
    { category: "Programiranje", count: 5, color: "#3b82f6" },
    { category: "Baze podataka", count: 2, color: "#8b5cf6" },
    { category: "DevOps", count: 2, color: "#f97316" },
    { category: "Dizajn", count: 1, color: "#ec4899" },
    { category: "Meke veštine", count: 2, color: "#10b981" },
    { category: "Menadžment", count: 1, color: "#f59e0b" },
    { category: "Jezici", count: 2, color: "#06b6d4" },
  ],
  recentAssessments: mockAssessments.slice(0, 3),
  skillGaps: mockGaps.slice(0, 3),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function VeštineContent() {
  const { activeCompanyId } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Forms
  const emptySkillForm = { name: "", category: "programming", description: "" };
  const [skillForm, setSkillForm] = useState(emptySkillForm);

  const emptyEmpSkillForm = {
    employeeId: "",
    employeeName: "",
    skillId: "",
    level: 3,
    yearsExperience: 0,
  };
  const [empSkillForm, setEmpSkillForm] = useState(emptyEmpSkillForm);

  const emptyCertForm = {
    name: "",
    employeeId: "",
    employeeName: "",
    skillId: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
  };
  const [certForm, setCertForm] = useState(emptyCertForm);

  const emptyAssessForm = {
    employeeId: "",
    employeeName: "",
    skillId: "",
    previousLevel: 3,
    newLevel: 4,
    notes: "",
  };
  const [assessForm, setAssessForm] = useState(emptyAssessForm);

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadSkills = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/skills?companyId=${activeCompanyId}&limit=100`,
      );
      if (res.ok) {
        const data = await res.json();
        setSkills(data.items?.length ? data.items : mockSkills);
      } else {
        setSkills(mockSkills);
      }
    } catch {
      setSkills(mockSkills);
    }
    setLoading(false);
  }, [activeCompanyId]);

  const loadEmployeeSkills = useCallback(async () => {
    try {
      setEmployeeSkills(mockEmployeeSkills);
    } catch {
      setEmployeeSkills(mockEmployeeSkills);
    }
  }, []);

  const loadCertifications = useCallback(async () => {
    try {
      setCertifications(mockCertifications);
    } catch {
      setCertifications(mockCertifications);
    }
  }, []);

  const loadAssessments = useCallback(async () => {
    try {
      setAssessments(mockAssessments);
    } catch {
      setAssessments(mockAssessments);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(
        `/api/skills/dashboard?companyId=${activeCompanyId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      } else {
        setDashboard(mockDashboard);
      }
    } catch {
      setDashboard(mockDashboard);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadSkills();
    loadEmployeeSkills();
    loadCertifications();
    loadAssessments();
    loadDashboard();
  }, [
    activeCompanyId,
    loadSkills,
    loadEmployeeSkills,
    loadCertifications,
    loadAssessments,
    loadDashboard,
  ]);

  // ─── Computed ───────────────────────────────────────────────────────────

  const filteredSkills = skills.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    return true;
  });

  const uniqueEmployees = [
    ...new Map(
      employeeSkills.map((es) => [
        es.employeeId,
        {
          id: es.employeeId,
          name: es.employeeName,
          department: es.employeeDepartment,
        },
      ]),
    ).values(),
  ];

  const matrixSkills = skills.filter((s) => s.isActive).slice(0, 10);
  const matrixEmployees =
    matrixEmployee === "all"
      ? uniqueEmployees.slice(0, 8)
      : uniqueEmployees.filter((e) => e.id === matrixEmployee);

  const getEmployeeSkillLevel = (employeeId: string, skillId: string) => {
    const es = employeeSkills.find(
      (e) => e.employeeId === employeeId && e.skillId === skillId,
    );
    return es ? es.level : 0;
  };

  const getLevelColor = (level: number) => {
    if (level >= 5) return "bg-red-100 text-red-700";
    if (level >= 4) return "bg-orange-100 text-orange-700";
    if (level >= 3) return "bg-yellow-100 text-yellow-700";
    if (level >= 2) return "bg-blue-100 text-blue-700";
    if (level >= 1) return "bg-gray-100 text-gray-700";
    return "bg-muted text-muted-foreground";
  };

  const getLevelLabel = (level: number) => {
    const sl = skillLevels.find((l) => l.value === level);
    return sl ? sl.name : "-";
  };

  const getCategoryName = (catId: string) => {
    const cat = skillCategories.find((c) => c.id === catId);
    return cat?.name || catId;
  };

  const getCategoryInfo = (catId: string) => {
    return skillCategories.find((c) => c.id === catId);
  };

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleCreateSkill = async () => {
    if (!activeCompanyId || !skillForm.name.trim()) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...skillForm,
          isActive: true,
          employeeCount: 0,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setSkillForm(emptySkillForm);
        loadSkills();
        loadDashboard();
      }
    } catch {
      /* silent */
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Obrisati veštinu?")) return;
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadSkills();
        loadDashboard();
      }
    } catch {
      /* silent */
    }
  };

  const handleCreateEmployeeSkill = async () => {
    if (!empSkillForm.employeeName.trim() || !empSkillForm.skillId) return;
    const newES: EmployeeSkill = {
      id: `es-${Date.now()}`,
      employeeId: empSkillForm.employeeId || `emp-${Date.now()}`,
      employeeName: empSkillForm.employeeName,
      employeeDepartment: "Razvoj",
      skillId: empSkillForm.skillId,
      skillName: skills.find((s) => s.id === empSkillForm.skillId)?.name || "",
      level: empSkillForm.level,
      yearsExperience: empSkillForm.yearsExperience,
      lastAssessed: new Date().toISOString().split("T")[0],
    };
    setEmployeeSkills([...employeeSkills, newES]);
    setEmpSkillDialogOpen(false);
    setEmpSkillForm(emptyEmpSkillForm);
  };

  const handleCreateCertification = async () => {
    if (!certForm.name.trim() || !certForm.employeeName.trim()) return;
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      ...certForm,
      skillName: skills.find((s) => s.id === certForm.skillId)?.name || "",
      status: "active",
    };
    setCertifications([...certifications, newCert]);
    setCertDialogOpen(false);
    setCertForm(emptyCertForm);
  };

  const handleCreateAssessment = async () => {
    if (!assessForm.employeeName.trim() || !assessForm.skillId) return;
    const newAssessment: SkillAssessment = {
      id: `assess-${Date.now()}`,
      employeeId: assessForm.employeeId || `emp-${Date.now()}`,
      employeeName: assessForm.employeeName,
      skillId: assessForm.skillId,
      skillName: skills.find((s) => s.id === assessForm.skillId)?.name || "",
      previousLevel: assessForm.previousLevel,
      newLevel: assessForm.newLevel,
      assessedBy: "Trenutni korisnik",
      assessmentDate: new Date().toISOString().split("T")[0],
      notes: assessForm.notes,
    };
    setAssessments([newAssessment, ...assessments]);
    setAssessDialogOpen(false);
    setAssessForm(emptyAssessForm);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veštine</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje veštinama zaposlenih, sertifikatima i procenama
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadSkills();
              loadDashboard();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSkillForm(emptySkillForm);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Nova veština
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Pregled
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-1" /> Zaposleni
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Zap className="h-4 w-4 mr-1" /> Veštine
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <GraduationCap className="h-4 w-4 mr-1" /> Certifikati
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <Target className="h-4 w-4 mr-1" /> Procena
          </TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {!dashboard ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Ukupno veština
                    </span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{dashboard.totalSkills}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboard.totalCategories} kategorija
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Sertifikovani
                    </span>
                    <GraduationCap className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard.certifiedEmployees}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboard.totalCertifications} sertifikata
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Prosečan nivo
                    </span>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {dashboard.averageSkillLevel}/5
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Pokrivenost
                    </span>
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.skillCoverage}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboard.expiringCertifications} uskoro ističe
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills by Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Veštine po kategorijama
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.skillsByCategory.map((cat) => {
                      const maxCount = Math.max(
                        ...dashboard.skillsByCategory.map((c) => c.count),
                      );
                      return (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{cat.category}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(cat.count / maxCount) * 100}%`,
                                  backgroundColor: cat.color,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-6 text-right">
                              {cat.count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Skill Gaps */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Nedostatak veština
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.skillGaps.map((gap) => {
                      const pCfg = gapPriorityConfig[gap.priority];
                      return (
                        <div
                          key={gap.skillName}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {gap.skillName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {gap.employeeCount} zaposlenih
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${pCfg?.color}`}
                            >
                              {pCfg?.label}
                            </Badge>
                            <span className="text-sm text-red-600 font-medium">
                              -{gap.gap.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Top Skills */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Top veštine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboard.topSkills.map((sk, idx) => (
                      <div
                        key={sk.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-6">
                            {idx + 1}.
                          </span>
                          <span className="text-sm font-medium">{sk.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{sk.employeeCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-sm font-medium">
                              {sk.avgLevel.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-amber-400"
                              style={{ width: `${(sk.avgLevel / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Assessments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Nedavne procene</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboard.recentAssessments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {a.previousLevel}→{a.newLevel}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {a.employeeName} — {a.skillName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.notes}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(a.assessmentDate).toLocaleDateString(
                            "sr-RS",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Zaposleni Tab ───────────────────────────────────────────── */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži zaposlene..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={matrixEmployee} onValueChange={setMatrixEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Svi zaposleni" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi zaposleni</SelectItem>
                {uniqueEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEmpSkillForm(emptyEmpSkillForm);
                setEmpSkillDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Dodeli veštinu
            </Button>
          </div>

          {/* Skill Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Matrica veština</CardTitle>
              <CardDescription>
                Pregled nivoa veština po zaposlenima
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="p-2 sticky left-0 bg-muted/50 min-w-[150px]">
                          Zaposleni
                        </th>
                        {matrixSkills.map((s) => (
                          <th
                            key={s.id}
                            className="p-2 text-center min-w-[80px]"
                          >
                            {s.name}
                          </th>
                        ))}
                        <th className="p-2 text-center min-w-[80px]">Prosek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixEmployees.map((emp) => {
                        const empSkills = employeeSkills.filter(
                          (es) => es.employeeId === emp.id,
                        );
                        const avgLevel =
                          empSkills.length > 0
                            ? empSkills.reduce((sum, es) => sum + es.level, 0) /
                              empSkills.length
                            : 0;
                        return (
                          <tr
                            key={emp.id}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-2 sticky left-0 bg-background font-medium">
                              <div>
                                <p className="text-sm">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {emp.department}
                                </p>
                              </div>
                            </td>
                            {matrixSkills.map((s) => {
                              const level = getEmployeeSkillLevel(emp.id, s.id);
                              return (
                                <td key={s.id} className="p-2 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getLevelColor(level)}`}
                                  >
                                    {level > 0 ? level : "-"}
                                  </Badge>
                                </td>
                              );
                            })}
                            <td className="p-2 text-center">
                              <span className="text-sm font-bold">
                                {avgLevel > 0 ? avgLevel.toFixed(1) : "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Employee Skills Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueEmployees.map((emp) => {
              const empSkills = employeeSkills.filter(
                (es) => es.employeeId === emp.id,
              );
              if (empSkills.length === 0) return null;
              const avgLevel =
                empSkills.reduce((sum, es) => sum + es.level, 0) /
                empSkills.length;
              return (
                <Card key={emp.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.department} · {empSkills.length} veština
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {avgLevel.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          prosek
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {empSkills.map((es) => (
                        <div
                          key={es.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs">{es.skillName}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-muted rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-primary"
                                style={{ width: `${(es.level / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {es.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Veštine Tab ─────────────────────────────────────────────── */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži veštine..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sve kategorije" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {skillCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema veština</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setSkillForm(emptySkillForm);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Kreiraj veštinu
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => {
                const catInfo = getCategoryInfo(skill.category);
                return (
                  <Card
                    key={skill.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: catInfo?.color + "20" }}
                          >
                            <span style={{ color: catInfo?.color }}>
                              {catInfo?.icon || <Zap className="h-4 w-4" />}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">
                              {skill.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {catInfo?.name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={skill.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {skill.isActive ? "Aktivna" : "Neaktivna"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {skill.employeeCount}{" "}
                          zaposlenih
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setSelected(skill);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteSkill(skill.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Certifikati Tab ─────────────────────────────────────────── */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setCertForm(emptyCertForm);
                setCertDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Novi sertifikat
            </Button>
          </div>

          {certifications.length === 0 ? (
            <Card className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema sertifikata</p>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-3">Sertifikat</th>
                    <th className="p-3">Zaposleni</th>
                    <th className="p-3 hidden md:table-cell">Veština</th>
                    <th className="p-3 hidden md:table-cell">Izdavač</th>
                    <th className="p-3 hidden lg:table-cell">Datum</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert) => {
                    const sCfg = certStatusConfig[cert.status];
                    return (
                      <tr key={cert.id} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-sm">{cert.name}</p>
                            {cert.certificateNumber && (
                              <p className="text-xs text-muted-foreground">
                                #{cert.certificateNumber}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{cert.employeeName}</td>
                        <td className="p-3 text-sm hidden md:table-cell">
                          {cert.skillName}
                        </td>
                        <td className="p-3 text-sm hidden md:table-cell">
                          {cert.issuedBy}
                        </td>
                        <td className="p-3 text-xs hidden lg:table-cell">
                          {new Date(cert.issueDate).toLocaleDateString("sr-RS")}
                          {cert.expiryDate && (
                            <span className="text-muted-foreground">
                              {" "}
                              →{" "}
                              {new Date(cert.expiryDate).toLocaleDateString(
                                "sr-RS",
                              )}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${sCfg?.color}`}
                          >
                            {sCfg?.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ─── Procena Tab ─────────────────────────────────────────────── */}
        <TabsContent value="assessment" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Procena i praćenje napretka veština zaposlenih
            </p>
            <Button
              size="sm"
              onClick={() => {
                setAssessForm(emptyAssessForm);
                setAssessDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Nova procena
            </Button>
          </div>

          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Analiza nedostataka veština
              </CardTitle>
              <CardDescription>
                Uporedite zahtevane i trenutne nivoe veština
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockGaps.map((gap) => {
                  const pCfg = gapPriorityConfig[gap.priority];
                  return (
                    <div key={gap.skillName} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium">{gap.skillName}</p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${pCfg?.color}`}
                          >
                            {pCfg?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {gap.employeeCount} zaposlenih
                          </span>
                        </div>
                        <span className="text-sm font-bold text-red-600">
                          -{gap.gap.toFixed(1)} nivoa
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground w-12">
                              Zahtevano:
                            </span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-400"
                                style={{
                                  width: `${(gap.requiredLevel / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium w-4">
                              {gap.requiredLevel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">
                              Trenutno:
                            </span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-orange-400"
                                style={{
                                  width: `${(gap.currentLevel / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium w-4">
                              {gap.currentLevel.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Assessment History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Istorija procena</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nema procena
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {assessments.map((a) => {
                    const improved = a.newLevel > a.previousLevel;
                    return (
                      <div
                        key={a.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${improved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {a.previousLevel}→{a.newLevel}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {a.employeeName} — {a.skillName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(a.assessmentDate).toLocaleDateString(
                                "sr-RS",
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.notes}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Procenio: {a.assessedBy}
                            </span>
                            <Badge
                              variant={improved ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {improved ? "🟢 Napredak" : "🟡 Na istom nivou"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create Skill Dialog ──────────────────────────────────────────── */}

      {/* ─── Assign Skill Dialog ──────────────────────────────────────────── */}

      {/* ─── Certification Dialog ─────────────────────────────────────────── */}

      {/* ─── Assessment Dialog ────────────────────────────────────────────── */}

      {/* ─── Skill Detail Dialog ──────────────────────────────────────────── */}
    </div>
  );
}
