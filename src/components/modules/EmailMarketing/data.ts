export const getCampaignStatuses = (t: (key: string) => string): Record<string, { label: string; color: string }> => ({
  nacrt: { label: t('common.nacrt'), color: 'bg-slate-100 text-slate-700 border-slate-200' },
  poslata: { label: t('common.poslata'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  zakazana: { label: t('common.zakazana'), color: 'bg-blue-50 text-blue-700 border-blue-200' },
  u_toku: { label: t('emailMarketing.inProgress'), color: 'bg-amber-50 text-amber-700 border-amber-200' },
  zavrsena: { label: t('common.zavrsena_mail'), color: 'bg-slate-100 text-slate-600 border-slate-300' },
});

export const getSubscriberStatuses = (t: (key: string) => string): Record<string, { label: string; color: string }> => ({
  aktivan: { label: t('common.aktivan_sub'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  neaktivan: { label: t('common.neaktivan'), color: 'bg-slate-100 text-slate-600 border-slate-200' },
  otkazan: { label: t('common.otkazan'), color: 'bg-red-50 text-red-700 border-red-200' },
});

export const getTemplateCategories = (t: (key: string) => string): Record<string, string> => ({
  promotivno: t('emailMarketing.promotional'),
  transakciono: t('emailMarketing.transactional'),
  obavestenje: t('emailMarketing.notification'),
});
