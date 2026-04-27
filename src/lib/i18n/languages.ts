// ============ ALL SUPPORTED LANGUAGES ============
// Languages without full translations fall back to English automatically via t() function.

export interface LanguageInfo {
  code: string
  nativeName: string
  englishName: string
  flag: string // emoji flag or unicode
}

export const ALL_LANGUAGES: LanguageInfo[] = [
  // === EUROPE ===
  { code: 'sr', nativeName: 'Српски (Ћирилица)', englishName: 'Serbian (Cyrillic)', flag: '🇷🇸' },
  { code: 'sr-latn', nativeName: 'Srpski (Latinica)', englishName: 'Serbian (Latin)', flag: '🇷🇸' },
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-br', nativeName: 'Português (Brasil)', englishName: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', flag: '🇵🇱' },
  { code: 'cs', nativeName: 'Čeština', englishName: 'Czech', flag: '🇨🇿' },
  { code: 'sk', nativeName: 'Slovenčina', englishName: 'Slovak', flag: '🇸🇰' },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', nativeName: 'Română', englishName: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian', flag: '🇭🇷' },
  { code: 'sl', nativeName: 'Slovenščina', englishName: 'Slovenian', flag: '🇸🇮' },
  { code: 'mk', nativeName: 'Македонски', englishName: 'Macedonian', flag: '🇲🇰' },
  { code: 'bs', nativeName: 'Bosanski', englishName: 'Bosnian', flag: '🇧🇦' },
  { code: 'sq', nativeName: 'Shqip', englishName: 'Albanian', flag: '🇦🇱' },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦' },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish', flag: '🇩🇰' },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish', flag: '🇸🇪' },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', nativeName: 'Suomi', englishName: 'Finnish', flag: '🇫🇮' },
  { code: 'et', nativeName: 'Eesti', englishName: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', nativeName: 'Lietuvių', englishName: 'Lithuanian', flag: '🇱🇹' },
  { code: 'ga', nativeName: 'Gaeilge', englishName: 'Irish', flag: '🇮🇪' },
  { code: 'is', nativeName: 'Íslenska', englishName: 'Icelandic', flag: '🇮🇸' },
  { code: 'mt', nativeName: 'Malti', englishName: 'Maltese', flag: '🇲🇹' },
  { code: 'cy', nativeName: 'Cymraeg', englishName: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'ca', nativeName: 'Català', englishName: 'Catalan', flag: '🏴󠁢󠁣󠁥󠁜󠁿' },
  { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', flag: '🇪🇸' },
  { code: 'gl', nativeName: 'Galego', englishName: 'Galician', flag: '🇪🇸' },
  { code: 'be', nativeName: 'Беларуская', englishName: 'Belarusian', flag: '🇧🇾' },
  { code: 'ka', nativeName: 'ქართული', englishName: 'Georgian', flag: '🇬🇪' },
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', flag: '🇦🇲' },
  { code: 'az', nativeName: 'Azərbaycan', englishName: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'kk', nativeName: 'Қазақ', englishName: 'Kazakh', flag: '🇰🇿' },

  // === ASIA ===
  { code: 'zh', nativeName: '中文', englishName: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-tw', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', flag: '🇮🇷' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦' },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', flag: '🇮🇱' },
  { code: 'th', nativeName: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', flag: '🇲🇾' },
  { code: 'tl', nativeName: 'Filipino', englishName: 'Filipino', flag: '🇵🇭' },
  { code: 'kh', nativeName: 'ភាសាខ្មែរ', englishName: 'Khmer', flag: '🇰🇭' },
  { code: 'lo', nativeName: 'ລາວ', englishName: 'Lao', flag: '🇱🇦' },
  { code: 'my', nativeName: 'ဗမာစကာ', englishName: 'Burmese', flag: '🇲🇲' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', flag: '🇳🇵' },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', flag: '🇱🇰' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'mn', nativeName: 'Монгол', englishName: 'Mongolian', flag: '🇲🇳' },
  { code: 'uz', nativeName: 'Oʻzbek', englishName: 'Uzbek', flag: '🇺🇿' },

  // === AFRICA ===
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', flag: '🇰🇪' },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', flag: '🇪🇹' },
  { code: 'zu', nativeName: 'isiZulu', englishName: 'Zulu', flag: '🇿🇦' },
  { code: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', nativeName: 'Igbo', englishName: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', nativeName: 'Hausa', englishName: 'Hausa', flag: '🇳🇬' },
  { code: 'rw', nativeName: 'Ikinyarwanda', englishName: 'Kinyarwanda', flag: '🇷🇼' },

  // === AMERICAS ===
  { code: 'es-mx', nativeName: 'Español (México)', englishName: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'es-ar', nativeName: 'Español (Argentina)', englishName: 'Spanish (Argentina)', flag: '🇦🇷' },
  { code: 'fr-ca', nativeName: 'Français (Canada)', englishName: 'French (Canada)', flag: '🇨🇦' },
  { code: 'ht', nativeName: 'Kreyòl Ayisyen', englishName: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'qu', nativeName: 'Runasimi', englishName: 'Quechua', flag: '🇵🇪' },
  { code: 'gn', nativeName: "Avañe'ẽ", englishName: 'Guarani', flag: '🇵🇾' },

  // === OCEANIA ===
  { code: 'mi', nativeName: 'Te Reo Māori', englishName: 'Māori', flag: '🇳🇿' },
  { code: 'haw', nativeName: 'ʻŌlelo Hawaiʻi', englishName: 'Hawaiian', flag: '🌴' },
  { code: 'sm', nativeName: 'Gagana Sāmoa', englishName: 'Samoan', flag: '🇼🇸' },
  { code: 'to', nativeName: 'Lea Fakatonga', englishName: 'Tongan', flag: '🇹🇴' },

  // === CONSTRUCTED / OTHER ===
  { code: 'eo', nativeName: 'Esperanto', englishName: 'Esperanto', flag: '🌍' },
]

// Map for quick lookup by code
export const LANGUAGES_BY_CODE: Record<string, LanguageInfo> = {}
ALL_LANGUAGES.forEach((lang) => {
  LANGUAGES_BY_CODE[lang.code] = lang
})
