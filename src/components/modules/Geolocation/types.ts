export interface TrackedEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
  phone: string;
  isTracked: boolean;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastLocationName: string | null;
  lastLocationAt: string | null;
  batteryLevel: number;
  speed: number | null;
  isOnline: boolean;
  distanceToday: number;
  notes: string | null;
  createdAt: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: "circle" | "polygon";
  latitude: number;
  longitude: number;
  radius: number | null;
  color: string;
  status: "active" | "inactive";
  assignedEmployees: string[];
  notifyEnter: boolean;
  notifyExit: boolean;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LocationEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  eventType:
    | "check_in"
    | "check_out"
    | "geofence_enter"
    | "geofence_exit"
    | "idle"
    | "speeding"
    | "offline";
  latitude: number;
  longitude: number;
  locationName: string | null;
  address: string | null;
  timestamp: string;
  batteryLevel: number;
  speed: number | null;
  notes: string | null;
}

export interface LocationAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  type:
    | "geofence_exit"
    | "geofence_enter"
    | "speeding"
    | "idle"
    | "low_battery"
    | "offline";
  severity: "info" | "warning" | "critical";
  message: string;
  acknowledged: boolean;
  createdAt: string;
}
