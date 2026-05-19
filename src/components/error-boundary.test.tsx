import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ErrorBoundary is a class component, test it directly
import { ErrorBoundary } from '@/components/error-boundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders fallback UI when error occurs', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }

    // Suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Došlo je do greške')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Custom Error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.queryByText('Došlo je do greške')).not.toBeInTheDocument()
    spy.mockRestore()
  })
})

describe('OfflineIndicator', () => {
  it('returns null when online (default in jsdom)', async () => {
    // jsdom's navigator.onLine defaults to true
    const { default: OfflineIndicator } = await import('@/components/OfflineIndicator')
    const { container } = render(<OfflineIndicator />)
    // When online, component returns null (no DOM output)
    expect(container.innerHTML).toBe('')
  })
})
