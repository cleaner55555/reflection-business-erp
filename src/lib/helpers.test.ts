import { describe, it, expect } from 'vitest'
import {
  formatRSD,
  formatRSDShort,
  formatDate,
  formatDateTime,
  getStatusLabel,
  getStatusColor,
  getMonthLabel,
  cn,
} from './helpers'

describe('formatRSD', () => {
  it('formats zero amount', () => {
    expect(formatRSD(0)).toBe('0,00 RSD')
  })

  it('formats positive amounts with two decimal places', () => {
    expect(formatRSD(1234.5)).toBe('1.234,50 RSD')
  })

  it('formats large amounts with thousand separators', () => {
    expect(formatRSD(1500000)).toBe('1.500.000,00 RSD')
  })

  it('formats negative amounts', () => {
    const result = formatRSD(-500)
    expect(result).toContain('RSD')
    expect(result).toContain('500')
  })
})

describe('formatRSDShort', () => {
  it('formats amounts under 1000 without suffix', () => {
    expect(formatRSDShort(500)).toBe('500 RSD')
  })

  it('formats amounts in thousands with K suffix', () => {
    expect(formatRSDShort(5000)).toBe('5K RSD')
  })

  it('formats amounts in millions with M suffix and one decimal', () => {
    expect(formatRSDShort(2500000)).toBe('2.5M RSD')
  })

  it('formats exact millions correctly', () => {
    expect(formatRSDShort(1000000)).toBe('1.0M RSD')
  })

  it('formats zero', () => {
    expect(formatRSDShort(0)).toBe('0 RSD')
  })
})

describe('formatDate', () => {
  it('formats a date string in dd.MM.yyyy', () => {
    expect(formatDate('2024-06-15')).toBe('15.06.2024')
  })

  it('formats a Date object', () => {
    expect(formatDate(new Date(2024, 0, 1))).toBe('01.01.2024')
  })

  it('handles end-of-year dates', () => {
    expect(formatDate('2024-12-31')).toBe('31.12.2024')
  })

  it('handles leap year dates', () => {
    expect(formatDate('2024-02-29')).toBe('29.02.2024')
  })
})

describe('formatDateTime', () => {
  it('formats a date-time string', () => {
    const result = formatDateTime('2024-06-15T14:30:00')
    expect(result).toContain('15.06.2024')
    expect(result).toContain('14:30')
  })

  it('formats midnight correctly', () => {
    const result = formatDateTime('2024-01-01T00:00:00')
    expect(result).toContain('00:00')
  })

  it('handles end of day', () => {
    const result = formatDateTime('2024-12-31T23:59:00')
    expect(result).toContain('23:59')
  })
})

describe('getStatusLabel', () => {
  it('returns Serbian label for known statuses', () => {
    expect(getStatusLabel('nacrt')).toBe('Načrt')
    expect(getStatusLabel('placena')).toBe('Plaćena')
    expect(getStatusLabel('otkazana')).toBe('Otkazana')
    expect(getStatusLabel('poslata')).toBe('Poslata')
  })

  it('returns the status string itself for unknown statuses', () => {
    expect(getStatusLabel('unknown_status')).toBe('unknown_status')
    expect(getStatusLabel('')).toBe('')
  })

  it('handles CRM stage labels', () => {
    expect(getStatusLabel('lead')).toBe('Lead')
    expect(getStatusLabel('won')).toBe('Dobijeno')
    expect(getStatusLabel('lost')).toBe('Izgubljeno')
  })

  it('handles priority labels', () => {
    expect(getStatusLabel('nizak')).toBe('Nizak')
    expect(getStatusLabel('visok')).toBe('Visok')
    expect(getStatusLabel('hitan')).toBe('Hitan')
  })

  it('handles SEF status labels', () => {
    expect(getStatusLabel('not_sent')).toBe('Nije poslata')
    expect(getStatusLabel('accepted')).toBe('Prihvaćena')
    expect(getStatusLabel('rejected')).toBe('Odbijena')
  })
})

describe('getStatusColor', () => {
  it('returns a color class for known statuses', () => {
    expect(getStatusLabel('placena'))
    expect(getStatusColor('placena')).toContain('emerald')
    expect(getStatusColor('otkazana')).toContain('red')
    expect(getStatusColor('nacrt')).toContain('slate')
  })

  it('returns default color for unknown statuses', () => {
    expect(getStatusColor('unknown')).toBe('bg-slate-100 text-slate-700 border-slate-200')
  })

  it('returns correct colors for positive/negative statuses', () => {
    expect(getStatusColor('primljena')).toContain('blue')
    expect(getStatusColor('izlaz')).toContain('orange')
  })
})

describe('getMonthLabel', () => {
  it('formats month string to Serbian label', () => {
    const result = getMonthLabel('2024-06')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('handles different months', () => {
    const jan = getMonthLabel('2024-01')
    const dec = getMonthLabel('2024-12')
    expect(jan).not.toBe(dec)
  })
})

describe('cn (helpers)', () => {
  it('joins class names with spaces', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out false values', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('filters out undefined and null', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('returns empty string for all falsy values', () => {
    expect(cn(false, undefined, null, '')).toBe('')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})
