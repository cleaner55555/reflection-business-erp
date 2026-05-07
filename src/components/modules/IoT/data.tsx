export const SENSOR_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string; unit: string; defaultMin: number; defaultMax: number }> = {
  temperature: { label: 'Temperatura', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🌡️', unit: '°C', defaultMin: -10, defaultMax: 60 },
  humidity: { label: 'Vlažnost', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '💧', unit: '%', defaultMin: 0, defaultMax: 100 },
  motion: { label: 'Pokret', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '🏃', unit: '', defaultMin: 0, defaultMax: 1 },
  door: { label: 'Vrata', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '🚪', unit: '', defaultMin: 0, defaultMax: 1 },
  weight: { label: 'Težina', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '⚖️', unit: 'kg', defaultMin: 0, defaultMax: 5000 },
  energy: { label: 'Energija', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⚡', unit: 'kWh', defaultMin: 0, defaultMax: 1000 },
  gps: { label: 'GPS', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: '📍', unit: '', defaultMin: 0, defaultMax: 1 },
  pressure: { label: 'Pritisak', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '📊', unit: 'hPa', defaultMin: 900, defaultMax: 1100 },
  light: { label: 'Svetlo', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '💡', unit: 'lux', defaultMin: 0, defaultMax: 10000 },
  noise: { label: 'Bučka', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: '🔊', unit: 'dB', defaultMin: 0, defaultMax: 120 },
  co2: { label: 'CO₂', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🫧', unit: 'ppm', defaultMin: 0, defaultMax: 5000 },
  vibration: { label: 'Vibracije', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: '📳', unit: 'mm/s', defaultMin: 0, defaultMax: 100 },
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dotColor: 'bg-green-500' },
  offline: { label: 'Offline', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: 'bg-red-500' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotColor: 'bg-amber-500' },
  maintenance: { label: 'Održavanje', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: 'bg-blue-500' },
}

export const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const PROTOCOLS = ['MQTT', 'HTTP', 'CoAP', 'LoRaWAN', 'Zigbee', 'BLE', 'WiFi', 'Modbus', 'OPC-UA', 'BACnet']

export const LOCATIONS = ['Magacin 1', 'Magacin 2', 'Kancelarija', 'Proizvodnja', 'Glavni ulaz', 'Otprema', 'Prijem', 'Parking', 'Server soba', 'Dostavno vozilo 1', 'Dostavno vozilo 2', 'Hala A', 'Hala B']

export const SAMPLE_RATES = [
  { value: 10, label: 'Svako 10s' },
  { value: 30, label: 'Svako 30s' },
  { value: 60, label: 'Svaki minut' },
  { value: 300, label: 'Svaka 5 min' },
  { value: 600, label: 'Svaka 10 min' },
  { value: 1800, label: 'Svaka 30 min' },
  { value: 3600, label: 'Svaki sat' },
]

export const generateReadings = (sensorId: string, baseValue: number, variance: number, count: number): SensorReading[] => {
  const readings: SensorReading[] = []
  const now = Date.now()
  for (let i = count - 1; i >= 0; i--) {
    const value = baseValue + (Math.random() - 0.5) * variance * 2
    readings.push({
      id: `r-${sensorId}-${i}`,
      sensorId,
      value: Math.round(value * 100) / 100,
      timestamp: new Date(now - i * 600000).toISOString(),
      status: 'normal',
    })
  }
  return readings
}

export const DEMO_SENSORS: IoTSensor[] = [
  { id: 's1', name: 'Hladnjača A1', type: 'temperature', location: 'Magacin 1', status: 'online', lastReading: 4.2, unit: '°C', batteryLevel: 85, signalStrength: 92, firmware: 'v2.1.3', protocol: 'MQTT', groupId: 'g1', partnerId: null, notes: 'Hladnjača za namirnice - opseg 2-8°C', minThreshold: 2, maxThreshold: 8, alertEnabled: true, samplingRate: 60, lastAlertAt: null, totalAlerts: 3, uptime: 99.2, createdAt: '2024-06-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s1', 4.5, 1.5, 24) },
  { id: 's2', name: 'Senzor vlage B2', type: 'humidity', location: 'Magacin 2', status: 'online', lastReading: 65, unit: '%', batteryLevel: 92, signalStrength: 88, firmware: 'v1.8.0', protocol: 'Zigbee', groupId: 'g1', partnerId: null, notes: 'Kontrola vlage za elektroniku', minThreshold: 30, maxThreshold: 70, alertEnabled: true, samplingRate: 300, lastAlertAt: '2025-01-10T08:00:00Z', totalAlerts: 7, uptime: 98.5, createdAt: '2024-06-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s2', 62, 8, 24) },
  { id: 's3', name: 'Ulazna vrata', type: 'door', location: 'Glavni ulaz', status: 'online', lastReading: 0, unit: '', batteryLevel: 78, signalStrength: 95, firmware: 'v3.0.1', protocol: 'WiFi', groupId: 'g2', partnerId: null, notes: 'Magnetni senzor vrata', minThreshold: null, maxThreshold: null, alertEnabled: true, samplingRate: 10, lastAlertAt: null, totalAlerts: 0, uptime: 99.9, createdAt: '2024-07-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s3', 0, 0.3, 24) },
  { id: 's4', name: 'Težinska rampa', type: 'weight', location: 'Otprema', status: 'warning', lastReading: 1250, unit: 'kg', batteryLevel: 45, signalStrength: 70, firmware: 'v1.2.0', protocol: 'Modbus', groupId: 'g3', partnerId: null, notes: 'Rampa za merenje težine pošiljki. Baterija niska!', minThreshold: 0, maxThreshold: 2000, alertEnabled: true, samplingRate: 30, lastAlertAt: new Date().toISOString(), totalAlerts: 12, uptime: 95.3, createdAt: '2024-05-10T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s4', 1200, 200, 24) },
  { id: 's5', name: 'GPS Dostava V1', type: 'gps', location: 'Dostavno vozilo 1', status: 'online', batteryLevel: 100, signalStrength: 85, firmware: 'v4.0.0', protocol: 'LTE', groupId: 'g4', partnerId: null, notes: 'GPS tracker na dostavnom vozilu', minThreshold: null, maxThreshold: null, alertEnabled: true, samplingRate: 60, lastAlertAt: null, totalAlerts: 1, uptime: 99.7, createdAt: '2024-08-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s5', 1, 0.1, 24) },
  { id: 's6', name: 'Merač struje', type: 'energy', location: 'Server soba', status: 'offline', lastReading: 0, unit: 'kWh', batteryLevel: 0, signalStrength: 0, firmware: 'v2.0.5', protocol: 'Modbus', groupId: 'g5', partnerId: null, notes: 'Merenje potrošnje server sobe - NE RADI', minThreshold: 0, maxThreshold: 500, alertEnabled: true, samplingRate: 60, lastAlertAt: new Date().toISOString(), totalAlerts: 5, uptime: 87.2, createdAt: '2024-04-20T10:00:00Z', updatedAt: new Date().toISOString(), readings: [] },
  { id: 's7', name: 'CO₂ senzor', type: 'co2', location: 'Kancelarija', status: 'online', lastReading: 450, unit: 'ppm', batteryLevel: 98, signalStrength: 90, firmware: 'v1.5.0', protocol: 'WiFi', groupId: 'g2', partnerId: null, notes: 'Kvalitet vazduha u kancelariji', minThreshold: 0, maxThreshold: 1000, alertEnabled: true, samplingRate: 300, lastAlertAt: null, totalAlerts: 2, uptime: 99.8, createdAt: '2024-09-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s7', 480, 100, 24) },
  { id: 's8', name: 'LUX senzor', type: 'light', location: 'Hala A', status: 'online', lastReading: 350, unit: 'lux', batteryLevel: 70, signalStrength: 82, firmware: 'v1.0.0', protocol: 'Zigbee', groupId: 'g6', partnerId: null, notes: 'Automatsko upravljanje osvetljenjem', minThreshold: 100, maxThreshold: 800, alertEnabled: false, samplingRate: 600, lastAlertAt: null, totalAlerts: 0, uptime: 99.5, createdAt: '2024-10-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s8', 380, 120, 24) },
  { id: 's9', name: 'Senzor buke', type: 'noise', location: 'Proizvodnja', status: 'online', lastReading: 72, unit: 'dB', batteryLevel: 88, signalStrength: 75, firmware: 'v1.3.0', protocol: 'WiFi', groupId: 'g6', partnerId: null, notes: 'Praćenje nivoa buke za zaštitu na radu', minThreshold: 0, maxThreshold: 85, alertEnabled: true, samplingRate: 60, lastAlertAt: '2025-01-15T14:00:00Z', totalAlerts: 4, uptime: 97.8, createdAt: '2024-07-15T10:00:00Z', updatedAt: new Date().toISOString(), readings: generateReadings('s9', 70, 15, 24) },
  { id: 's10', name: 'Vibracioni senzor', type: 'vibration', location: 'Hala B', status: 'maintenance', lastReading: 0, unit: 'mm/s', batteryLevel: 60, signalStrength: 80, firmware: 'v2.2.0', protocol: 'LoRaWAN', groupId: 'g6', partnerId: null, notes: 'Na kalibraciji - povratak 2025-02-01', minThreshold: 0, maxThreshold: 50, alertEnabled: false, samplingRate: 300, lastAlertAt: null, totalAlerts: 1, uptime: 96.0, createdAt: '2024-11-01T10:00:00Z', updatedAt: new Date().toISOString(), readings: [] },
]

export const DEMO_GROUPS: DeviceGroup[] = [
  { id: 'g1', name: 'Magacini', description: 'Senzori u magacinskim prostorijama', location: 'Magacin', icon: 'Warehouse', color: '#10b981', sensorCount: 2, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g2', name: 'Sigurnost', description: 'Senzori za bezbednost objekta', location: 'Ceo objekat', icon: 'Shield', color: '#ef4444', sensorCount: 2, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g3', name: 'Logistika', description: 'Senzori za logistiku i otpremu', location: 'Otprema', icon: 'Truck', color: '#f59e0b', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g4', name: 'Vozila', description: 'GPS i senzori na vozilima', location: 'Van objekta', icon: 'Truck', color: '#3b82f6', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g5', name: 'Infrastruktura', description: 'Merenje potrošnje i infrastrukture', location: 'Server soba', icon: 'Server', color: '#8b5cf6', sensorCount: 1, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'g6', name: 'Proizvodnja', description: 'Senzori u proizvodnim halama', location: 'Hala A/B', icon: 'Factory', color: '#f97316', sensorCount: 3, createdAt: '2024-01-01T10:00:00Z' },
]

export const DEMO_ALERT_RULES: AlertRule[] = [
  { id: 'ar1', name: 'Temperatura hladnjače', sensorType: 'temperature', sensorId: 's1', groupId: null, condition: 'outside_range', threshold: 2, thresholdMax: 8, duration: 300, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: false, cooldown: 600, lastTriggeredAt: '2025-01-05T03:00:00Z', triggerCount: 3, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar2', name: 'Visoka vlaga', sensorType: 'humidity', sensorId: 's2', groupId: null, condition: 'above', threshold: 70, thresholdMax: null, duration: 600, severity: 'warning', enabled: true, notifyEmail: true, notifyPush: false, notifySms: false, cooldown: 1800, lastTriggeredAt: '2025-01-10T08:00:00Z', triggerCount: 7, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar3', name: 'Niska baterija senzora', sensorType: 'temperature', sensorId: null, groupId: null, condition: 'battery_low', threshold: 20, thresholdMax: null, duration: 0, severity: 'warning', enabled: true, notifyEmail: true, notifyPush: true, notifySms: false, cooldown: 86400, lastTriggeredAt: null, triggerCount: 0, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar4', name: 'Senzor offline', sensorType: 'temperature', sensorId: null, groupId: null, condition: 'offline', threshold: null, thresholdMax: null, duration: 300, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: true, cooldown: 3600, lastTriggeredAt: new Date().toISOString(), triggerCount: 5, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ar5', name: 'Preopterećenje struje', sensorType: 'energy', sensorId: 's6', groupId: null, condition: 'above', threshold: 400, thresholdMax: null, duration: 60, severity: 'critical', enabled: true, notifyEmail: true, notifyPush: true, notifySms: true, cooldown: 300, lastTriggeredAt: null, triggerCount: 0, createdAt: '2024-04-20T10:00:00Z' },
]

export const DEMO_AUTOMATION_RULES: AutomationRule[] = [
  { id: 'au1', name: 'Alert na visoku temperaturu', description: 'Kada temperatura hladnjače pređe 8°C, šalji notifikaciju', triggerType: 'sensor_value', triggerSensorId: 's1', triggerCondition: 'above', triggerValue: 8, actionType: 'notify', actionConfig: '{"channel":"email","recipients":["admin@company.rs"]}', enabled: true, lastExecutedAt: '2025-01-05T03:00:00Z', executionCount: 3, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'au2', name: 'Kreiraj ticket za offline senzor', description: 'Kada senzor bude offline >5 min, kreiraj podršku ticket', triggerType: 'sensor_offline', triggerSensorId: null, triggerCondition: 'duration_exceeds', triggerValue: 300, actionType: 'create_ticket', actionConfig: '{"category":"hardware","priority":"high"}', enabled: true, lastExecutedAt: new Date().toISOString(), executionCount: 2, createdAt: '2024-07-01T10:00:00Z' },
  { id: 'au3', name: 'Loguj CO₂ vrednosti', description: 'Loguj svaku CO₂ meru za izveštaj o kvalitetu vazduha', triggerType: 'sensor_value', triggerSensorId: 's7', triggerCondition: 'always', triggerValue: null, actionType: 'log', actionConfig: null, enabled: true, lastExecutedAt: new Date().toISOString(), executionCount: 156, createdAt: '2024-09-01T10:00:00Z' },
  { id: 'au4', name: 'Webhook na pokret', description: 'Šalji webhook na eksterni sistem kada je pokret detektovan', triggerType: 'sensor_value', triggerSensorId: 's3', triggerCondition: 'equals', triggerValue: 1, actionType: 'webhook', actionConfig: '{"url":"https://hooks.example.com/motion","method":"POST"
}', enabled: false, lastExecutedAt: null, executionCount: 0, createdAt: '2024-10-01T10:00:00Z' },
]

export const DEMO_ALERTS: IoTAlert[] = [
  { id: 'a1', sensorId: 's6', sensorName: 'Merač struje', sensorType: 'energy', type: 'offline', message: 'Senzor je offline već 2 sata', severity: 'critical', value: null, threshold: null, acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a2', sensorId: 's4', sensorName: 'Težinska rampa', sensorType: 'weight', type: 'battery_low', message: 'Baterija je na 45% - potrebna zamena', severity: 'warning', value: 45, threshold: 20, acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a3', sensorId: 's1', sensorName: 'Hladnjača A1', sensorType: 'temperature', type: 'threshold', message: 'Temperatura 5.8°C je blizu gornjeg praga (8°C)', severity: 'info', value: 5.8, threshold: 8, acknowledged: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a4', sensorId: 's9', sensorName: 'Senzor buke', sensorType: 'noise', type: 'threshold', message: 'Nivo buke 82dB premaši limit za radno mesto', severity: 'warning', value: 82, threshold: 85, acknowledged: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'a5', sensorId: 's2', sensorName: 'Senzor vlage B2', sensorType: 'humidity', type: 'threshold', message: 'Vlažnost 72% premašuje gornji prag (70%)', severity: 'warning', value: 72, threshold: 70, acknowledged: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
]

export const getBatteryIcon = (level: number) => {
  if (level > 80) return <BatteryFull className="h-4 w-4 text-green-500" />
  if (level > 50) return <Battery className="h-4 w-4 text-green-500" />
  if (level > 20) return <BatteryWarning className="h-4 w-4 text-amber-500" />
  return <BatteryWarning className="h-4 w-4 text-red-500" />
}

export const getBatteryColor = (level: number) => {
  if (level > 80) return 'bg-green-500'
  if (level > 50) return 'bg-green-400'
  if (level > 20) return 'bg-amber-500'
  return 'bg-red-500'
}

export const getSignalBars = (strength: number) => {
  const bars = Math.ceil(strength / 25)
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`w-1 rounded-sm ${i <= bars ? (strength > 60 ? 'bg-green-500' : strength > 30 ? 'bg-amber-500' : 'bg-red-500') : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${i * 25}%` }} />
      ))}
    </div>
  )
}

export const formatUptime = (uptime: number) => `${uptime.toFixed(1)}%`;

export const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const { activeCompanyId } = useAppStore();
