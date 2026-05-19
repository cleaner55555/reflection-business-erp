'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string | null
  showDetails: boolean
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorId: null, showDetails: false }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)

    const errorId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.setState({ errorId })

    // Immediately report error to monitoring API (fire-and-forget)
    fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        severity: 'error',
        stack: error.stack,
        context: {
          endpoint: window?.location?.href,
          userAgent: navigator?.userAgent,
        },
      }),
    }).catch(() => {
      // Silently fail — don't break the error boundary
    })

    // Store the error info locally for the report button
    if (typeof window !== 'undefined') {
      try {
        const errorReport = {
          id: errorId,
          message: error.message,
          stack: error.stack,
          componentStack: info.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
        sessionStorage.setItem(`error-report-${errorId}`, JSON.stringify(errorReport))
      } catch {
        // Ignore sessionStorage errors
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null, showDetails: false })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = async () => {
    if (!this.state.errorId) return

    try {
      const stored = sessionStorage.getItem(`error-report-${this.state.errorId}`)
      let message = 'Unknown error'
      let stack = undefined
      let endpoint = undefined
      let userAgent = undefined

      if (stored) {
        const report = JSON.parse(stored)
        message = report.message || message
        stack = report.stack
        endpoint = report.url
        userAgent = report.userAgent
      }

      // Re-report to monitoring API as explicit user report
      const res = await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          severity: 'error',
          stack,
          context: { endpoint, userAgent },
        }),
      })

      if (res.ok) {
        alert('Greška je uspješno prijavljena. Hvala vam!')
      } else {
        alert('Greška prijavljena (nije potvrđena od servera).')
      }
    } catch {
      alert('Greška prijavljena. Hvala vam!')
    }
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Došlo je do greške
            </h2>
            <p className="text-sm text-muted-foreground">
              Dogodila se neočekivana greška. Greška je zabilježena i naš tim će je ispitati.
            </p>

            {this.state.errorId && (
              <p className="text-xs text-muted-foreground font-mono">
                ID greške: {this.state.errorId}
              </p>
            )}

            {this.state.error && (
              <div className="text-left">
                <button
                  onClick={this.toggleDetails}
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {this.state.showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Tehnički detalji
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-32 text-muted-foreground">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack?.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Pokušaj ponovo
              </Button>
              <Button variant="outline" onClick={this.handleReportError} className="gap-2">
                <Send className="h-4 w-4" />
                Prijavi grešku
              </Button>
              <Button onClick={this.handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Početna
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
