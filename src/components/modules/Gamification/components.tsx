'use client'import { ArrowDown, ArrowUp, Award, CheckCircle2, ChevronRight, Eye, Flame, Gift, Plus, RefreshCw, Search, Target, Trash2, Trophy , AlertCircle} from 'lucide-react'



// ========== OverviewTab ==========

export function OverviewTab({ catCfg }: { catCfg: any }) {
  return (
    <TabsContent value="overview" className="space-y-6">
      {!dashboard ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Aktivni ciljevi</span>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{dashboard.activeGoals}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{dashboard.completedGoals} završenih</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Aktivni izazovi</span>
                <Swords className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{dashboard.activeChallenges}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{dashboard.totalParticipants} učesnika</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Značke</span>
                <Award className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{dashboard.earnedBadges}/{dashboard.totalBadges}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Najbolji</span>
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600 truncate">{dashboard.topScorer}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Prosek: {dashboard.avgPoints} poena</p>
            </Card>
          </div>
    
          {/* Monthly Points Chart */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečna aktivnost (poeni)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-40">
                {dashboard.monthlyPoints.map((m) => {
                  const maxPts = Math.max(...dashboard.monthlyPoints.map((x) => x.points))
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">{(m.points / 1000).toFixed(1)}k</span>
                      <div className="w-full rounded-t bg-primary/80" style={{ height: `${(m.points / maxPts) * 120}px` }} />
                      <span className="text-[10px] text-muted-foreground">{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Ciljevi po kategorijama</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dashboard.categoryBreakdown.map((cat) => {
                  const catCfg = goalCategoryConfig[cat.category]
                  return (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {catCfg?.icon}
                        <span className="text-sm">{getCategoryLabel(cat.category)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${cat.avgProgress}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{cat.avgProgress}%</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
    
            {/* Recent Achievements */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Nedavna dostignuća</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboard.recentAchievements.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{a.employee}</p>
                          <p className="text-xs text-muted-foreground">{a.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">+{a.points}</span>
                        <p className="text-[10px] text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
    
          {/* Quick Leaderboard Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Top 3 rang liste</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab('leaderboard')}>Vidi sve <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((entry, idx) => (
                  <div key={entry.id} className="text-center p-4 rounded-lg border" style={{ borderColor: idx === 0 ? '#eab308' : idx === 1 ? '#9ca3af' : '#b45309' }}>
                    <div className="relative inline-block mb-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto" style={{
                        backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : '#fed7aa',
                        color: idx === 0 ? '#92400e' : idx === 1 ? '#374151' : '#9a3412',
                      }}>
                        {entry.avatar}
                      </div>
                      <div className="absolute -top-2 -right-2 text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                    </div>
                    <p className="text-sm font-medium">{entry.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{entry.department}</p>
                    <p className="text-lg font-bold mt-1">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">poena</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> {entry.badges}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> {entry.streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </TabsContent>
  )
}

// ========== GoalsTab ==========

export function GoalsTab({ catCfg, categoryFilter, filteredGoals, k, loading, sCfg, search, setCategoryFilter, setStatusFilter, statusFilter }: { catCfg: any, categoryFilter: any, filteredGoals: any, k: any, loading: any, sCfg: any, search: any, setCategoryFilter: any, setStatusFilter: any, statusFilter: any }) {
  return (
    <TabsContent value="goals" className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pretraži ciljeve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve kategorije</SelectItem>
            {Object.entries(goalCategoryConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi statusi</SelectItem>
            {Object.entries(goalStatusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredGoals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nema ciljeva</p>
          <Button variant="outline" className="mt-3" onClick={() => { setGoalForm(emptyGoalForm); setGoalDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Kreiraj cilj
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const sCfg = goalStatusConfig[goal.status]
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {catCfg?.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium truncate">{goal.title}</h3>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${sCfg?.color}`}>{sCfg?.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(goal); setDetailOpen(true); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(goal.category)}`}>{getCategoryLabel(goal.category)}</Badge>
                      <span>{goal.type === 'team' ? '👥 Timski' : '👤 Individualni'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {goal.points}p</span>
                      <span>📅 {new Date(goal.deadline).toLocaleDateString('sr-RS')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </TabsContent>
  )
}

// ========== ChallengesTab ==========

export function ChallengesTab({ chSCfg, chTCfg, challenges, dCfg }: { chSCfg: any, chTCfg: any, challenges: any, dCfg: any }) {
  return (
    <TabsContent value="challenges" className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setChallengeForm(emptyChallengeForm); setChallengeDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novi izazov
        </Button>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((ch) => {
          const chSCfg = challengeStatusConfig[ch.status]
          const daysLeft = Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return (
            <Card key={ch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{chTCfg?.icon}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className={`text-[10px] ${chSCfg?.color}`}>{chSCfg?.label}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${dCfg?.color}`}>{'★'.repeat(dCfg?.stars || 1)}</Badge>
                  </div>
                </div>
                <h3 className="text-sm font-medium mb-1">{ch.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ch.description}</p>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Učesnici</span>
                    <span className="font-medium">{ch.participantCount}/{ch.maxParticipants}</span>
                  </div>
                  <Progress value={(ch.participantCount / ch.maxParticipants) * 100} className="h-1.5" />
                  {ch.status === 'active' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Preostalo</span>
                      <span className="font-medium">{daysLeft > 0 ? `${daysLeft} dana` : 'Završeno'}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {ch.rewardPoints}p</span>
                    <span>✅ {ch.completedCount}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(ch.startDate).toLocaleDateString('sr-RS')} - {new Date(ch.endDate).toLocaleDateString('sr-RS')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

// ========== BadgesTab ==========

export function BadgesTab({ badges }: { badges: any }) {
  return (
    <TabsContent value="badges" className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Ukupno {badges.length} znački u sistemu</p>
        <Button size="sm" onClick={() => { setBadgeForm(emptyBadgeForm); setBadgeDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova značka
        </Button>
      </div>
    
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className="hover:shadow-md transition-shadow text-center">
            <CardContent className="p-4">
              <div className="text-4xl mb-2">{badge.isSecret ? '🔒' : badge.icon}</div>
              <h3 className="text-sm font-medium mb-1">{badge.isSecret ? '???' : badge.name}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{badge.isSecret ? 'Tajna značka' : badge.description}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className={`text-[10px] ${getCategoryColor(badge.category)}`}>{getCategoryLabel(badge.category)}</Badge>
                {badge.isRare && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">⭐ Retko</Badge>}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {badge.points}p</span>
                <span>🏆 {badge.earnedBy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

// ========== LeaderboardTab ==========

export function LeaderboardTab({ leaderboard }: { leaderboard: any }) {
  return (
    <TabsContent value="leaderboard" className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Rang lista zaposlenih</CardTitle>
          <CardDescription>Sortirano po ukupnom broju poena</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const rankDiff = entry.previousRank - entry.rank
              return (
                <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg border ${entry.rank <= 3 ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center">
                      {entry.rank === 1 ? <span className="text-xl">🥇</span> : entry.rank === 2 ? <span className="text-xl">🥈</span> : entry.rank === 3 ? <span className="text-xl">🥉</span> : <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{
                      backgroundColor: entry.rank === 1 ? '#fef3c7' : entry.rank === 2 ? '#f3f4f6' : entry.rank === 3 ? '#fed7aa' : '#f1f5f9',
                      color: entry.rank <= 3 ? '#1f2937' : '#64748b',
                    }}>
                      {entry.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{entry.employeeName}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.department} · Nivo {entry.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {entry.badges}</span>
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {entry.streak}d</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {entry.completedGoals}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[120px] justify-end">
                      {rankDiff > 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : rankDiff < 0 ? <ArrowDown className="h-4 w-4 text-red-500" /> : null}
                      <span className="text-lg font-bold">{entry.totalPoints.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">poena</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

// ========== TemplatesTab ==========

export function TemplatesTab({ catCfg, dCfg, mockTemplates }: { catCfg: any, dCfg: any, mockTemplates: any }) {
  return (
    <TabsContent value="templates" className="space-y-4">
      <p className="text-sm text-muted-foreground">Predefinisani šabloni za brzo kreiranje ciljeva</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTemplates.map((tpl) => {
          const catCfg = goalCategoryConfig[tpl.category]
          return (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {catCfg?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{tpl.title}</h3>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(tpl.category)}`}>{getCategoryLabel(tpl.category)}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${dCfg?.color}`}>{dCfg?.label}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{tpl.targetValue} {tpl.unit} · {tpl.points}p</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                    setGoalForm({
                      ...emptyGoalForm, title: tpl.title, description: tpl.description,
                      category: tpl.category, targetValue: String(tpl.targetValue),
                      unit: tpl.unit, points: String(tpl.points),
                    })
                    setGoalDialogOpen(true)
                  }}>
                    <Plus className="h-3 w-3 mr-1" /> Koristi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TabsContent } from '@/components/ui/tabs'

// ========== Novicilj ==========

export function Novicilj({ goalDialogOpen, handleCreateGoal, k, setGoalDialogOpen }: { goalDialogOpen: any, handleCreateGoal: any, k: any, setGoalDialogOpen: any }) {
  return (
    <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novi cilj</DialogTitle>
                <DialogDescription>Definišite cilj sa metama i nagradnim poenima</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Naslov</Label><Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="Naslov cilja" /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategorija</Label>
                    <Select value={goalForm.category} onValueChange={(v) => setGoalForm({ ...goalForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(goalCategoryConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tip</Label>
                    <Select value={goalForm.type} onValueChange={(v) => setGoalForm({ ...goalForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">👤 Individualni</SelectItem>
                        <SelectItem value="team">👥 Timski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Ciljna vrednost</Label><Input type="number" value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Jedinica</Label><Input value={goalForm.unit} onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })} placeholder="kom, sati..." /></div>
                  <div className="space-y-2"><Label>Poeni</Label><Input type="number" value={goalForm.points} onChange={(e) => setGoalForm({ ...goalForm, points: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Rok</Label><Input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Zadužen</Label><Input value={goalForm.assignee} onChange={(e) => setGoalForm({ ...goalForm, assignee: e.target.value })} placeholder="Ime ili tim" /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreateGoal}><Plus className="h-4 w-4 mr-1" /> Kreiraj cilj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Noviizazov ==========

export function Noviizazov({ challengeDialogOpen, handleCreateChallenge, k, setChallengeDialogOpen }: { challengeDialogOpen: any, handleCreateChallenge: any, k: any, setChallengeDialogOpen: any }) {
  return (
    <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novi izazov</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Naslov</Label><Input value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} placeholder="Naziv izazova" /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tip</Label>
                    <Select value={challengeForm.type} onValueChange={(v) => setChallengeForm({ ...challengeForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(challengeTypeConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Težina</Label>
                    <Select value={challengeForm.difficulty} onValueChange={(v) => setChallengeForm({ ...challengeForm, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(difficultyConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{'★'.repeat(v.stars)} {v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Početak</Label><Input type="date" value={challengeForm.startDate} onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Kraj</Label><Input type="date" value={challengeForm.endDate} onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nagrada</Label><Input value={challengeForm.reward} onChange={(e) => setChallengeForm({ ...challengeForm, reward: e.target.value })} placeholder="Opis nagrade" /></div>
                  <div className="space-y-2"><Label>Poeni za nagradu</Label><Input type="number" value={challengeForm.rewardPoints} onChange={(e) => setChallengeForm({ ...challengeForm, rewardPoints: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Kriterijum</Label><Input value={challengeForm.criteria} onChange={(e) => setChallengeForm({ ...challengeForm, criteria: e.target.value })} placeholder="Uslov za završetak" /></div>
                  <div className="space-y-2"><Label>Max učesnika</Label><Input type="number" value={challengeForm.maxParticipants} onChange={(e) => setChallengeForm({ ...challengeForm, maxParticipants: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChallengeDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreateChallenge}><Plus className="h-4 w-4 mr-1" /> Kreiraj izazov</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Novaznaka ==========

export function Novaznaka({ badgeDialogOpen, handleCreateBadge, k, setBadgeDialogOpen }: { badgeDialogOpen: any, handleCreateBadge: any, k: any, setBadgeDialogOpen: any }) {
  return (
    <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nova značka</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Naziv</Label><Input value={badgeForm.name} onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })} placeholder="Naziv značke" /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea value={badgeForm.description} onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ikonica (emoji)</Label>
                    <Input value={badgeForm.icon} onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategorija</Label>
                    <Select value={badgeForm.category} onValueChange={(v) => setBadgeForm({ ...badgeForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(goalCategoryConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Uslov za dobijanje</Label><Input value={badgeForm.requirement} onChange={(e) => setBadgeForm({ ...badgeForm, requirement: e.target.value })} placeholder="Npr. 50 zatvorenih ponuda" /></div>
                <div className="space-y-2"><Label>Poeni</Label><Input type="number" value={badgeForm.points} onChange={(e) => setBadgeForm({ ...badgeForm, points: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBadgeDialogOpen(false)}>Otkaži</Button>
                <Button onClick={handleCreateBadge}><Plus className="h-4 w-4 mr-1" /> Kreiraj značku</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  )
}


// ========== Detaljicilja ==========

export function Detaljicilja({ detailOpen, selected, setDetailOpen }: { detailOpen: any, selected: any, setDetailOpen: any }) {
  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Detalji cilja</DialogTitle></DialogHeader>
              {selected && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {goalCategoryConfig[selected.category]?.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selected.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`text-[10px] ${getCategoryColor(selected.category)}`}>{getCategoryLabel(selected.category)}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${goalStatusConfig[selected.status]?.color}`}>{goalStatusConfig[selected.status]?.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Napredak</span>
                      <span className="font-medium">{selected.progress}%</span>
                    </div>
                    <Progress value={selected.progress} className="h-3" />
                    <p className="text-xs text-muted-foreground">{selected.currentValue} / {selected.targetValue} {selected.unit}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Zadužen:</span> <p className="font-medium">{selected.assignee}</p></div>
                    <div><span className="text-muted-foreground">Tip:</span> <p className="font-medium">{selected.type === 'team' ? '👥 Timski' : '👤 Individualni'}</p></div>
                    <div><span className="text-muted-foreground">Rok:</span> <p className="font-medium">{new Date(selected.deadline).toLocaleDateString('sr-RS')}</p></div>
                    <div><span className="text-muted-foreground">Poeni:</span> <p className="font-bold text-green-600">{selected.points}</p></div>
                  </div>
                  {selected.status === 'active' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Ostalo vam je {selected.targetValue - selected.currentValue} {selected.unit} do cilja. Rok je {new Date(selected.deadline).toLocaleDateString('sr-RS')}.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
  )
}

