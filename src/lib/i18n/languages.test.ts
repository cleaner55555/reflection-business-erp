import { describe, it, expect } from 'vitest'
import { ALL_LANGUAGES, LANGUAGES_BY_CODE } from './languages'

describe('Languages', () => {
  it('has at least 80 languages', () => {
    expect(ALL_LANGUAGES.length).toBeGreaterThanOrEqual(80)
  })
  it('all languages have required fields', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(lang.code).toBeTruthy()
      expect(lang.nativeName).toBeTruthy()
      expect(lang.englishName).toBeTruthy()
      expect(lang.flag).toBeTruthy()
    }
  })
  it('all codes exist in lookup map', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(LANGUAGES_BY_CODE[lang.code]).toBeDefined()
    }
  })
  it('has no duplicate codes', () => {
    const codes = ALL_LANGUAGES.map(l => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})
