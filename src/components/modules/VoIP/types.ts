export interface VoipCall {
  id: string
  direction: 'inbound' | 'outbound' | 'internal'
  from: string
  to: string
  duration: number
  extension: string
  status: 'answered' | 'missed' | 'voicemail'
  recording: boolean
  notes: string
  createdAt: string
}

export interface Extension {
  id: string
  number: string
  name: string
  department: string
  type: 'Desk' | 'Softphone' | 'Mobile'
  status: 'Online' | 'Busy' | 'Away' | 'Offline'
  device: string
  ipAddress: string
  provisioningStatus: string
}

export interface IvrMenu {
  id: string
  name: string
  phoneNumber: string
  language: string
  active: boolean
  entries: IvrEntry[]
}

export interface IvrEntry {
  id: string
  keyPress: string
  action: 'transfer' | 'play_message' | 'submenu' | 'voicemail'
  target: string
  label: string
}

export interface Recording {
  id: string
  date: string
  from: string
  to: string
  duration: number
  extension: string
  fileSize: number
  tag: 'important' | 'quality' | 'training' | ''
}

export interface SipTrunk {
  id: string
  provider: string
  username: string
  host: string
  port: string
  status: 'connected' | 'disconnected' | 'registering'
}

export interface CallQueue {
  id: string
  name: string
  agents: string[]
  maxWaitTime: number
  musicOnHold: boolean
}

export interface ForwardingRule {
  id: string
  type: 'unconditional' | 'busy' | 'no_answer' | 'time_based'
  target: string
  active: boolean
  schedule?: string
}

export interface DialPlan {
  id: string
  prefix: string
  description: string
  stripDigits: number
  active: boolean
}
