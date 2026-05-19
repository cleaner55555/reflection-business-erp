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

  // --- Additional tests ---

  it('contains Serbian in both scripts', () => {
    const sr = ALL_LANGUAGES.find(l => l.code === 'sr')
    expect(sr).toBeDefined()
    expect(sr!.englishName).toContain('Cyrillic')

    const srLatn = ALL_LANGUAGES.find(l => l.code === 'sr-latn')
    expect(srLatn).toBeDefined()
    expect(srLatn!.englishName).toContain('Latin')
  })

  it('contains English', () => {
    const en = LANGUAGES_BY_CODE['en']
    expect(en).toBeDefined()
    expect(en!.nativeName).toBe('English')
  })

  it('contains RTL languages (Arabic, Hebrew)', () => {
    const ar = LANGUAGES_BY_CODE['ar']
    expect(ar).toBeDefined()
    expect(ar!.englishName).toBe('Arabic')

    const he = LANGUAGES_BY_CODE['he']
    expect(he).toBeDefined()
    expect(he!.englishName).toBe('Hebrew')
  })

  it('contains major Asian languages', () => {
    expect(LANGUAGES_BY_CODE['zh']).toBeDefined()
    expect(LANGUAGES_BY_CODE['ja']).toBeDefined()
    expect(LANGUAGES_BY_CODE['ko']).toBeDefined()
    expect(LANGUAGES_BY_CODE['hi']).toBeDefined()
  })

  it('contains regional variants (e.g., pt-br, es-mx, zh-tw)', () => {
    expect(LANGUAGES_BY_CODE['pt-br']).toBeDefined()
    expect(LANGUAGES_BY_CODE['es-mx']).toBeDefined()
    expect(LANGUAGES_BY_CODE['es-ar']).toBeDefined()
    expect(LANGUAGES_BY_CODE['zh-tw']).toBeDefined()
    expect(LANGUAGES_BY_CODE['fr-ca']).toBeDefined()
  })

  it('lookup map returns correct language for code', () => {
    const de = LANGUAGES_BY_CODE['de']
    expect(de!.code).toBe('de')
    expect(de!.nativeName).toBe('Deutsch')
    expect(de!.englishName).toBe('German')
  })

  it('all language codes are non-empty strings', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(typeof lang.code).toBe('string')
      expect(lang.code.length).toBeGreaterThan(0)
    }
  })

  it('all flags are strings with at least 1 character', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(typeof lang.flag).toBe('string')
      expect(lang.flag.length).toBeGreaterThan(0)
    }
  })
})
