'use client'
import { MessageCircleReply, Plus, RefreshCw, BarChart3, MessageSquare, FileText, Bot, Send, Settings, PhoneIncoming, Users } from 'lucide-react'

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
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

import { OverviewTab, MessagesTab, TemplatesTab, ChatbotTab, CampaignsTab, SettingsTab, Novaporuka, EditingTemplateIzmenitem, EditingAutoReplyIzmeniau, Novakampanja } from './components'

import { useMessaging } from './hooks'

export function Messaging() {
  const {activeTab, autoReplies, autoReplyDialogOpen, campaignDialogOpen, campaigns, catCfg, convSearch, conversations, editingAutoReply, editingTemplate, filterStatus, filterTag, filteredConvs, handleNewMessage, handleSaveAutoReply, handleSaveTemplate, handleSendReply, isInbound, k, l, loadData, newMsgDialogOpen, newMsgPhone, newMsgText, replyText, selectedConv, setActiveTab, setAutoReplyDialogOpen, setCampaignDialogOpen, setFilterStatus, setFilterTag, setNewMsgDialogOpen, setTemplateDialogOpen, statusCfg, t, templateDialogOpen, templates, toastMsg} = useMessaging()
  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircleReply className="h-6 w-6 text-green-600" /> Business Poruke
          </h1>
          <p className="text-sm text-muted-foreground">Business Poruke integracija za komunikaciju sa klijentima</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setNewMsgDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova poruka</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Poruke <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0">{stats.unread}</Badge></TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-3.5 w-3.5 mr-1" /> Template-i</TabsTrigger>
          <TabsTrigger value="chatbot"><Bot className="h-3.5 w-3.5 mr-1" /> Chatbot</TabsTrigger>
          <TabsTrigger value="campaigns"><Send className="h-3.5 w-3.5 mr-1" /> Kampanje</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" /> Podešavanja</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <OverviewTab autoReplies={autoReplies} campaigns={campaigns} conversations={conversations} templates={templates} />

        {/* ===== MESSAGES ===== */}
        <MessagesTab convSearch={convSearch} filterStatus={filterStatus} filterTag={filterTag} filteredConvs={filteredConvs} handleSendReply={handleSendReply} isInbound={isInbound} k={k} replyText={replyText} selectedConv={selectedConv} setFilterStatus={setFilterStatus} setFilterTag={setFilterTag} t={t} />

        {/* ===== TEMPLATES ===== */}
        <TemplatesTab catCfg={catCfg} templates={templates} />

        {/* ===== CHATBOT ===== */}
        <ChatbotTab autoReplies={autoReplies} />

        {/* ===== CAMPAIGNS ===== */}
        <CampaignsTab campaigns={campaigns} statusCfg={statusCfg} />

        {/* ===== SETTINGS ===== */}
        <SettingsTab  />
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New Message */}
              <Novaporuka handleNewMessage={handleNewMessage} newMsgDialogOpen={newMsgDialogOpen} newMsgPhone={newMsgPhone} newMsgText={newMsgText} setNewMsgDialogOpen={setNewMsgDialogOpen} />

      {/* New/Edit Template */}
              <EditingTemplateIzmenitem editingTemplate={editingTemplate} handleSaveTemplate={handleSaveTemplate} l={l} setTemplateDialogOpen={setTemplateDialogOpen} templateDialogOpen={templateDialogOpen} />

      {/* New/Edit Auto Reply */}
              <EditingAutoReplyIzmeniau autoReplyDialogOpen={autoReplyDialogOpen} editingAutoReply={editingAutoReply} handleSaveAutoReply={handleSaveAutoReply} k={k} setAutoReplyDialogOpen={setAutoReplyDialogOpen} />

      {/* New Campaign */}
              <Novakampanja campaignDialogOpen={campaignDialogOpen} setCampaignDialogOpen={setCampaignDialogOpen} templates={templates} />

      {/* ===== QUICK STATS BAR (visible on all tabs) ===== */}
      {activeTab !== 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-green-600" /></div>
              <div><p className="text-[10px] text-muted-foreground">Danas</p><p className="text-lg font-bold">{stats.todayMsgs}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><PhoneIncoming className="h-4 w-4 text-blue-600" /></div>
              <div><p className="text-[10px] text-muted-foreground">Nepročitane</p><p className="text-lg font-bold">{stats.unread}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center"><Bot className="h-4 w-4 text-amber-600" /></div>
              <div><p className="text-[10px] text-muted-foreground">Auto odgovori</p><p className="text-lg font-bold">{autoReplies.filter(a => a.enabled).length}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"><Users className="h-4 w-4 text-purple-600" /></div>
              <div><p className="text-[10px] text-muted-foreground">Kontakti</p><p className="text-lg font-bold">{stats.totalContacts}</p></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
