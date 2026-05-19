// ─── Structured Logger ───────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  userId?: string
  companyId?: string
  duration?: number
  error?: string
  stack?: string
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

// ANSI color codes
const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',   // cyan
  info: '\x1b[32m',    // green
  warn: '\x1b[33m',    // yellow
  error: '\x1b[31m',   // red
  fatal: '\x1b[35m',   // magenta
}
const RESET = '\x1b[0m'
const DIM = '\x1b[2m'

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry)
  }

  const color = COLORS[entry.level]
  const level = entry.level.toUpperCase().padEnd(5)
  const ctx = entry.context ? ` ${DIM}${JSON.stringify(entry.context)}${RESET}` : ''
  const dur = entry.duration ? ` ${DIM}${entry.duration}ms${RESET}` : ''
  const err = entry.error ? `\n${COLORS.error}  → ${entry.error}${RESET}` : ''

  return `${DIM}${entry.timestamp}${RESET} ${color}${level}${RESET} ${entry.message}${dur}${ctx}${err}`
}

export class Logger {
  private minLevel: LogLevel
  private context?: Record<string, unknown>
  private static instance: Logger

  constructor(level: LogLevel = 'info', context?: Record<string, unknown>) {
    this.minLevel = level
    this.context = context
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      const envLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
      Logger.instance = new Logger(envLevel)
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel]
  }

  private log(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level,
      message,
      context: this.context ? { ...this.context, ...extra } : extra,
      ...extra,
    }

    if (entry.error instanceof Error) {
      entry.stack = entry.error.stack
      entry.error = entry.error.message
    }

    const output = formatEntry(entry)
    if (level === 'error' || level === 'fatal') {
      console.error(output)
    } else {
      console.log(output)
    }
  }

  debug(message: string, context?: Record<string, unknown>): void { this.log('debug', message, context) }
  info(message: string, context?: Record<string, unknown>): void { this.log('info', message, context) }
  warn(message: string, context?: Record<string, unknown>): void { this.log('warn', message, context) }
  error(message: string, error?: Error | string, context?: Record<string, unknown>): void {
    const extra = { ...context }
    if (error instanceof Error) {
      extra.error = error
    } else if (typeof error === 'string') {
      extra.error = error
    }
    this.log('error', message, extra)
  }
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void { this.log('fatal', message, { ...context, error }) }

  child(context: Record<string, unknown>): Logger {
    return new Logger(this.minLevel, { ...this.context, ...context })
  }
}

// Default logger instance
export const logger = Logger.getInstance()

// ─── API Request Logger ─────────────────────────────────────────────────────

export function logApiRequest(method: string, url: string, statusCode: number, duration: number): void {
  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
    message: `${method} ${url} → ${statusCode}`,
    duration,
  }

  if (entry.level === 'error' || entry.level === 'warn') {
    console.error(formatEntry(entry))
  } else {
    console.log(formatEntry(entry))
  }
}
