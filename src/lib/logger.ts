// ─── Structured Logging Utility ────────────────────────────────────────────────
// Consistent, structured logging for all parts of the application

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogContext {
  module?: string
  userId?: string
  companyId?: string
  requestId?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  moduleName?: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  duration?: number
}

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // cyan
  info: '\x1b[32m',   // green
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
  fatal: '\x1b[35m',  // magenta
}

const RESET = '\x1b[0m'

class Logger {
  private module: string
  private context: LogContext = {}

  constructor(module?: string) {
    this.module = module || 'app'
  }

  setContext(ctx: Partial<LogContext>) {
    this.context = { ...this.context, ...ctx }
    return this
  }

  child(submodule: string) {
    const child = new Logger(`${this.module}:${submodule}`)
    child.context = { ...this.context }
    return child
  }

  private format(entry: LogEntry): string {
    const color = LOG_COLORS[entry.level]
    const levelStr = entry.level.toUpperCase().padEnd(5)
    const ctxStr = Object.entries(entry.context)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join(' ')

    let msg = `${color}[${levelStr}]${RESET} ${entry.timestamp} [${entry.moduleName || 'app'}] ${entry.message}`
    if (ctxStr) msg += ` | ${ctxStr}`
    if (entry.duration !== undefined) msg += ` (${entry.duration}ms)`

    return msg
  }

  private output(level: LogLevel, message: string, error?: unknown, duration?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context },
      moduleName: this.module,
    }

    if (duration !== undefined) entry.duration = duration

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error && typeof error === 'object' && 'code' in error ? { code: (error as { code: string }).code } : {}),
      }
    } else if (error) {
      entry.error = { name: 'Error', message: String(error) }
    }

    const formatted = this.format(entry)

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') console.debug(formatted)
        break
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
      case 'fatal':
        console.error(formatted)
        break
    }

    // Forward to monitoring system (all environments for full observability)
    if (level === 'error' || level === 'fatal') {
      this.sendToExternal(entry)
    }
  }

  private sendToExternal(entry: LogEntry) {
    // Forward errors/warnings to the built-in monitoring system
    try {
      // Dynamic import to avoid circular dependency in non-server contexts
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { errorTracker } = require('./monitoring/error-tracker')
      if (errorTracker) {
        const severity = entry.level === 'fatal' ? 'critical'
          : entry.level === 'error' ? 'error'
          : entry.level === 'warn' ? 'warning' : 'info'

        if (entry.error) {
          const err = new Error(entry.error.message)
          err.stack = entry.error.stack
          errorTracker.captureError(err, {
            endpoint: this.context.requestId,
            userId: this.context.userId,
            companyId: this.context.companyId,
          }, severity)
        } else {
          errorTracker.captureMessage(entry.message, {
            endpoint: this.context.requestId,
            userId: this.context.userId,
            companyId: this.context.companyId,
          }, severity)
        }
      }
    } catch {
      // Monitoring not available — silently continue
    }
  }

  debug(message: string, ctx?: LogContext) {
    if (ctx) this.setContext(ctx)
    this.output('debug', message)
  }

  info(message: string, ctx?: LogContext) {
    if (ctx) this.setContext(ctx)
    this.output('info', message)
  }

  warn(message: string, ctx?: LogContext, error?: unknown) {
    if (ctx) this.setContext(ctx)
    this.output('warn', message, error)
  }

  error(message: string, error?: unknown, ctx?: LogContext) {
    if (ctx) this.setContext(ctx)
    this.output('error', message, error)
  }

  fatal(message: string, error?: unknown, ctx?: LogContext) {
    if (ctx) this.setContext(ctx)
    this.output('fatal', message, error)
  }

  // Time a function execution
  async time<T>(message: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      this.info(`${message} - completed`, undefined)
      return result
    } catch (error) {
      this.error(`${message} - failed`, error)
      throw error
    } finally {
      this.output('debug', `${message} - ${Date.now() - start}ms`)
    }
  }
}

// Pre-configured loggers for different modules
export const log = {
  api: new Logger('api'),
  auth: new Logger('auth'),
  db: new Logger('db'),
  ws: new Logger('websocket'),
  crm: new Logger('crm'),
  invoice: new Logger('invoice'),
  hr: new Logger('hr'),
  sync: new Logger('sync'),
  audit: new Logger('audit'),
  app: new Logger('app'),
  create: (module: string) => new Logger(module),
}

export { Logger }
export type { LogContext, LogLevel }
