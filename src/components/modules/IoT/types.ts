export interface IoTSensor {
  id: string
  name: string
  type: string
  location: string | null
  status: string
  lastReading: number | null
  unit: string | null
  batteryLevel: number
  signalStrength: number
  firmware: string | null
  protocol: string | null
  groupId: string | null
  partnerId: string | null
  notes: string | null
  minThreshold: number | null
  maxThreshold: number | null
  alertEnabled: boolean
  samplingRate: number
  lastAlertAt: string | null
  totalAlerts: number
  uptime: number
  createdAt: string
  updatedAt: string
  readings?: SensorReading[]
  group?: { id: string; name: string }

}
export interface SensorReading {
  id: string
  sensorId: string
  value: number
  timestamp: string
  status: string

}
export interface AlertRule {
  id: string
  name: string
  sensorType: string
  sensorId: string | null
  groupId: string | null
  condition: 'above' | 'below' | 'equals' | 'outside_range' | 'inside_range' | 'change' | 'offline'
  threshold: number | null
  thresholdMax: number | null
  duration: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  notifyEmail: boolean
  notifyPush: boolean
  notifySms: boolean
  cooldown: number
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string

}
export interface AutomationRule {
  id: string
  name: string
  description: string
  triggerType: 'sensor_value' | 'sensor_offline' | 'sensor_online' | 'schedule' | 'battery_low' | 'alert_triggered'
  triggerSensorId: string | null
  triggerCondition: string
  triggerValue: number | null
  actionType: 'notify' | 'webhook' | 'toggle_device' | 'log' | 'create_ticket' | 'update_inventory'
  actionConfig: string | null
  enabled: boolean
  lastExecutedAt: string | null
  executionCount: number
  createdAt: string

}
export interface DeviceGroup {
  id: string
  name: string
  description: string | null
  location: string | null
  icon: string
  color: string
  sensorCount: number
  createdAt: string

}
export interface IoTAlert {
  id: string
  sensorId: string
  sensorName: string
  sensorType: string
  type: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  value: number | null
  threshold: number | null
  acknowledged: boolean
  createdAt: string
}
