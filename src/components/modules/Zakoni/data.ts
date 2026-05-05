export const REGIONS = [
  { value: 'all', label: '🌐 Sve' },
  { value: 'europe', label: '🇪🇺 Evropa' },
  { value: 'americas', label: '🌎 Amerika' },
  { value: 'asia', label: '🌏 Azija' },
]

export const REGION_NAMES: Record<string, string> = { europe: 'Evropa', americas: 'Amerika', asia: 'Azija', africa: 'Afrika', oceania: 'Okeanija' }

export const { t } = useTranslation();

export const law = getTaxLaw(selectedCountry);

export const socket = io('/?XTransformPort=3021', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

export const mapped = data.results.map((r: any) => {
        const cl = COUNTRY_TAX_LAWS.find(c => c.code === r.code)
        return {
          code: r.code,
          name: cl?.name || r.name || r.code,
          flag: cl?.flag || r.flag || '🌐',
          status: r.status,
          changes: r.changes || [],
          message: r.message || '',
          verifiedAt: r.verifiedAt || null,
          confidence: r.confidence || '',
        }
      });

export const cl = COUNTRY_TAX_LAWS.find(c => c.code === r.code);

export const timer = setTimeout(() => {
      socketRef.current?.emit('check-country', { countryCode: selectedCountry })
    }, 2000);

export const amount = parseFloat(vatAmount) || 0;

export const rate = law.vat.standardRate / 100;

export const gross = amount * (1 + rate);

export const tax = gross - amount;

export const gross = parseFloat(salaryInput) || 0;

export const income = calculateIncomeTax(gross, selectedCountry);

export const employer = calculateEmployerCost(gross, selectedCountry);

export const curSym = getCurrencySymbol(law.currency);

export const code = r.code || r.countryCode;

export const name = r.name || r.countryName || code;

export const flag = r.flag || '🌐';

export const status = r.status || 'pending';

export const changes = r.changes || []

export const base = parseFloat(vatAmount) || 0;

export const rate = r.rate / 100;

export const net = vatDirection === 'gross' ? base / (1 + rate) : base;

export const tax = vatDirection === 'gross' ? base - net : net * rate;

export const gross = vatDirection === 'gross' ? base : net * (1 + rate);

export function formatNum(n: number, decimals = 0) {
  return n.toLocaleString('sr-RS', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
