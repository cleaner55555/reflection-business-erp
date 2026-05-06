'use client'

import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
import { useGamification } from './hooks'

export function Gamifikacija() {
  const {activeTab, badgeDialogOpen, badges, catCfg, categoryFilter, chSCfg, chTCfg, challengeDialogOpen, challenges, dCfg, detailOpen, filteredGoals, goalDialogOpen, handleCreateBadge, handleCreateChallenge, handleCreateGoal, k, leaderboard, loading, mockTemplates, sCfg, search, selected, setActiveTab, setBadgeDialogOpen, setCategoryFilter, setChallengeDialogOpen, setDetailOpen, setGoalDialogOpen, setStatusFilter, statusFilter} = useGamification()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gamifikacija</h1>
          <p className="text-sm text-muted-foreground">Ciljevi, izazovi, značke i rang lista</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadGoals(); loadDashboard(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setGoalForm(emptyGoalForm); setGoalDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi cilj
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="goals"><Target className="h-4 w-4 mr-1" /> Ciljevi</TabsTrigger>
          <TabsTrigger value="challenges"><Swords className="h-4 w-4 mr-1" /> Izazovi</TabsTrigger>
          <TabsTrigger value="badges"><Award className="h-4 w-4 mr-1" /> Značke</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-1" /> Rang lista</TabsTrigger>
          <TabsTrigger value="templates"><Settings className="h-4 w-4 mr-1" /> Šabloni</TabsTrigger>
        </TabsList>

        {/* ─── Pregled Tab ─────────────────────────────────────────────── */}
        <OverviewTab catCfg={catCfg} />

        {/* ─── Ciljevi Tab ─────────────────────────────────────────────── */}
        <GoalsTab catCfg={catCfg} categoryFilter={categoryFilter} filteredGoals={filteredGoals} k={k} loading={loading} sCfg={sCfg} search={search} setCategoryFilter={setCategoryFilter} setStatusFilter={setStatusFilter} statusFilter={statusFilter} />

        {/* ─── Izazovi Tab ─────────────────────────────────────────────── */}
        <ChallengesTab chSCfg={chSCfg} chTCfg={chTCfg} challenges={challenges} dCfg={dCfg} />

        {/* ─── Značke Tab ─────────────────────────────────────────────── */}
        <BadgesTab badges={badges} />

        {/* ─── Rang Lista Tab ─────────────────────────────────────────── */}
        <LeaderboardTab leaderboard={leaderboard} />

        {/* ─── Šabloni Tab ────────────────────────────────────────────── */}
        <TemplatesTab catCfg={catCfg} dCfg={dCfg} mockTemplates={mockTemplates} />
      </Tabs>

      {/* ─── Create Goal Dialog ────────────────────────────────────────────── */}
              <Novicilj goalDialogOpen={goalDialogOpen} handleCreateGoal={handleCreateGoal} k={k} setGoalDialogOpen={setGoalDialogOpen} />

      {/* ─── Challenge Dialog ──────────────────────────────────────────────── */}
              <Noviizazov challengeDialogOpen={challengeDialogOpen} handleCreateChallenge={handleCreateChallenge} k={k} setChallengeDialogOpen={setChallengeDialogOpen} />

      {/* ─── Badge Dialog ──────────────────────────────────────────────────── */}
              <Novaznaka badgeDialogOpen={badgeDialogOpen} handleCreateBadge={handleCreateBadge} k={k} setBadgeDialogOpen={setBadgeDialogOpen} />

      {/* ─── Goal Detail Dialog ────────────────────────────────────────────── */}
              <Detaljicilja detailOpen={detailOpen} selected={selected} setDetailOpen={setDetailOpen} />
    </div>
  )
}
