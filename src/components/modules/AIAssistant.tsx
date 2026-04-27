'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/helpers'
import { useAppStore } from '@/lib/store'

// ============ TYPES ============

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ============ MODULE CONTEXT LABELS ============

const MODULE_CONTEXT: Record<string, string> = {
  dashboard: 'pregledne instrument table',
  finansije: 'modul finansije',
  fakture: 'modul fakture',
  magacin: 'modul magacin',
  partneri: 'modul partneri',
  nabavka: 'modul nabavka',
  crm: 'modul CRM',
  kalendar: 'modul kalendar',
  zaposleni: 'modul zaposleni',
  projekti: 'modul projekti',
  sredstva: 'modul osnovna sredstva',
  dokumenta: 'modul dokumenta',
  knjigovodstvo: 'modul knjigovodstvo',
  protokol: 'modul protokol',
  edukacija: 'modul edukacija',
  'vozni-park': 'modul vozni park',
  izvestaji: 'modul izveštaji',
  podesavanja: 'podešavanja sistema',
}

// ============ COMPONENT ============

export function AIAssistant() {
  const { activeModule } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============ SCROLL TO BOTTOM ============

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // ============ SEND MESSAGE ============

  const sendMessage = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const context = MODULE_CONTEXT[activeModule] || 'sistem'

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          context: `Korisnik se trenutno nalazi u ${context} modulu.`,
        }),
      })

      if (!res.ok) throw new Error('Greška pri slanju poruke')

      const data = await res.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Izvinjavam se, nisam uspeo da generišem odgovor.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Izvinjavam se, došlo je do greške. Molimo pokušajte ponovo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ============ RENDER ============

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <div
        className={cn(
          'w-[calc(100vw-3rem)] sm:w-[400px] transition-all duration-300 ease-in-out',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        <Card className="shadow-2xl border-border/50 overflow-hidden flex flex-col max-h-[520px]">
          {/* Header */}
          <CardHeader className="p-4 pb-3 shrink-0 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Reflection AI Asistent</CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    {MODULE_CONTEXT[activeModule] || 'Sistem'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {/* Welcome message */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Zdravo! Ja sam Reflection AI asistent.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kako vam mogu pomoći danas?
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {['Kreiraj fakturu', 'Prikaži stanje magacina', 'Izveštaj prihoda'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInputValue(suggestion)
                        setTimeout(() => inputRef.current?.focus(), 100)
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      msg.role === 'user'
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString('sr-RS', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-3 border-t shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Unesite poruku..."
                disabled={isLoading}
                className="flex-1 text-sm h-9 rounded-full border-border/60 pl-4 pr-2"
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full shrink-0"
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Pošalji</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          isOpen && 'rotate-0'
        )}
      >
        <span className="sr-only">
          {isOpen ? 'Zatvori AI asistent' : 'Otvori AI asistent'}
        </span>
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground" />
            </span>
          </div>
        )}
      </Button>
    </div>
  )
}
