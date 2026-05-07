import { BatteryFull, Battery, BatteryWarning, CheckCircle2, Clock, MapPin, AlertTriangle, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
// eslint-disable-next-line react-hooks/rules-of-hooks
export const { activeCompanyId } = useAppStore()

export const MOCK_EMPLOYEES: TrackedEmployee[] = [
  { id: 'e1', name: 'Marko Petrović', department: 'Dostava', position: 'Vozač dostave', phone: '+381631234567', isTracked: true, lastLatitude: 44.8176, lastLongitude: 20.4633, lastLocationName: 'Terazije, Beograd', lastLocationAt: new Date(Date.now() - 300000).toISOString(), batteryLevel: 82, speed: 35, isOnline: true, distanceToday: 47.2, notes: null, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'e2', name: 'Ana Jovanović', department: 'Prodaja', position: 'Terenski predstavnik', phone: '+381642345678', isTracked: true, lastLatitude: 44.7866, lastLongitude: 20.4489, lastLocationName: 'Novi Beograd', lastLocationAt: new Date(Date.now() - 600000).toISOString(), batteryLevel: 65, speed: 0, isOnline: true, distanceToday: 23.8, notes: null, createdAt: '2024-02-01T10:00:00Z' },
  { id: 'e3', name: 'Nikola Stanković', department: 'Servis', position: 'Tehničar', phone: '+381653456789', isTracked: true, lastLatitude: 44.8023, lastLongitude: 20.4655, lastLocationName: 'Dorćol, Beograd', lastLocationAt: new Date(Date.now() - 120000).toISOString(), batteryLevel: 91, speed: 42, isOnline: true, distanceToday: 68.5, notes: null, createdAt: '2024-03-10T10:00:00Z' },
  { id: 'e4', name: 'Jelena Milić', department: 'Logistika', position: 'Koordinator logistike', phone: '+381664567890', isTracked: true, lastLatitude: 44.8100, lastLongitude: 20.4700, lastLocationName: 'Vračar, Beograd', lastLocationAt: new Date(Date.now() - 900000).toISOString(), batteryLevel: 28, speed: 0, isOnline: true, distanceToday: 12.3, notes: 'Baterija niska - potrebno punjenje', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'e5', name: 'Stefan Nikolić', department: 'Instalacije', position: 'Električar', phone: '+381615678901', isTracked: false, lastLatitude: null, lastLongitude: null, lastLocationName: null, lastLocationAt: null, batteryLevel: 0, speed: null, isOnline: false, distanceToday: 0, notes: 'Praćenje deaktivirano po zahtevu', createdAt: '2024-04-05T10:00:00Z' },
  { id: 'e6', name: 'Ivana Đorđević', department: 'Dostava', position: 'Vozač dostave', phone: '+381626789012', isTracked: true, lastLatitude: 44.7900, lastLongitude: 20.4400, lastLocationName: 'Zemun, Beograd', lastLocationAt: new Date(Date.now() - 480000).toISOString(), batteryLevel: 54, speed: 28, isOnline: true, distanceToday: 55.1, notes: null, createdAt: '2024-02-15T10:00:00Z' },
  { id: 'e7', name: 'Dragan Simić', department: 'Servis', position: 'Serviser', phone: '+381637890123', isTracked: true, lastLatitude: 44.8250, lastLongitude: 20.4800, lastLocationName: 'Palilula, Beograd', lastLocationAt: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 15, speed: null, isOnline: false, distanceToday: 31.4, notes: 'Offline od 2 sata', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'e8', name: 'Maja Popović', department: 'Prodaja', position: 'Komercijalista', phone: '+381648901234', isTracked: true, lastLatitude: 44.8150, lastLongitude: 20.4550, lastLocationName: 'Centar, Beograd', lastLocationAt: new Date(Date.now() - 180000).toISOString(), batteryLevel: 73, speed: 15, isOnline: true, distanceToday: 19.7, notes: null, createdAt: '2024-05-01T10:00:00Z' },
]

export const MOCK_GEOFENCES: Geofence[] = [
  { id: 'gf1', name: 'Sedište firme', type: 'circle', latitude: 44.8176, longitude: 20.4633, radius: 200, color: '#3b82f6', status: 'active', assignedEmployees: ['e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8'], notifyEnter: false, notifyExit: true, scheduleStart: '08:00', scheduleEnd: '17:00', notes: 'Glavna zgrada', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'gf2', name: 'Magacin Zemun', type: 'circle', latitude: 44.8440, longitude: 20.4010, radius: 300, color: '#10b981', status: 'active', assignedEmployees: ['e1', 'e6'], notifyEnter: true, notifyExit: false, scheduleStart: null, scheduleEnd: null, notes: 'Skladište robe', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'gf3', name: 'Zona A dostava', type: 'polygon', latitude: 44.7900, longitude: 20.4500, radius: null, color: '#f59e0b', status: 'active', assignedEmployees: ['e1', 'e6'], notifyEnter: false, notifyExit: true, scheduleStart: '07:00', scheduleEnd: '20:00', notes: 'Zone centralnog Beograda za dostavu', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'gf4', name: 'Klijent Delta', type: 'circle', latitude: 44.8121, longitude: 20.4700, radius: 100, color: '#8b5cf6', status: 'active', assignedEmployees: ['e3', 'e7'], notifyEnter: true, notifyExit: true, scheduleStart: '09:00', scheduleEnd: '16:00', notes: 'Lokacija klijenta za servis', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'gf5', name: 'Zona B dostava', type: 'polygon', latitude: 44.8300, longitude: 20.4900, radius: null, color: '#ef4444', status: 'inactive', assignedEmployees: ['e1'], notifyEnter: false, notifyExit: true, scheduleStart: null, scheduleEnd: null, notes: 'Privremeno neaktivna zona', createdAt: '2024-05-01T10:00:00Z' },
  { id: 'gf6', name: 'Parking firme', type: 'circle', latitude: 44.8180, longitude: 20.4640, radius: 80, color: '#06b6d4', status: 'active', assignedEmployees: ['e1', 'e2', 'e3', 'e6', 'e8'], notifyEnter: true, notifyExit: true, scheduleStart: '06:00', scheduleEnd: '22:00', notes: 'Firmeni parking', createdAt: '2024-01-15T10:00:00Z' },
]

export const MOCK_EVENTS: LocationEvent[] = [
  { id: 'ev1', employeeId: 'e1', employeeName: 'Marko Petrović', eventType: 'check_in', latitude: 44.8176, longitude: 20.4633, locationName: 'Sedište firme', address: 'Terazije 1, Beograd', timestamp: new Date(Date.now() - 28800000).toISOString(), batteryLevel: 95, speed: 0, notes: null },
  { id: 'ev2', employeeId: 'e1', employeeName: 'Marko Petrović', eventType: 'geofence_exit', latitude: 44.8178, longitude: 20.4635, locationName: 'Sedište firme', address: 'Terazije, Beograd', timestamp: new Date(Date.now() - 25200000).toISOString(), batteryLevel: 93, speed: 15, notes: 'Izlazak na dostavu' },
  { id: 'ev3', employeeId: 'e3', employeeName: 'Nikola Stanković', eventType: 'geofence_enter', latitude: 44.8121, longitude: 20.4700, locationName: 'Klijent Delta', address: 'Delta City, Beograd', timestamp: new Date(Date.now() - 18000000).toISOString(), batteryLevel: 88, speed: 5, notes: null },
  { id: 'ev4', employeeId: 'e6', employeeName: 'Ivana Đorđević', eventType: 'check_out', latitude: 44.8440, longitude: 20.4010, locationName: 'Magacin Zemun', address: 'Zemun, Beograd', timestamp: new Date(Date.now() - 14400000).toISOString(), batteryLevel: 60, speed: 0, notes: 'Završena preuzimanja' },
  { id: 'ev5', employeeId: 'e7', employeeName: 'Dragan Simić', eventType: 'offline', latitude: 44.8250, longitude: 20.4800, locationName: 'Palilula, Beograd', address: 'Palilula, Beograd', timestamp: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 15, speed: null, notes: 'Gubitak signala' },
  { id: 'ev6', employeeId: 'e2', employeeName: 'Ana Jovanović', eventType: 'check_in', latitude: 44.7866, longitude: 20.4489, locationName: 'Novi Beograd', address: 'Bulevar Mihajla Pupina, Beograd', timestamp: new Date(Date.now() - 7200000).toISOString(), batteryLevel: 70, speed: 0, notes: 'Početak posete klijentu' },
  { id: 'ev7', employeeId: 'e4', employeeName: 'Jelena Milić', eventType: 'idle', latitude: 44.8100, longitude: 20.4700, locationName: 'Vračar, Beograd', address: 'Vračar, Beograd', timestamp: new Date(Date.now() - 3600000).toISOString(), batteryLevel: 28, speed: 0, notes: 'Neaktivnost >30 min' },
  { id: 'ev8', employeeId: 'e8', employeeName: 'Maja Popović', eventType: 'speeding', latitude: 44.8150, longitude: 20.4550, locationName: 'Centar, Beograd', address: 'Knez Mihailova, Beograd', timestamp: new Date(Date.now() - 5400000).toISOString(), batteryLevel: 76, speed: 72, notes: 'Prekoračenje brzine' },
]

export const MOCK_ALERTS: LocationAlert[] = [
  { id: 'la1', employeeId: 'e7', employeeName: 'Dragan Simić', type: 'offline', severity: 'critical', message: 'Dragan Simić je offline već 2 sata', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'la2', employeeId: 'e4', employeeName: 'Jelena Milić', type: 'low_battery', severity: 'warning', message: 'Jelena Milić - baterija na 28%', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'la3', employeeId: 'e8', employeeName: 'Maja Popović', type: 'speeding', severity: 'warning', message: 'Maja Popović - brzina 72 km/h u zoni 50 km/h', acknowledged: true, createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: 'la4', employeeId: 'e1', employeeName: 'Marko Petrović', type: 'geofence_exit', severity: 'info', message: 'Marko Petrović je napustio geo-ograničenje Sedište firme', acknowledged: true, createdAt: new Date(Date.now() - 25200000).toISOString() },
  { id: 'la5', employeeId: 'e4', employeeName: 'Jelena Milić', type: 'idle', severity: 'info', message: 'Jelena Milić je neaktivna više od 30 minuta', acknowledged: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'la6', employeeId: 'e7', employeeName: 'Dragan Simić', type: 'low_battery', severity: 'critical', message: 'Dragan Simić - baterija na 15%, kritično niska', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
]

export const getBatteryIcon = (level: number) => {
  if (level > 80) return <BatteryFull className="h-4 w-4 text-green-500" />
  if (level > 30) return <Battery className="h-4 w-4 text-green-500" />
  if (level > 15) return <BatteryWarning className="h-4 w-4 text-amber-500" />
  return <BatteryWarning className="h-4 w-4 text-red-500" />
}

export const getBatteryColor = (level: number) => {
  if (level > 80) return 'bg-green-500'
  if (level > 30) return 'bg-yellow-500'
  if (level > 15) return 'bg-amber-500'
  return 'bg-red-500'
}

export const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  check_in: { label: 'Dolazak', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  check_out: { label: 'Odlazak', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  geofence_enter: { label: 'Ulazak u zonu', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: MapPin },
  geofence_exit: { label: 'Izlazak iz zone', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: MapPin },
  idle: { label: 'Neaktivnost', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: Clock },
  speeding: { label: 'Prekoračenje brzine', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Bell },
}

export const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  geofence_exit: { label: 'Izlazak iz zone', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  geofence_enter: { label: 'Ulazak u zonu', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  speeding: { label: 'Prebrza vožnja', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  idle: { label: 'Neaktivnost', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  low_battery: { label: 'Niska baterija', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  offline: { label: 'Offline', color: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

export const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: 'Informacija', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  warning: { label: 'Upozorenje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

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

export const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

export const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Upravo sada'
  if (mins < 60) return `Pre ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Pre ${hours} h`
  return `Pre ${Math.floor(hours / 24)} d`
}

// useAppStore already called at top of file
