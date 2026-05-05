export const TIER_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  bronze: { label: 'Bronza', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: '🥉' },
  silver: { label: 'Srebro', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30', icon: '🥈' },
  gold: { label: 'Zlato', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', icon: '🥇' },
  platinum: { label: 'Platina', color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', icon: '💎' },
  diamond: { label: 'Dijamant', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: '💠' },
}

export const TX_TYPE: Record<string, { label: string; color: string }> = {
  earned: { label: 'Zarađeni', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  redeemed: { label: 'Iskorišćeni', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  expired: { label: 'Istekli', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  adjusted: { label: 'Korekcija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bonus: { label: 'Bonus', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  referral: { label: 'Preporuka', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

export const PROMO_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivna', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  scheduled: { label: 'Zakazana', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  expired: { label: 'Istekla', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  paused: { label: 'Pauzirana', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export const REWARD_CATEGORIES = ['Proizvodi', 'Popusti', 'Iskustva', 'Pokloni', 'Darovnice', 'Upgrade', 'VIP', 'Dostava']

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const mockMembers: LoyaltyMember[] = [
  { id: 'lm-1', cardNumber: 'LOY-00001', partnerName: 'Jelena Marković', partnerId: 'p1', tier: 'diamond', points: 28500, totalSpent: 1850000, lifetimePoints: 42000, joinDate: '2022-03-15', lastActivity: '2025-01-20', status: 'active', email: 'jelena.m@email.com', phone: '+381631112233', referralCode: 'JELM25', referralCount: 8, purchaseCount: 156, avgPurchase: 11859 },
  { id: 'lm-2', cardNumber: 'LOY-00002', partnerName: 'Dragan Petrović', partnerId: 'p2', tier: 'platinum', points: 18200, totalSpent: 1200000, lifetimePoints: 28500, joinDate: '2022-06-20', lastActivity: '2025-01-18', status: 'active', email: 'dragan.p@email.com', phone: '+381644445556', referralCode: 'DRAP25', referralCount: 3, purchaseCount: 98, avgPurchase: 12245 },
  { id: 'lm-3', cardNumber: 'LOY-00003', partnerName: 'Ana Stanković', partnerId: 'p3', tier: 'gold', points: 12500, totalSpent: 850000, lifetimePoints: 18000, joinDate: '2023-01-10', lastActivity: '2025-01-15', status: 'active', email: 'ana.s@email.com', phone: '+381657778899', referralCode: 'ANAS25', referralCount: 2, purchaseCount: 72, avgPurchase: 11806 },
  { id: 'lm-4', cardNumber: 'LOY-00004', partnerName: 'D.o.o. TechVox', partnerId: 'p4', tier: 'gold', points: 9800, totalSpent: 720000, lifetimePoints: 15000, joinDate: '2023-04-05', lastActivity: '2025-01-12', status: 'active', email: 'office@techvox.rs', phone: '+381111223344', referralCode: 'TECV25', referralCount: 0, purchaseCount: 45, avgPurchase: 16000 },
  { id: 'lm-5', cardNumber: 'LOY-00005', partnerName: 'Milan Ilić', partnerId: 'p5', tier: 'silver', points: 5200, totalSpent: 380000, lifetimePoints: 8200, joinDate: '2023-09-15', lastActivity: '2025-01-08', status: 'active', email: 'milan.i@email.com', phone: '+381662233445', referralCode: 'MILI25', referralCount: 1, purchaseCount: 35, avgPurchase: 10857 },
  { id: 'lm-6', cardNumber: 'LOY-00006', partnerName: 'Sara Jovanović', partnerId: 'p6', tier: 'silver', points: 3800, totalSpent: 250000, lifetimePoints: 6000, joinDate: '2024-02-01', lastActivity: '2024-12-20', status: 'active', email: 'sara.j@email.com', phone: '+381613344556', referralCode: 'SARJ25', referralCount: 0, purchaseCount: 22, avgPurchase: 11364 },
  { id: 'lm-7', cardNumber: 'LOY-00007', partnerName: 'Nikola Đorđević', partnerId: 'p7', tier: 'bronze', points: 1500, totalSpent: 120000, lifetimePoints: 2200, joinDate: '2024-07-20', lastActivity: '2024-11-15', status: 'inactive', email: 'nikola.d@email.com', phone: '+381624455667', referralCode: 'NIKD25', referralCount: 0, purchaseCount: 12, avgPurchase: 10000 },
  { id: 'lm-8', cardNumber: 'LOY-00008', partnerName: 'Ivana Kovačević', partnerId: 'p8', tier: 'gold', points: 11000, totalSpent: 780000, lifetimePoints: 16500, joinDate: '2023-03-10', lastActivity: '2025-01-19', status: 'active', email: 'ivana.k@email.com', phone: '+381635566778', referralCode: 'IVAK25', referralCount: 5, purchaseCount: 65, avgPurchase: 12000 },
]

export const mockTiers: LoyaltyTier[] = [
  { id: 't1', name: 'Bronza', minPoints: 0, maxPoints: 2999, minSpent: 0, pointsMultiplier: 1, discountPct: 3, benefits: ['1x poeni na kupovinu', '3% popust na rođendan', 'Besplatna dostava preko 5000 RSD', 'Pristup programu'], color: 'amber', icon: '🥉', memberCount: 45 },
  { id: 't2', name: 'Srebro', minPoints: 3000, maxPoints: 9999, minSpent: 200000, pointsMultiplier: 1.5, discountPct: 5, benefits: ['1.5x poeni na kupovinu', '5% popust na rođendan', 'Besplatna dostava', 'Rani pristup akcijama', 'Prioritetna podrška'], color: 'gray', icon: '🥈', memberCount: 32 },
  { id: 't3', name: 'Zlato', minPoints: 10000, maxPoints: 24999, minSpent: 600000, pointsMultiplier: 2, discountPct: 10, benefits: ['2x poeni na kupovinu', '10% popust na sve', 'Besplatna dostava', 'Rani pristup novim proizvodima', 'VIP podrška', 'Besplatno umotavanje'], color: 'yellow', icon: '🥇', memberCount: 18 },
  { id: 't4', name: 'Platina', minPoints: 25000, maxPoints: 49999, minSpent: 1000000, pointsMultiplier: 3, discountPct: 15, benefits: ['3x poeni na kupovinu', '15% popust na sve', 'Besplatna dostava ekspres', 'Poziv na VIP događaje', 'Lični menadžer', 'Besplatni povrat 60 dana'], color: 'cyan', icon: '💎', memberCount: 7 },
  { id: 't5', name: 'Dijamant', minPoints: 50000, maxPoints: 999999, minSpent: 1500000, pointsMultiplier: 5, discountPct: 20, benefits: ['5x poeni na kupovinu', '20% popust na sve', 'Besplatna dostava isti dan', 'Poziv na ekskluzivne događaje', 'Lični kupovni konsultant', 'Besplatni povrat 90 dana', 'Exkluzivni proizvodi', 'Godišnji poklon'], color: 'purple', icon: '💠', memberCount: 3 },
]

export const mockRewards: RewardItem[] = [
  { id: 'rw-1', name: '10% popust na sledeću kupovinu', description: 'Jednokratni kupon za 10% popusta na narednu narudžbu.', category: 'Popusti', pointsCost: 1000, pointsValue: 1500, imageUrl: '', stock: 999, claimed: 156, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 5, tierRequired: 'bronze' },
  { id: 'rw-2', name: 'Besplatna dostava - 3 meseca', description: 'Tri meseca besplatne dostave na sve narudžbe.', category: 'Dostava', pointsCost: 2500, pointsValue: 3000, imageUrl: '', stock: 999, claimed: 82, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 2, tierRequired: 'silver' },
  { id: 'rw-3', name: 'VIP karta za godinu dana', description: 'Godinu dana VIP statusa sa svim privilegijama.', category: 'Upgrade', pointsCost: 15000, pointsValue: 20000, imageUrl: '', stock: 50, claimed: 12, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 1, tierRequired: 'gold' },
  { id: 'rw-4', name: 'Poklon set - Premium koža', description: 'Ekskluzivni set premium kožnih proizvoda iz naše kolekcije.', category: 'Pokloni', pointsCost: 8000, pointsValue: 12000, imageUrl: '', stock: 25, claimed: 8, active: true, availableFrom: '2025-01-01', availableTo: '2025-06-30', maxPerMember: 1, tierRequired: 'gold' },
  { id: 'rw-5', name: 'Darovnica 5000 RSD', description: 'Poklon vaučer u vrednosti od 5000 RSD za kupovinu.', category: 'Darovnice', pointsCost: 5000, pointsValue: 6000, imageUrl: '', stock: 100, claimed: 45, active: true, availableFrom: '2025-01-01', availableTo: '2025-12-31', maxPerMember: 3, tierRequired: 'silver' },
  { id: 'rw-6', name: 'Poziv na VIP večeru', description: 'Ekskluzivni poziv na godišnju VIP večeru sa degustacijom.', category: 'Iskustva', pointsCost: 20000, pointsValue: 30000, imageUrl: '', stock: 20, claimed: 5, active: true, availableFrom: '2025-06-01', availableTo: '2025-06-30', maxPerMember: 1, tierRequired: 'platinum' },
]

export const mockTransactions: PointsTransaction[] = [
  { id: 'tx-1', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'earned', points: 250, balance: 28500, description: 'Kupovina - faktura INV-2025-0234', reference: 'INV-2025-0234', date: '2025-01-20', expiryDate: '2026-01-20', status: 'active' },
  { id: 'tx-2', memberName: 'Dragan Petrović', cardNumber: 'LOY-00002', type: 'earned', points: 360, balance: 18200, description: 'Kupovina - faktura INV-2025-0232', reference: 'INV-2025-0232', date: '2025-01-18', expiryDate: '2026-01-18', status: 'active' },
  { id: 'tx-3', memberName: 'Ana Stanković', cardNumber: 'LOY-00003', type: 'redeemed', points: -2500, balance: 12500, description: 'Iskorišćeno: 10% popust na kupovinu', reference: 'RW-CLM-001', date: '2025-01-15', expiryDate: null, status: 'completed' },
  { id: 'tx-4', memberName: 'Ivana Kovačević', cardNumber: 'LOY-00008', type: 'bonus', points: 500, balance: 11000, description: 'Bonus: rođendanski poeni x2', reference: 'BDAY-2025', date: '2025-01-10', expiryDate: '2026-01-10', status: 'active' },
  { id: 'tx-5', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'referral', points: 1000, balance: 28250, description: 'Preporuka: novi član Nikola R. registrovan', reference: 'REF-JELM25-009', date: '2025-01-08', expiryDate: '2026-01-08', status: 'active' },
  { id: 'tx-6', memberName: 'Milan Ilić', cardNumber: 'LOY-00005', type: 'expired', points: -200, balance: 5200, description: 'Istekli poeni iz januara 2024', reference: 'EXP-BATCH', date: '2025-01-01', expiryDate: null, status: 'expired' },
  { id: 'tx-7', memberName: 'Sara Jovanović', cardNumber: 'LOY-00006', type: 'earned', points: 180, balance: 3800, description: 'Kupovina - faktura INV-2024-0891', reference: 'INV-2024-0891', date: '2024-12-20', expiryDate: '2025-12-20', status: 'active' },
  { id: 'tx-8', memberName: 'Jelena Marković', cardNumber: 'LOY-00001', type: 'earned', points: 450, balance: 27250, description: 'Kupovina - faktura INV-2025-0218', reference: 'INV-2025-0218', date: '2025-01-05', expiryDate: '2026-01-05', status: 'active' },
]

export const mockCampaigns: PromoCampaign[] = [
  { id: 'cmp-1', name: 'Dvostruki poeni - Januarska rasprodaja', description: 'Zaradite dvostruko više poena na svaku kupovinu tokom januara.', type: 'multiplier', status: 'active', startDate: '2025-01-01', endDate: '2025-01-31', pointsMultiplier: 2, bonusPoints: 0, minPurchase: 0, maxBonus: 0, participatingTiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], redemptions: 234, totalAwarded: 45600, budget: 100000, budgetUsed: 45600 },
  { id: 'cmp-2', name: '500 bonus poena za nove članove', description: 'Novi članovi koji se registruju u februaru dobijaju 500 bonus poena.', type: 'signup_bonus', status: 'scheduled', startDate: '2025-02-01', endDate: '2025-02-28', pointsMultiplier: 1, bonusPoints: 500, minPurchase: 0, maxBonus: 500, participatingTiers: ['bronze'], redemptions: 0, totalAwarded: 0, budget: 50000, budgetUsed: 0 },
  { id: 'cmp-3', name: 'Božićni bonus - Proveli i dobij', description: 'Naknadni bonus poeni za kupovinu preko 10000 RSD u decembru.', type: 'spend_bonus', status: 'expired', startDate: '2024-12-01', endDate: '2024-12-31', pointsMultiplier: 1, bonusPoints: 1000, minPurchase: 10000, maxBonus: 1000, participatingTiers: ['silver', 'gold', 'platinum', 'diamond'], redemptions: 89, totalAwarded: 89000, budget: 150000, budgetUsed: 89000 },
  { id: 'cmp-4', name: 'Preporuči i zaradi', description: 'Dobij 1000 poena za svakog uspešno registrovanog preporučenog prijatelja.', type: 'referral', status: 'active', startDate: '2025-01-01', endDate: '2025-06-30', pointsMultiplier: 1, bonusPoints: 1000, minPurchase: 0, maxBonus: 5000, participatingTiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], redemptions: 15, totalAwarded: 15000, budget: 100000, budgetUsed: 15000 },
]

export const mockStats: LoyaltyStats = {
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

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyMemberForm = { partnerName: '', email: '', phone: '', tier: 'bronze', initialPoints: '' }

export const emptyRewardForm = { name: '', description: '', category: 'Popusti', pointsCost: '', pointsValue: '', stock: '999', maxPerMember: '5', tierRequired: 'bronze' }

export const emptyCampaignForm = { name: '', description: '', type: 'multiplier', startDate: '', endDate: '', pointsMultiplier: '2', bonusPoints: '0', minPurchase: '0', maxBonus: '0', budget: '50000' }

export const res = await fetch(`/api/loyalty?companyId=${activeCompanyId}`);

export const d = await res.json();

export const handleCreate = async () => {
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

export const openCreate = (type: 'member' | 'reward' | 'campaign') => {
    setCreateType(type)
    if (type === 'member') setMemberForm(emptyMemberForm)
    else if (type === 'reward') setRewardForm(emptyRewardForm)
    else setCampaignForm(emptyCampaignForm)
    setCreateOpen(true)
  }

export const tc = TIER_CONFIG[td.tier]

export const tc = TIER_CONFIG[s.tier]

export const tc = TIER_CONFIG[m.tier]

export const tc = TIER_CONFIG[tier.name.toLowerCase()] || TIER_CONFIG.bronze;

export const nextTier = tiers.find((t) => t.minPoints === tier.maxPoints + 1);

export const requiredTier = TIER_CONFIG[r.tierRequired]

export const tt = TX_TYPE[tx.type]

export const sc = PROMO_STATUS[c.status]

export const budgetPct = c.budget > 0 ? (c.budgetUsed / c.budget) * 100 : 0;
