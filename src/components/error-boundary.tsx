'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
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
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. This has been logged and our team will investigate.
            </p>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-32 text-muted-foreground">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button onClick={this.handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
