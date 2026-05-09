 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Eye, Trash2, RefreshCw, Filter,
  CheckCircle2, Clock, XCircle, AlertTriangle, Gift, Star,
  TrendingUp, CalendarDays, Users, Crown, Award, Percent,
  ShoppingBag, Zap, BarChart3, ChevronRight, Heart,
  CircleDollarSign, GiftIcon, Trophy, Medal, Sparkles
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface LoyaltyMember {
  id: string
  cardNumber: string
  partnerName: string
  partnerId: string
  tier: string
  points: number
  totalSpent: number
  lifetimePoints: number
  joinDate: string
  lastActivity: string
  status: string
  email: string
  phone: string
  referralCode: string
  referralCount: number
  purchaseCount: number
  avgPurchase: number
}

interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  maxPoints: number
  minSpent: number
  pointsMultiplier: number
  discountPct: number
  benefits: string[]
  color: string
  icon: string
  memberCount: number
}

interface RewardItem {
  id: string
  name: string
  description: string
  category: string
  pointsCost: number
  pointsValue: number
  imageUrl: string
  stock: number
  claimed: number
  active: boolean
  availableFrom: string
  availableTo: string
  maxPerMember: number
  tierRequired: string
}

interface PointsTransaction {
  id: string
  memberName: string
  cardNumber: string
  type: string
  points: number
  balance: number
  description: string
  reference: string
  date: string
  expiryDate: string | null
  status: string
}

interface PromoCampaign {
  id: string
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  pointsMultiplier: number
  bonusPoints: number
  minPurchase: number
  maxBonus: number
  participatingTiers: string[]
  redemptions: number
  totalAwarded: number
  budget: number
  budgetUsed: number
}

interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  newThisMonth: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  totalRevenue: number
  avgOrderValue: number
  retentionRate: number
  topTierMembers: number
  tierDistribution: Array<{ tier: string; count: number; color: string }>
  monthlyActivity: Array<{ month: string; earned: number; redeemed: number; newMembers: number }>
  topSpenders: Array<{ name: string; spent: number; points: number; tier: string }>
  popularRewards: Array<{ name: string; claimed: number; cost: number }>
}

// ============ CONFIG ============

const TIER_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  bronze: { label: 'Bronza', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: '🥉' },
  silver: { label: 'Srebro', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30', icon: '🥈' },
  gold: { label: 'Zlato', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', icon: '🥇' },
  platinum: { label: 'Platina', color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', icon: '💎' },
  diamond: { label: 'Dijamant', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: '💠' },
}

const TX_TYPE: Record<string, { label: string; color: string }> = {
  earned: { label: 'Zarađeni', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  redeemed: { label: 'Iskorišćeni', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  expired: { label: 'Istekli', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  adjusted: { label: 'Korekcija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bonus: { label: 'Bonus', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  referral: { label: 'Preporuka', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

const PROMO_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  scheduled: { label: 'Zakazana', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  expired: { label: 'Istekla', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  paused: { label: 'Pauzirana', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const REWARD_CATEGORIES = ['Proizvodi', 'Popusti', 'Iskustva', 'Pokloni', 'Darovnice', 'Upgrade', 'VIP', 'Dostava']

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// ============ MOCK DATA ============

const mockMembers: LoyaltyMember[] = [
  { id: 'lm-1', cardNumber: 'LOY-00001', partnerName: 'Jelena Marković', partnerId: 'p1', tier: 'diamond', points: 28500, totalSpent: 1850000, lifetimePoints: 42000, joinDate: '2022-03-15', lastActivity: '2025-01-20', status: 'active', email: 'jelena.m@email.com', phone: '+381631112233', referralCode: 'JELM25', referralCount: 8, purchaseCount: 156, avgPurchase: 11859 },
  { id: 'lm-2', cardNumber: 'LOY-00002', partnerName: 'Dragan Petrović', partnerId: 'p2', tier: 'platinum', points: 18200, totalSpent: 1200000, lifetimePoints: 28500, joinDate: '2022-06-20', lastActivity: '2025-01-18', status: 'active', email: 'dragan.p@email.com', phone: '+381644445556', referralCode: 'DRAP25', referralCount: 3, purchaseCount: 98, avgPurchase: 12245 },
  { id: 'lm-3', cardNumber: 'LOY-00003', partnerName: 'Ana Stanković', partnerId: 'p3', tier: 'gold', points: 12500, totalSpent: 850000, lifetimePoints: 18000, joinDate: '2023-01-10', lastActivity: '2025-01-15', status: 'active', email: 'ana.s@email.com', phone: '+381657778899', referralCode: 'ANAS25', referralCount: 2, purchaseCount: 72, avgPurchase: 11806 },
  { id: 'lm-4', cardNumber: 'LOY-00004', partnerName: 'D.o.o. TechVox', partnerId: 'p4', tier: 'gold', points: 9800, totalSpent: 720000, lifetimePoints: 15000, joinDate: '2023-04-05', lastActivity: '2025-01-12', status: 'active', email: 'office@techvox.rs', phone: '+381111223344', referralCode: 'TECV25', referralCount: 0, purchaseCount: 45, avgPurchase: 16000 },
  { id: 'lm-5', cardNumber: 'LOY-00005', partnerName: 'Milan Ilić', partnerId: 'p5', tier: 'silver', points: 5200, totalSpent: 380000, lifetimePoints: 8200, joinDate: '2023-09-15', lastActivity: '2025-01-08', status: 'active', email: 'milan.i@email.com', phone: '+381662233445', referralCode: 'MILI25', referralCount: 1, purchaseCount: 35, avgPurchase: 10857 },
  { id: 'lm-6', cardNumber: 'LOY-00006', partnerName: 'Sara Jovanović', partnerId: 'p6', tier: 'silver', points: 3800, totalSpent: 250000, lifetimePoints: 6000, joinDate: '2024-02-01', lastActivity: '2024-12-20', status: 'active', email: 'sara.j@email.com', phone: '+381613344556', referralCode: 'SARJ25', referralCount: 0, purchaseCount: 22, avgPurchase: 11364 },
  { id: 'lm-7', cardNumber: 'LOY-00007', partnerName: 'Nikola Đorđević', partnerId: 'p7', tier: 'bronze', points: 1500, totalSpent: 120000, lifetimePoints: 2200, joinDate: '2024-07-20', lastActivity: '2024-11-15', status: 'inactive', email: 'nikola.d@email.com', phone: '+381624455667', referralCode: 'NIKD25', referralCount: 0, purchaseCount: 12, avgPurchase: 10000 },
  { id: 'lm-8', cardNumber: 'LOY-00008', partnerName: 'Ivana Kovačević', partnerId: 'p8', tier: 'gold', points: 11000, totalSpent: 780000, lifetimePoints: 16500, joinDate: '2023-03-10', lastActivity: '2025-01-19', status: 'active', email: 'ivana.k@email.com', phone: '+381635566778', referralCode: 'IVAK25', referralCount: 5, purchaseCount: 65, avgPurchase: 12000 },
]

const mockTiers: LoyaltyTier[] = [
  { id: 't1', name: 'Bronza', minPoints: 0, maxPoints: 2999, minSpent: 0, pointsMultiplier: 1, discountPct: 3, benefits: ['1x poeni na kupovinu', '3% popust na rođendan', 'Besplatna dostava preko 5000 RSD', 'Pristup programu'], color: 'amber', icon: '🥉', memberCount: 45 },
  { id: 't2', name: 'Srebro', minPoints: 3000, maxPoints: 9999, minSpent: 200000, pointsMultiplier: 1.5, discountPct: 5, benefits: ['1.5x poeni na kupovinu', '5% popust na rođendan', 'Besplatna dostava', 'Rani pristup akcijama', 'Prioritetna podrška'], color: 'gray', icon: '🥈', memberCount: 32 },
  { id: 't3', name: 'Zlato', minPoints: 10000, maxPoints: 24999, minSpent: 600000, pointsMultiplier: 2, discountPct: 10, benefits: ['2x poeni na kupovinu', '10% popust na sve', 'Besplatna dostava', 'Rani pristup novim proizvodima', 'VIP podrška', 'Besplatno umotavanje'], color: 'yellow', icon: '🥇', memberCount: 18 },
  { id: 't4', name: 'Platina', minPoints: 25000, maxPoints: 49999, minSpent: 1000000, pointsMultiplier: 3, discountPct: 15, benefits: ['3x poeni na kupovinu', '15% popust na sve', 'Besplatna dostava ekspres', 'Poziv na VIP događaje', 'Lični menadžer', 'Besplatni povrat 60 dana'], color: 'cyan', icon: '💎', memberCount: 7 },
  { id: 't5', name: 'Dijamant', minPoints: 50000, maxPoints: 999999, minSpent: 1500000, pointsMultiplier: 5, discountPct: 20, benefits: ['5x poeni na kupovinu', '20% popust na sve', 'Besplatna dostava isti dan', 'Poziv na ekskluzivne događaje', 'Lični kupovni konsultant', 'Besplatni povrat 90 dana', 'Exkluzivni proizvodi', 'Godišnji poklon'], color: 'purple', icon: '💠', memberCount: 3 },
]

const mockRewards: RewardItem[] = [
  { id: 'rw-1', name: '10% popust na sledeću kupovinu', description: 'Jednokratni kupon za 10% popusta na narednu narudžbu.', category: 'Popusti', pointsCost: 1000, pointsValue: 1500, imageUrl: '', stock: 999, claimed: 156, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 5, tierRequired: 'bronze' },
  { id: 'rw-2', name: 'Besplatna dostava - 3 meseca', description: 'Tri meseca besplatne dostave na sve narudžbe.', category: 'Dostava', pointsCost: 2500, pointsValue: 3000, imageUrl: '', stock: 999, claimed: 82, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 2, tierRequired: 'silver' },
  { id: 'rw-3', name: 'VIP karta za godinu dana', description: 'Godinu dana VIP statusa sa svim privilegijama.', category: 'Upgrade', pointsCost: 15000, pointsValue: 20000, imageUrl: '', stock: 50, claimed: 12, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 1, tierRequired: 'gold' },
  { id: 'rw-4', name: 'Poklon set - Premium koža', description: 'Ekskluzivni set premium kožnih proizvoda iz naše kolekcije.', category: 'Pokloni', pointsCost: 8000, pointsValue: 12000, imageUrl: '', stock: 25, claimed: 8, active: true, availableFrom: '2025-01-01', availableTo: '2025-06-30', maxPerMember: 1, tierRequired: 'gold' },
  { id: 'rw-5', name: 'Darovnica 5000 RSD', description: 'Poklon vaučer u vrednosti od 5000 RSD za kupovinu.', category: 'Darovnice', pointsCost: 5000, pointsValue: 6000, imageUrl: '', stock: 100, claimed: 45, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 3, tierRequired: 'silver' },
  { id: 'rw-6', name: 'Poziv na VIP večeru', description: 'Ekskluzivni poziv na godišnju VIP večeru sa degustacijom.', category: 'Iskustva', pointsCost: 20000, pointsValue: 30000, imageUrl: '', stock: 20, claimed: 5, active: true, availableFrom: '2025-06-01', availableTo: '2025-06-30', maxPerMember: 1, tierRequired: 'platinum' },
]

const mockTransactions: PointsTransaction[] = [
  { id: 'tx-1', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'earned', points: 250, balance: 28500, description: 'Kupovina - faktura INV-2025-0234', reference: 'INV-2025-0234', date: '2025-01-20', expiryDate: '2026-01-20', status: 'active' },
  { id: 'tx-2', memberName: 'Dragan Petrović', cardNumber: 'LOY-00002', type: 'earned', points: 360, balance: 18200, description: 'Kupovina - faktura INV-2025-0232', reference: 'INV-2025-0232', date: '2025-01-18', expiryDate: '2026-01-18', status: 'active' },
  { id: 'tx-3', memberName: 'Ana Stanković', cardNumber: 'LOY-00003', type: 'redeemed', points: -2500, balance: 12500, description: 'Iskorišćeno: 10% popust na kupovinu', reference: 'RW-CLM-001', date: '2025-01-15', expiryDate: null, status: 'completed' },
  { id: 'tx-4', memberName: 'Ivana Kovačević', cardNumber: 'LOY-00008', type: 'bonus', points: 500, balance: 11000, description: 'Bonus: rođendanski poeni x2', reference: 'BDAY-2025', date: '2025-01-10', expiryDate: '2026-01-10', status: 'active' },
  { id: 'tx-5', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'referral', points: 1000, balance: 28250, description: 'Preporuka: novi član Nikola R. registrovan', reference: 'REF-JELM25-009', date: '2025-01-08', expiryDate: '2026-01-08', status: 'active' },
  { id: 'tx-6', memberName: 'Milan Ilić', cardNumber: 'LOY-00005', type: 'expired', points: -200, balance: 5200, description: 'Istekli poeni iz januara 2024', reference: 'EXP-BATCH', date: '2025-01-01', expiryDate: null, status: 'expired' },
  { id: 'tx-7', memberName: 'Sara Jovanović', cardNumber: 'LOY-00006', type: 'earned', points: 180, balance: 3800, description: 'Kupovina - faktura INV-2024-0891', reference: 'INV-2024-0891', date: '2024-12-20', expiryDate: '2025-12-20', status: 'active' },
  { id: 'tx-8', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'earned', points: 450, balance: 27250, description: 'Kupovina - faktura INV-2025-0218', reference: 'INV-2025-0218', date: '2025-01-05', expiryDate: '2026-01-05', status: 'active' },
]

const mockCampaigns: PromoCampaign[] = [
  { id: 'cmp-1', name: 'Dvostruki poeni - Januarska rasprodaja', description: 'Zaradite dvostruko više poena na svaku kupovinu tokom januara.', type: 'multiplier', status: 'active', startDate: '2025-01-01', endDate: '2025-01-31', pointsMultiplier: 2, bonusPoints: 0, minPurchase: 0, maxBonus: 0, participatingTiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], redemptions: 234, totalAwarded: 45600, budget: 100000, budgetUsed: 45600 },
  { id: 'cmp-2', name: '500 bonus poena za nove članove', description: 'Novi članovi koji se registruju u februaru dobijaju 500 bonus poena.', type: 'signup_bonus', status: 'scheduled', startDate: '2025-02-01', endDate: '2025-02-28', pointsMultiplier: 1, bonusPoints: 500, minPurchase: 0, maxBonus: 500, participatingTiers: ['bronze'], redemptions: 0, totalAwarded: 0, budget: 50000, budgetUsed: 0 },
  { id: 'cmp-3', name: 'Božićni bonus - Proveli i dobij', description: 'Naknadni bonus poeni za kupovinu preko 10000 RSD u decembru.', type: 'spend_bonus', status: 'expired', startDate: '2024-12-01', endDate: '2024-12-31', pointsMultiplier: 1, bonusPoints: 1000, minPurchase: 10000, maxBonus: 1000, participatingTiers: ['silver', 'gold', 'platinum', 'diamond'], redemptions: 89, totalAwarded: 89000, budget: 150000, budgetUsed: 89000 },
  { id: 'cmp-4', name: 'Preporuči i zaradi', description: 'Dobij 1000 poena za svakog uspešno registrovanog preporučenog prijatelja.', type: 'referral', status: 'active', startDate: '2025-01-01', endDate: '2025-06-30', pointsMultiplier: 1, bonusPoints: 1000, minPurchase: 0, maxBonus: 5000, participatingTiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], redemptions: 15, totalAwarded: 15000, budget: 100000, budgetUsed: 15000 },
]

const mockStats: LoyaltyStats = {
  totalMembers: 105, activeMembers: 82, newThisMonth: 8,
  totalPointsIssued: 245000, totalPointsRedeemed: 87000, totalRevenue: 5420000,
  avgOrderValue: 12500, retentionRate: 78, topTierMembers: 3,
  tierDistribution: [
    { tier: 'bronze', count: 45, color: 'bg-amber-500' },
    { tier: 'silver', count: 32, color: 'bg-gray-400' },
    { tier: 'gold', count: 18, color: 'bg-yellow-400' },
    { tier: 'platinum', count: 7, color: 'bg-cyan-400' },
    { tier: 'diamond', count: 3, color: 'bg-purple-500' },
  ],
  monthlyActivity: [
    { month: 'Avg', earned: 32000, redeemed: 12000, newMembers: 5 },
    { month: 'Sep', earned: 28000, redeemed: 14000, newMembers: 4 },
    { month: 'Okt', earned: 35000, redeemed: 11000, newMembers: 7 },
    { month: 'Nov', earned: 40000, redeemed: 16000, newMembers: 6 },
    { month: 'Dec', earned: 55000, redeemed: 22000, newMembers: 9 },
    { month: 'Jan', earned: 25000, redeemed: 8000, newMembers: 8 },
  ],
  topSpenders: [
    { name: 'Jelena Marković', spent: 1850000, points: 28500, tier: 'diamond' },
    { name: 'Dragan Petrović', spent: 1200000, points: 18200, tier: 'platinum' },
    { name: 'Ana Stanković', spent: 850000, points: 12500, tier: 'gold' },
    { name: 'D.o.o. TechVox', spent: 720000, points: 9800, tier: 'gold' },
    { name: 'Ivana Kovačević', spent: 780000, points: 11000, tier: 'gold' },
  ],
  popularRewards: [
    { name: '10% popust na sledeću kupovinu', claimed: 156, cost: 1000 },
    { name: 'Darovnica 5000 RSD', claimed: 45, cost: 5000 },
    { name: 'Besplatna dostava - 3 meseca', claimed: 82, cost: 2500 },
    { name: 'Poklon set - Premium koža', claimed: 8, cost: 8000 },
  ],
}

// ============ COMPONENT ============

export function Loyalty() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<LoyaltyStats | null>(null)
  const [members, setMembers] = useState<LoyaltyMember[]>([])
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [txTypeFilter, setTxTypeFilter] = useState('all')

  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'member' | 'reward' | 'campaign'>('member')
  const [selectedItem, setSelectedItem] = useState<LoyaltyMember | RewardItem | PromoCampaign | null>(null)

  const emptyMemberForm = { partnerName: '', email: '', phone: '', tier: 'bronze', initialPoints: '' }
  const emptyRewardForm = { name: '', description: '', category: 'Popusti', pointsCost: '', pointsValue: '', stock: '999', maxPerMember: '5', tierRequired: 'bronze' }
  const emptyCampaignForm = { name: '', description: '', type: 'multiplier', startDate: '', endDate: '', pointsMultiplier: '2', bonusPoints: '0', minPurchase: '0', maxBonus: '0', budget: '50000' }

  const [memberForm, setMemberForm] = useState(emptyMemberForm)
  const [rewardForm, setRewardForm] = useState(emptyRewardForm)
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/loyalty?companyId=${activeCompanyId}`)
      if (res.ok) {
        const d = await res.json()
        setMembers(d.members?.length ? d.members : mockMembers)
        setTiers(d.tiers?.length ? d.tiers : mockTiers)
        setRewards(d.rewards?.length ? d.rewards : mockRewards)
        setTransactions(d.transactions?.length ? d.transactions : mockTransactions)
        setCampaigns(d.campaigns?.length ? d.campaigns : mockCampaigns)
        setStats(d.stats || mockStats)
      } else {
        setMembers(mockMembers); setTiers(mockTiers); setRewards(mockRewards); setTransactions(mockTransactions); setCampaigns(mockCampaigns); setStats(mockStats)
      }
    } catch { setMembers(mockMembers); setTiers(mockTiers); setRewards(mockRewards); setTransactions(mockTransactions); setCampaigns(mockCampaigns); setStats(mockStats) }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      let body: Record<string, unknown> = { companyId: activeCompanyId }
      if (createType === 'member') { if (!memberForm.partnerName.trim()) return; body = { ...body, ...memberForm, initialPoints: parseInt(memberForm.initialPoints) || 0 } }
      else if (createType === 'reward') { if (!rewardForm.name.trim()) return; body = { ...body, ...rewardForm, pointsCost: parseInt(rewardForm.pointsCost) || 0, pointsValue: parseInt(rewardForm.pointsValue) || 0 } }
      else { if (!campaignForm.name.trim()) return; body = { ...body, ...campaignForm, pointsMultiplier: parseFloat(campaignForm.pointsMultiplier) || 1 } }
      const res = await fetch('/api/loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setCreateOpen(false); loadData(); toast.success('Kreirano') }
    } catch { /* silent */ }
  }

  const openCreate = (type: 'member' | 'reward' | 'campaign') => {
    setCreateType(type)
    if (type === 'member') setMemberForm(emptyMemberForm)
    else if (type === 'reward') setRewardForm(emptyRewardForm)
    else setCampaignForm(emptyCampaignForm)
    setCreateOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Program Lojalnosti</h1>
          <p className="text-sm text-muted-foreground">Upravljanje programom lojalnosti, poenima, nagradama i kampanjama</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
          <Button size="sm" onClick={() => openCreate('member')}><Plus className="h-4 w-4 mr-1" /> Novi član</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" /> Članovi</TabsTrigger>
          <TabsTrigger value="tiers"><Crown className="h-4 w-4 mr-1" /> Nivoi</TabsTrigger>
          <TabsTrigger value="rewards"><Gift className="h-4 w-4 mr-1" /> Nagrade</TabsTrigger>
          <TabsTrigger value="transactions"><Zap className="h-4 w-4 mr-1" /> Transakcije</TabsTrigger>
          <TabsTrigger value="campaigns"><Sparkles className="h-4 w-4 mr-1" /> Kampanje</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (<div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Članovi</span><Users className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold">{stats.activeMembers}<span className="text-sm text-muted-foreground">/{stats.totalMembers}</span></p><p className="text-[10px] text-muted-foreground">+{stats.newThisMonth} ovog meseca</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Poeni u opticaju</span><Star className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-bold">{(stats.totalPointsIssued - stats.totalPointsRedeemed).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Iskorišćeno: {stats.totalPointsRedeemed.toLocaleString()}</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prihodi od članova</span><TrendingUp className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p><p className="text-[10px] text-muted-foreground">Prosek {formatCurrency(stats.avgOrderValue)}/kupovina</p></Card>
                <Card className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Zadržavanje</span><Heart className="h-4 w-4 text-red-500" /></div><p className="text-2xl font-bold">{stats.retentionRate}%</p><p className="text-[10px] text-muted-foreground">{stats.topTierMembers} Dijamant članova</p></Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Distribucija po nivoima</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.tierDistribution.map((td) => {
                      const tc = TIER_CONFIG[td.tier]
                      return (
                        <div key={td.tier} className="flex items-center gap-3">
                          <span className="text-sm w-6">{tc?.icon}</span>
                          <span className="text-xs w-20">{tc?.label}</span>
                          <div className="flex-1 bg-muted rounded-full h-3"><div className={`h-3 rounded-full ${td.color}`} style={{ width: `${(td.count / stats.totalMembers) * 100}%` }} /></div>
                          <span className="text-xs font-medium w-6 text-right">{td.count}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečna aktivnost</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {stats.monthlyActivity.map((m) => (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="text-xs w-10">{m.month}</span>
                        <div className="flex-1"><div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center gap-1"><div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded-full h-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${(m.earned / 55000) * 100}%` }} /></div><span className="text-[9px] text-green-600 w-8">+{(m.earned / 1000).toFixed(0)}k</span></div>
                          <div className="flex items-center gap-1"><div className="flex-1 bg-red-100 dark:bg-red-900/20 rounded-full h-2"><div className="h-2 rounded-full bg-red-400" style={{ width: `${(m.redeemed / 25000) * 100}%` }} /></div><span className="text-[9px] text-red-500 w-8">-{(m.redeemed / 1000).toFixed(0)}k</span></div>
                        </div></div>
                        <Badge variant="outline" className="text-[9px]">+{m.newMembers}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Top kupci</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {stats.topSpenders.map((s, i) => {
                      const tc = TIER_CONFIG[s.tier]
                      return (
                        <div key={s.name} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                          <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                          <div className="flex-1 min-w-0"><p className="text-sm truncate">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.points.toLocaleString()} poena</p></div>
                          <Badge variant="outline" className={`text-[9px] ${tc?.bgColor}`}>{tc?.icon} {tc?.label}</Badge>
                          <span className="text-xs font-medium">{formatCurrency(s.spent)}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Popularne nagrade</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {stats.popularRewards.map((r, i) => (
                      <div key={r.name} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                        <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                        <div className="flex-1 min-w-0"><p className="text-sm truncate">{r.name}</p></div>
                        <span className="text-[10px] text-muted-foreground">{r.claimed}x</span>
                        <Badge variant="outline" className="text-[9px]"><Star className="h-3 w-3 mr-1" />{r.cost.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== ČLANOVI ===== */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži članove..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={tierFilter} onValueChange={setTierFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi nivoi</SelectItem>{Object.entries(TIER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent></Select>
            <Button size="sm" onClick={() => openCreate('reward')}><Gift className="h-4 w-4 mr-1" /> Nova nagrada</Button>
          </div>
          <div className="space-y-3">
            {members.filter((m) => {
              if (tierFilter !== 'all' && m.tier !== tierFilter) return false
              if (search) { const s = search.toLowerCase(); return m.partnerName.toLowerCase().includes(s) || m.cardNumber.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) }
              return true
            }).map((m) => {
              const tc = TIER_CONFIG[m.tier]
              return (
                <Card key={m.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedItem(m); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{m.cardNumber}</span>
                          <Badge variant="outline" className={`text-[10px] ${tc?.bgColor} ${tc?.color}`}>{tc?.icon} {tc?.label}</Badge>
                          {m.status === 'inactive' && <Badge variant="secondary" className="text-[10px]">Neaktivan</Badge>}
                        </div>
                        <h3 className="text-sm font-medium">{m.partnerName}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span><Star className="h-3 w-3 inline mr-1 text-amber-500" />{m.points.toLocaleString()} poena</span>
                          <span><ShoppingBag className="h-3 w-3 inline mr-1" />{m.purchaseCount} kupovina</span>
                          <span><CircleDollarSign className="h-3 w-3 inline mr-1" />{formatCurrency(m.totalSpent)}</span>
                          {m.referralCount > 0 && <span><Users className="h-3 w-3 inline mr-1" />{m.referralCount} preporuka</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== NIVOI ===== */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="space-y-4">
            {tiers.map((tier) => {
              const tc = TIER_CONFIG[tier.name.toLowerCase()] || TIER_CONFIG.bronze
              const nextTier = tiers.find((t) => t.minPoints === tier.maxPoints + 1)
              return (
                <Card key={tier.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{tc.icon}</span>
                          <div>
                            <h3 className="text-lg font-bold">{tier.name}</h3>
                            <p className="text-xs text-muted-foreground">{tier.memberCount} članova · {tier.pointsMultiplier}x multiplikator · {tier.discountPct}% popust</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Min. poeni</p><p className="text-sm font-medium">{tier.minPoints.toLocaleString()}</p></div>
                          <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Min. potrošnja</p><p className="text-sm font-medium">{formatCurrency(tier.minSpent)}</p></div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-2">Beneficije:</p>
                          <div className="flex flex-wrap gap-1">
                            {tier.benefits.map((b, i) => <Badge key={i} variant="outline" className="text-[10px]">{b}</Badge>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== NAGRADE ===== */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openCreate('reward')}><Plus className="h-4 w-4 mr-1" /> Nova nagrada</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((r) => {
              const requiredTier = TIER_CONFIG[r.tierRequired]
              return (
                <Card key={r.id} className={`hover:shadow-md transition-shadow ${!r.active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Gift className="h-5 w-5 text-primary" /></div>
                      {r.active ? <Badge variant="default" className="text-[9px] bg-green-500">Aktivna</Badge> : <Badge variant="secondary" className="text-[9px]">Neaktivna</Badge>}
                    </div>
                    <h3 className="text-sm font-medium mb-1">{r.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /><span className="text-sm font-bold">{r.pointsCost.toLocaleString()}</span><span className="text-[10px] text-muted-foreground">poena</span></div>
                      <Badge variant="outline" className={`text-[9px] ${requiredTier?.bgColor}`}>{requiredTier?.icon} {requiredTier?.label}+</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>Iskorišćeno: {r.claimed}</span>
                      <span>Max: {r.maxPerMember}/član</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== TRANSAKCIJE ===== */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži transakcije..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={txTypeFilter} onValueChange={setTxTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Svi tipovi</SelectItem>{Object.entries(TX_TYPE).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            {transactions.filter((tx) => {
              if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false
              if (search) { const s = search.toLowerCase(); return tx.memberName.toLowerCase().includes(s) || tx.cardNumber.toLowerCase().includes(s) || tx.description.toLowerCase().includes(s) }
              return true
            }).map((tx) => {
              const tt = TX_TYPE[tx.type]
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.points > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {tx.points > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium truncate">{tx.memberName}</span><Badge variant="outline" className={`text-[9px] ${tt?.color}`}>{tt?.label}</Badge></div>
                    <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== KAMPANJE ===== */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openCreate('campaign')}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
          </div>
          <div className="space-y-3">
            {campaigns.map((c) => {
              const sc = PROMO_STATUS[c.status]
              const budgetPct = c.budget > 0 ? (c.budgetUsed / c.budget) * 100 : 0
              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedItem(c); setDetailOpen(true) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium">{c.name}</span>
                          <Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{c.type === 'multiplier' ? 'Multiplikator' : c.type === 'signup_bonus' ? 'Bonus prijave' : c.type === 'spend_bonus' ? 'Bonus potrošnje' : 'Preporuka'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />{formatDate(c.startDate)} — {formatDate(c.endDate)}</span>
                          {c.pointsMultiplier > 1 && <span>{c.pointsMultiplier}x poeni</span>}
                          {c.bonusPoints > 0 && <span>+{c.bonusPoints} bonus</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Iskorišćeno: {c.redemptions}x</span>
                          <span>Ukupno: {c.totalAwarded.toLocaleString()} poena</span>
                          {c.budget > 0 && <><span>Budžet:</span><Progress value={budgetPct} className="w-20 h-2" /><span>{budgetPct.toFixed(0)}%</span></>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <ScrollArea className="max-h-[75vh] pr-4">
            {selectedItem && 'cardNumber' in selectedItem && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{(selectedItem as LoyaltyMember).partnerName}</DialogTitle>
                  <DialogDescription>{(selectedItem as LoyaltyMember).cardNumber} · {(selectedItem as LoyaltyMember).email}</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                  <Badge variant="outline" className={TIER_CONFIG[(selectedItem as LoyaltyMember).tier]?.bgColor}>{TIER_CONFIG[(selectedItem as LoyaltyMember).tier]?.icon} {TIER_CONFIG[(selectedItem as LoyaltyMember).tier]?.label}</Badge>
                  <Badge variant={selectedItem.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{selectedItem.status === 'active' ? 'Aktivan' : 'Neaktivan'}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Trenutni poeni</p><p className="text-lg font-bold text-amber-600">{(selectedItem as LoyaltyMember).points.toLocaleString()}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Ukupno potrošeno</p><p className="text-lg font-bold">{formatCurrency((selectedItem as LoyaltyMember).totalSpent)}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Kupovina</p><p className="text-sm font-medium">{(selectedItem as LoyaltyMember).purchaseCount} · prosek {formatCurrency((selectedItem as LoyaltyMember).avgPurchase)}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Preporuke</p><p className="text-sm font-medium">{(selectedItem as LoyaltyMember).referralCount} · kod: {(selectedItem as LoyaltyMember).referralCode}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Datum prijave</p><p className="text-sm">{formatDate((selectedItem as LoyaltyMember).joinDate)}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Poslednja aktivnost</p><p className="text-sm">{formatDate((selectedItem as LoyaltyMember).lastActivity)}</p></div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Životni poeni</p><p className="text-sm font-medium">{(selectedItem as LoyaltyMember).lifetimePoints.toLocaleString()} (ukupno zarađeno)</p></div>
              </div>
            )}
            {selectedItem && 'budget' in selectedItem && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{(selectedItem as PromoCampaign).name}</DialogTitle>
                  <DialogDescription>{(selectedItem as PromoCampaign).description}</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                  <Badge variant="outline" className={PROMO_STATUS[(selectedItem as PromoCampaign).status]?.color}>{PROMO_STATUS[(selectedItem as PromoCampaign).status]?.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Period</p><p className="text-sm">{formatDate((selectedItem as PromoCampaign).startDate)} — {formatDate((selectedItem as PromoCampaign).endDate)}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Iskorišćeno</p><p className="text-sm font-medium">{(selectedItem as PromoCampaign).redemptions} puta</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Dodeljeno poena</p><p className="text-sm font-bold text-green-600">{(selectedItem as PromoCampaign).totalAwarded.toLocaleString()}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Budžet</p><p className="text-sm">{formatCurrency((selectedItem as PromoCampaign).budgetUsed)} / {formatCurrency((selectedItem as PromoCampaign).budget)}</p><Progress value={((selectedItem as PromoCampaign).budgetUsed / (selectedItem as PromoCampaign).budget) * 100} className="mt-1 h-2" /></div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{createType === 'member' ? 'Novi član programa' : createType === 'reward' ? 'Nova nagrada' : 'Nova kampanja'}</DialogTitle>
            <DialogDescription>Popunite podatke</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {createType === 'member' && (
              <>
                <div className="space-y-2"><Label>Ime / Firma *</Label><Input value={memberForm.partnerName} onChange={(e) => setMemberForm({ ...memberForm, partnerName: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Telefon</Label><Input value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Nivo</Label><Select value={memberForm.tier} onValueChange={(v) => setMemberForm({ ...memberForm, tier: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TIER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Početni poeni</Label><Input type="number" value={memberForm.initialPoints} onChange={(e) => setMemberForm({ ...memberForm, initialPoints: e.target.value })} /></div>
                </div>
              </>
            )}
            {createType === 'reward' && (
              <>
                <div className="space-y-2"><Label>Naziv *</Label><Input value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea rows={2} value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Kategorija</Label><Select value={rewardForm.category} onValueChange={(v) => setRewardForm({ ...rewardForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REWARD_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Min. nivo</Label><Select value={rewardForm.tierRequired} onValueChange={(v) => setRewardForm({ ...rewardForm, tierRequired: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TIER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Cena (poeni)</Label><Input type="number" value={rewardForm.pointsCost} onChange={(e) => setRewardForm({ ...rewardForm, pointsCost: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Vrednost (poeni)</Label><Input type="number" value={rewardForm.pointsValue} onChange={(e) => setRewardForm({ ...rewardForm, pointsValue: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Max/član</Label><Input type="number" value={rewardForm.maxPerMember} onChange={(e) => setRewardForm({ ...rewardForm, maxPerMember: e.target.value })} /></div>
                </div>
              </>
            )}
            {createType === 'campaign' && (
              <>
                <div className="space-y-2"><Label>Naziv *</Label><Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea rows={2} value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Tip</Label><Select value={campaignForm.type} onValueChange={(v) => setCampaignForm({ ...campaignForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiplier">Multiplikator</SelectItem><SelectItem value="signup_bonus">Bonus prijave</SelectItem><SelectItem value="spend_bonus">Bonus potrošnje</SelectItem><SelectItem value="referral">Preporuka</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Budžet (RSD)</Label><Input type="number" value={campaignForm.budget} onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Početak</Label><Input type="date" value={campaignForm.startDate} onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Kraj</Label><Input type="date" value={campaignForm.endDate} onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Multiplikator</Label><Input type="number" step="0.5" value={campaignForm.pointsMultiplier} onChange={(e) => setCampaignForm({ ...campaignForm, pointsMultiplier: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Bonus poeni</Label><Input type="number" value={campaignForm.bonusPoints} onChange={(e) => setCampaignForm({ ...campaignForm, bonusPoints: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Min. kupovina</Label><Input type="number" value={campaignForm.minPurchase} onChange={(e) => setCampaignForm({ ...campaignForm, minPurchase: e.target.value })} /></div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
