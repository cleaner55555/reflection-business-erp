export const m = Math.floor(seconds / 60);

export const s = seconds % 60;

export const directionConfig: Record<string, { labelKey: string; color: string }> = {
  inbound: { labelKey: 'voip.direction.inbound', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  outbound: { labelKey: 'voip.direction.outbound', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  internal: { labelKey: 'voip.direction.internal', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
}

export const callStatusConfig: Record<string, { labelKey: string; color: string }> = {
  answered: { labelKey: 'voip.status.answered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  missed: { labelKey: 'voip.status.missed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  voicemail: { labelKey: 'voip.status.voicemail', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export const extStatusConfig: Record<string, { color: string; dotColor: string }> = {
  Online: { color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  Busy: { color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
  Away: { color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  Offline: { color: 'bg-gray-100 text-gray-500', dotColor: 'bg-gray-400' },
}

export const PIE_COLORS = ['#22c55e', '#0ea5e9', '#8b5cf6']

export const TAG_COLORS: Record<string, string> = {
  important: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  quality: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  training: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

export const MOCK_CALLS: VoipCall[] = [
  { id: 'c1', direction: 'inbound', from: '+381601234567', to: '101', duration: 245, extension: '101', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T08:30:00' },
  { id: 'c2', direction: 'outbound', from: '102', to: '+381639876543', duration: 180, extension: '102', status: 'answered', recording: true, notes: 'Follow-up call', createdAt: '2025-01-15T09:15:00' },
  { id: 'c3', direction: 'inbound', from: '+381112345678', to: '103', duration: 0, extension: '103', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T09:45:00' },
  { id: 'c4', direction: 'internal', from: '101', to: '105', duration: 95, extension: '101', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T10:00:00' },
  { id: 'c5', direction: 'inbound', from: '+381609876543', to: '101', duration: 0, extension: '101', status: 'voicemail', recording: true, notes: '', createdAt: '2025-01-15T10:30:00' },
  { id: 'c6', direction: 'outbound', from: '103', to: '+381631112233', duration: 320, extension: '103', status: 'answered', recording: true, notes: 'Contract discussion', createdAt: '2025-01-15T11:00:00' },
  { id: 'c7', direction: 'inbound', from: '+381601112233', to: '104', duration: 150, extension: '104', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T11:45:00' },
  { id: 'c8', direction: 'inbound', from: '+381115556666', to: '102', duration: 0, extension: '102', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T12:30:00' },
  { id: 'c9', direction: 'outbound', from: '105', to: '+381647778899', duration: 410, extension: '105', status: 'answered', recording: true, notes: 'Technical support', createdAt: '2025-01-15T13:00:00' },
  { id: 'c10', direction: 'internal', from: '102', to: '106', duration: 60, extension: '102', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T13:30:00' },
  { id: 'c11', direction: 'inbound', from: '+381602223344', to: '107', duration: 200, extension: '107', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T14:15:00' },
  { id: 'c12', direction: 'outbound', from: '101', to: '+381636667778', duration: 0, extension: '101', status: 'missed', recording: false, notes: '', createdAt: '2025-01-15T15:00:00' },
  { id: 'c13', direction: 'inbound', from: '+381114445555', to: '108', duration: 175, extension: '108', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T15:30:00' },
  { id: 'c14', direction: 'internal', from: '103', to: '104', duration: 45, extension: '103', status: 'answered', recording: false, notes: '', createdAt: '2025-01-15T16:00:00' },
  { id: 'c15', direction: 'inbound', from: '+381608889900', to: '101', duration: 290, extension: '101', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T16:45:00' },
  { id: 'c16', direction: 'outbound', from: '106', to: '+381621234567', duration: 135, extension: '106', status: 'answered', recording: true, notes: '', createdAt: '2025-01-15T17:00:00' },
  { id: 'c17', direction: 'inbound', from: '+381119990000', to: '102', duration: 0, extension: '102', status: 'voicemail', recording: true, notes: '', createdAt: '2025-01-15T17:30:00' },
]

export const MOCK_EXTENSIONS: Extension[] = [
  { id: 'e1', number: '101', name: 'Marko Petrović', department: 'Prodaja', type: 'Desk', status: 'Online', device: 'Yealink T46S', ipAddress: '192.168.1.101', provisioningStatus: 'active' },
  { id: 'e2', number: '102', name: 'Ana Jovanović', department: 'Podrška', type: 'Desk', status: 'Busy', device: 'Yealink T42G', ipAddress: '192.168.1.102', provisioningStatus: 'active' },
  { id: 'e3', number: '103', name: 'Jelena Stanković', department: 'Prodaja', type: 'Softphone', status: 'Online', device: 'MicroSIP', ipAddress: '192.168.1.55', provisioningStatus: 'active' },
  { id: 'e4', number: '104', name: 'Nikola Đorđević', department: 'IT', type: 'Desk', status: 'Away', device: 'Cisco 8845', ipAddress: '192.168.1.104', provisioningStatus: 'active' },
  { id: 'e5', number: '105', name: 'Marija Ilić', department: 'Računovodstvo', type: 'Desk', status: 'Online', device: 'Yealink T46S', ipAddress: '192.168.1.105', provisioningStatus: 'active' },
  { id: 'e6', number: '106', name: 'Stefan Nikolić', department: 'IT', type: 'Mobile', status: 'Offline', device: 'Zoiper', ipAddress: '-', provisioningStatus: 'pending' },
  { id: 'e7', number: '107', name: 'Ivana Milić', department: 'Podrška', type: 'Softphone', status: 'Online', device: 'MicroSIP', ipAddress: '192.168.1.57', provisioningStatus: 'active' },
  { id: 'e8', number: '108', name: 'Dejan Tanasković', department: 'Menadžment', type: 'Desk', status: 'Offline', device: 'Polycom VVX 601', ipAddress: '-', provisioningStatus: 'inactive' },
]

export const MOCK_IVR_MENUS: IvrMenu[] = [
  {
    id: 'ivr1', name: 'Glavni IVR', phoneNumber: '+381112345678', language: 'sr', active: true,
    entries: [
      { id: 'iv1', keyPress: '1', action: 'transfer', target: '101', label: 'Prodaja' },
      { id: 'iv2', keyPress: '2', action: 'transfer', target: '102', label: 'Podrška' },
      { id: 'iv3', keyPress: '3', action: 'submenu', target: 'ivr2', label: 'IT podrška' },
      { id: 'iv4', keyPress: '0', action: 'voicemail', target: '100', label: 'Govorna pošta' },
    ],
  },
  {
    id: 'ivr2', name: 'IT Podrška', phoneNumber: '+381112345679', language: 'sr', active: true,
    entries: [
      { id: 'iv5', keyPress: '1', action: 'transfer', target: '104', label: 'Helpdesk' },
      { id: 'iv6', keyPress: '2', action: 'play_message', target: 'it-info.wav', label: 'Informacije' },
    ],
  },
  {
    id: 'ivr3', name: 'Nakradno pozdrav', phoneNumber: '+381112345680', language: 'en', active: false,
    entries: [
      { id: 'iv7', keyPress: '1', action: 'transfer', target: '108', label: 'Direktor' },
      { id: 'iv8', keyPress: '2', action: 'voicemail', target: '100', label: 'Govorna pošta' },
    ],
  },
]

export const MOCK_RECORDINGS: Recording[] = [
  { id: 'r1', date: '2025-01-15T08:30:00', from: '+381601234567', to: '101', duration: 245, extension: '101', fileSize: 1200, tag: 'important' },
  { id: 'r2', date: '2025-01-15T09:15:00', from: '102', to: '+381639876543', duration: 180, extension: '102', fileSize: 890, tag: '' },
  { id: 'r3', date: '2025-01-15T10:30:00', from: '+381609876543', to: '101', duration: 15, extension: '101', fileSize: 75, tag: '' },
  { id: 'r4', date: '2025-01-15T11:00:00', from: '103', to: '+381631112233', duration: 320, extension: '103', fileSize: 1580, tag: 'training' },
  { id: 'r5', date: '2025-01-15T11:45:00', from: '+381601112233', to: '104', duration: 150, extension: '104', fileSize: 740, tag: 'quality' },
  { id: 'r6', date: '2025-01-15T13:00:00', from: '105', to: '+381647778899', duration: 410, extension: '105', fileSize: 2020, tag: 'important' },
  { id: 'r7', date: '2025-01-15T14:15:00', from: '+381602223344', to: '107', duration: 200, extension: '107', fileSize: 980, tag: '' },
  { id: 'r8', date: '2025-01-15T15:30:00', from: '+381114445555', to: '108', duration: 175, extension: '108', fileSize: 860, tag: 'quality' },
  { id: 'r9', date: '2025-01-15T16:45:00', from: '+381608889900', to: '101', duration: 290, extension: '101', fileSize: 1430, tag: '' },
  { id: 'r10', date: '2025-01-15T17:00:00', from: '106', to: '+381621234567', duration: 135, extension: '106', fileSize: 665, tag: 'training' },
]

export const HOURLY_DATA = Array.from({ length: 12 }, (_, i) => {
  const hour = 7 + i
  return {
    hour: `${hour}:00`,
    inbound: Math.floor(Math.random() * 12) + 3,
    outbound: Math.floor(Math.random() * 8) + 1,
    missed: Math.floor(Math.random() * 4),
  }
});

export const MOCK_SIP_TRUNKS: SipTrunk[] = [
  { id: 'sip1', provider: 'Orion Telekom', username: 'reflection-main', host: 'sip.orion.rs', port: '5060', status: 'connected' },
  { id: 'sip2', provider: 'MTS Business', username: 'reflection-mts', host: 'sip.mts.rs', port: '5061', status: 'disconnected' },
]

export const MOCK_QUEUES: CallQueue[] = [
  { id: 'q1', name: 'Podrška', agents: ['102', '107', '103'], maxWaitTime: 120, musicOnHold: true },
  { id: 'q2', name: 'Prodaja', agents: ['101', '103'], maxWaitTime: 90, musicOnHold: true },
]

export const MOCK_FORWARDING: ForwardingRule[] = [
  { id: 'f1', type: 'busy', target: '107', active: true },
  { id: 'f2', type: 'no_answer', target: '102', active: true, schedule: '15s' },
  { id: 'f3', type: 'time_based', target: '+381601234567', active: false, schedule: '18:00-08:00' },
]

export const MOCK_DIAL_PLANS: DialPlan[] = [
  { id: 'd1', prefix: '0', description: 'Lokalni pozivi', stripDigits: 1, active: true },
  { id: 'd2', prefix: '00', description: 'Međunarodni pozivi', stripDigits: 2, active: true },
  { id: 'd3', prefix: '112', description: 'Hitne službe', stripDigits: 0, active: true },
  { id: 'd4', prefix: '06', description: 'Mobilni', stripDigits: 0, active: true },
]

export const { activeCompanyId } = useAppStore();
