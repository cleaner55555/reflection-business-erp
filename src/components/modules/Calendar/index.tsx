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
import {
import { useCalendar } from './hooks'

export function Kalendar() {
  const {activeTab, c, dayEvents, days, deleteConfirmOpen, editingEvent, eventDetailOpen, eventDialogOpen, filterColor, filterType, filteredEvents, getWeekDays, goToday, handleDeleteEvent, handleSubmitEvent, info, isSelected, isTodayDate, k, loadEvents, loading, nextMonth, nextWeek, past, prevMonth, prevWeek, searchQuery, selectedEvent, setActiveTab, setDeleteConfirmOpen, setEventDetailOpen, setEventDialogOpen, setFilterColor, setFilterType, submitting, toastMsg, todayEvents, type, upcoming, upcomingEvents} = useCalendar()
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"><AlertDescription>{toastMsg}</AlertDescription></Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" /> Kalendar</h1>
          <p className="text-sm text-muted-foreground">Upravljanje događajima, sastancima i rokovima</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={goToday}><Sun className="h-4 w-4 mr-1" /> Danas</Button>
          <Button size="sm" onClick={() => openNewEvent()}><Plus className="h-4 w-4 mr-1" /> Novi događaj</Button>
          <Button variant="outline" size="sm" onClick={loadEvents}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month"><LayoutGrid className="h-4 w-4 mr-1 hidden sm:inline" /> Mesec</TabsTrigger>
          <TabsTrigger value="week"><Grid3X3 className="h-4 w-4 mr-1 hidden sm:inline" /> Nedelja</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-1 hidden sm:inline" /> Lista</TabsTrigger>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Pregled</TabsTrigger>
        </TabsList>

        {/* ===== MONTH VIEW ===== */}
        <MonthTab dayEvents={dayEvents} days={days} filterType={filterType} isSelected={isSelected} loading={loading} nextMonth={nextMonth} prevMonth={prevMonth} setFilterType={setFilterType} />

        {/* ===== WEEK VIEW ===== */}
        <WeekTab dayEvents={dayEvents} getWeekDays={getWeekDays} goToday={goToday} isTodayDate={isTodayDate} nextWeek={nextWeek} prevWeek={prevWeek} />

        {/* ===== LIST VIEW ===== */}
        <ListTab c={c} filterColor={filterColor} filterType={filterType} filteredEvents={filteredEvents} loading={loading} past={past} searchQuery={searchQuery} setFilterColor={setFilterColor} setFilterType={setFilterType} upcoming={upcoming} />

        {/* ===== OVERVIEW TAB ===== */}
        <OverviewTabContent info={info} todayEvents={todayEvents} type={type} upcomingEvents={upcomingEvents} />
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* New/Edit Event */}
              <EditingEventIzmenidogaa editingEvent={editingEvent} eventDialogOpen={eventDialogOpen} handleSubmitEvent={handleSubmitEvent} k={k} setEventDialogOpen={setEventDialogOpen} submitting={submitting} />

      {/* Event Detail */}
              <DialogBlock1 eventDetailOpen={eventDetailOpen} selectedEvent={selectedEvent} setEventDetailOpen={setEventDetailOpen} />

      {/* Delete Confirmation */}
              <DialogBlock2 deleteConfirmOpen={deleteConfirmOpen} handleDeleteEvent={handleDeleteEvent} selectedEvent={selectedEvent} setDeleteConfirmOpen={setDeleteConfirmOpen} />

        <CalendarInfoSection  />
    </div>
  )
}
