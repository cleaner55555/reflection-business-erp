'use client'

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RotateCcw, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleKey: string
  resetKey?: string | number
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
  resetCount: number
}

/**
 * React Error Boundary for module components.
 * Catches render errors in lazy-loaded modules and shows a friendly
 * recovery UI instead of crashing the entire application.
 */
export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, resetCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ModuleErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ModuleErrorBoundary] Error in module "${this.props.moduleKey}":`,
      error,
      errorInfo.componentStack
    )
  }

  // Reset when resetKey changes (parent forces remount)
  static getDerivedStateFromProps(
    props: ModuleErrorBoundaryProps,
    state: ModuleErrorBoundaryState
  ): Partial<ModuleErrorBoundaryState> | null {
    if (state.hasError && props.resetKey !== undefined) {
      return { hasError: false, error: null, resetCount: state.resetCount + 1 }
    }
    return null
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, resetCount: this.state.resetCount + 1 })
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Nepoznata greška'
      // Sanitize: remove potential script tags or HTML from error message
      const sanitized = errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div className="text-center space-y-1 max-w-md">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <PackageOpen className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wider">
                Modul: {this.props.moduleKey}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Greška pri učitavanju modula
            </h3>
            <p className="text-sm text-muted-foreground break-words">
              {sanitized}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Pokušaj ponovo
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
