'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Sparkles } from 'lucide-react'
import {
  MODULE_GROUPS, SUGGESTIONS, ALL_MODULE_IDS,
  StepIndicator, DescribeStep, AnalyzingStep, ConfirmStep,
} from './components'

// ─── Export ──────────────────────────────────────────────
let _setOpen: (open: boolean) => void = () => {}
export function openAISetupWizard() { _setOpen(true) }

// ─── Component ───────────────────────────────────────────
export function AISetupWizard() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [aiResult, setAiResult] = useState<{ modules: string[]; industry: string; explanation: string } | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { setEnabledModules, setSetupComplete } = useAppStore()

  useEffect(() => { _setOpen = setOpen }, [setOpen])
  useEffect(() => {
    const setupDone = localStorage.getItem('setupComplete')
    if (!setupDone) { const timer = setTimeout(() => setOpen(true), 1500); return () => clearTimeout(timer) }
  }, [])
  useEffect(() => { if (open && step === 1) { setTimeout(() => textareaRef.current?.focus(), 300) } }, [open, step])

  const handleAnalyze = async () => {
    if (!description.trim()) return
    setStep(2); setError(''); setAiResult(null)
    try {
      const res = await fetch('/api/ai-modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: description.trim() }) })
      if (!res.ok) throw new Error('Greška')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiResult(data); setSelectedModules(new Set(data.modules || [])); setStep(3)
    } catch { setError('Greška pri analizi. Pokušajte ponovo.'); setStep(1) }
  }

  const toggleModule = (id: string) => {
    setSelectedModules(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const toggleGroup = (groupModules: { id: string }[]) => {
    const allInGroup = groupModules.every(m => selectedModules.has(m.id))
    setSelectedModules(prev => { const next = new Set(prev); if (allInGroup) groupModules.forEach(m => next.delete(m.id)); else groupModules.forEach(m => next.add(m.id)); return next })
  }

  const handleConfirm = () => {
    setEnabledModules(Array.from(selectedModules)); setSetupComplete(true); setOpen(false)
    setStep(1); setDescription(''); setSelectedModules(new Set()); setAiResult(null)
  }

  const handleSkip = () => { setSetupComplete(true); setOpen(false) }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reflection AI Setup</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pustite AI da podesi sistem za vas</p>
              </div>
            </div>
            <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Preskoči</button>
          </div>
          <StepIndicator step={step} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {step === 1 && <DescribeStep description={description} textareaRef={textareaRef} error={error} onDescriptionChange={setDescription} onAnalyze={handleAnalyze} />}
          {step === 2 && <AnalyzingStep />}
          {step === 3 && <ConfirmStep aiResult={aiResult} selectedModules={selectedModules} onToggleModule={toggleModule} onToggleGroup={toggleGroup} onSetSelectedModules={setSelectedModules} onBack={() => setStep(1)} onConfirm={handleConfirm} />}
        </div>
      </div>
    </div>
  )
}
