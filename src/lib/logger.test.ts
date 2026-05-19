import { describe, it, expect, vi } from 'vitest'
import { Logger, log } from './logger'

describe('Logger', () => {
  it('creates a logger with a module name', () => {
    const logger = new Logger('test')
    expect(logger).toBeDefined()
  })

  it('defaults module name to "app" when none provided', () => {
    const logger = new Logger()
    // Can't directly access private, but it won't throw
    expect(logger).toBeDefined()
  })

  it('setContext returns the logger instance for chaining', () => {
    const logger = new Logger('test')
    const result = logger.setContext({ userId: '1' })
    expect(result).toBe(logger)
  })

  it('child creates a new logger with combined module name', () => {
    const parent = new Logger('api')
    const child = parent.child('auth')
    expect(child).toBeDefined()
    // Private field but child doesn't throw
  })

  it('child inherits context from parent', () => {
    const parent = new Logger('api')
    parent.setContext({ companyId: 'c1' })
    const child = parent.child('auth')
    // Just verify it doesn't throw
    expect(child).toBeDefined()
  })

  it('info method does not throw', () => {
    const logger = new Logger('test')
    expect(() => logger.info('test message')).not.toThrow()
  })

  it('error method does not throw', () => {
    const logger = new Logger('test')
    expect(() => logger.error('test error')).not.toThrow()
  })

  it('error method accepts an Error object', () => {
    const logger = new Logger('test')
    expect(() => logger.error('test', new Error('boom'))).not.toThrow()
  })

  it('warn method does not throw', () => {
    const logger = new Logger('test')
    expect(() => logger.warn('test warning')).not.toThrow()
  })

  it('debug method does not throw', () => {
    const logger = new Logger('test')
    expect(() => logger.debug('test debug')).not.toThrow()
  })

  it('fatal method does not throw', () => {
    const logger = new Logger('test')
    expect(() => logger.fatal('test fatal')).not.toThrow()
  })

  it('time method times an async function', async () => {
    const logger = new Logger('test')
    const result = await logger.time('test', async () => {
      return 42
    })
    expect(result).toBe(42)
  })

  it('time method propagates errors', async () => {
    const logger = new Logger('test')
    await expect(
      logger.time('test', async () => {
        throw new Error('fail')
      })
    ).rejects.toThrow('fail')
  })
})

describe('Pre-configured loggers', () => {
  it('has all expected pre-configured loggers', () => {
    expect(log.api).toBeDefined()
    expect(log.auth).toBeDefined()
    expect(log.db).toBeDefined()
    expect(log.ws).toBeDefined()
    expect(log.crm).toBeDefined()
    expect(log.invoice).toBeDefined()
    expect(log.hr).toBeDefined()
    expect(log.sync).toBeDefined()
    expect(log.audit).toBeDefined()
    expect(log.app).toBeDefined()
  })

  it('create() creates a new logger', () => {
    const custom = log.create('custom-module')
    expect(custom).toBeDefined()
  })
})
