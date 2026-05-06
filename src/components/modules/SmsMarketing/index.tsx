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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
import { formatDate, formatRSD } from '@/lib/helpers'
import { toast } from 'sonner'

import { useSmsMarketing } from './hooks'

export function SmsMarketing() {
  const {activeTab, campaignDialogOpen, campaigns, contactDialogOpen, contacts, detailOpen, filterCategory, filterStatus, filteredCampaigns, g, handleCreateCampaign, handleCreateContact, handleCreateKeyword, handleCreateTemplate, k, keywordDialogOpen, keywords, loadData, logs, searchQuery, selectedCampaign, setActiveTab, setCampaignDialogOpen, setContactDialogOpen, setDetailOpen, setFilterCategory, setFilterStatus, setKeywordDialogOpen, setTemplateDialogOpen, templateDialogOpen, templates, toastMsg} = useSmsMarketing()
  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> SMS Marketing</h1>
          <p className="text-sm text-muted-foreground">Kampanje, template-i i transakcione SMS poruke</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setCampaignDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova kampanja</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="h-3.5 w-3.5 mr-1" /> Kampanje</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-3.5 w-3.5 mr-1" /> Template-i</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="h-3.5 w-3.5 mr-1" /> Kontakti</TabsTrigger>
          <TabsTrigger value="logs"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Log</TabsTrigger>
          <TabsTrigger value="keywords"><Hash className="h-3.5 w-3.5 mr-1" /> Ključne reči</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <OverviewTab campaigns={campaigns} keywords={keywords} templates={templates} />

        {/* ===== CAMPAIGNS ===== */}
        <CampaignsTab campaigns={campaigns} filterCategory={filterCategory} filterStatus={filterStatus} filteredCampaigns={filteredCampaigns} k={k} searchQuery={searchQuery} setFilterCategory={setFilterCategory} setFilterStatus={setFilterStatus} />

        {/* ===== TEMPLATES ===== */}
        <TemplatesTab templates={templates} />

        {/* ===== CONTACTS ===== */}
        <ContactsTab contacts={contacts} />

        {/* ===== LOG ===== */}
        <LogsTab logs={logs} searchQuery={searchQuery} />

        {/* ===== KEYWORDS ===== */}
        <KeywordsTab keywords={keywords} />

        {/* ===== SETTINGS ===== */}
        <SettingsTab  />
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New Campaign */}
              <NovaSMSkampanja campaignDialogOpen={campaignDialogOpen} handleCreateCampaign={handleCreateCampaign} setCampaignDialogOpen={setCampaignDialogOpen} />

      {/* New Template */}
              <NoviSMStemplate handleCreateTemplate={handleCreateTemplate} setTemplateDialogOpen={setTemplateDialogOpen} templateDialogOpen={templateDialogOpen} />

      {/* New Contact */}
              <Novikontakt contactDialogOpen={contactDialogOpen} g={g} handleCreateContact={handleCreateContact} setContactDialogOpen={setContactDialogOpen} />

      {/* New Keyword */}
              <Novakljunare handleCreateKeyword={handleCreateKeyword} keywordDialogOpen={keywordDialogOpen} setKeywordDialogOpen={setKeywordDialogOpen} />

      {/* Campaign Detail */}
              <SelectedCampaignname detailOpen={detailOpen} selectedCampaign={selectedCampaign} setDetailOpen={setDetailOpen} />
    </div>
  )
}
