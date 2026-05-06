export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  type: "indoor" | "outdoor" | "parking";
  status: "online" | "offline" | "recording";
  resolution: string;
  ipAddress: string | null;
  protocol: string;
  port: number | null;
  sensitivity: number;
  nightVision: boolean;
  audioEnabled: boolean;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  recordingMode: "continuous" | "motion" | "scheduled";
  retentionDays: number;
  storageUsed: number;
  totalStorage: number;
  lastMotionAt: string | null;
  lastRecordingAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recording {
  id: string;
  cameraId: string;
  cameraName: string;
  startDate: string;
  endDate: string;
  duration: number;
  type: "motion" | "manual" | "scheduled" | "continuous";
  fileSize: number;
  status: "recording" | "completed" | "archived" | "deleted";
  resolution: string;
  hasMotion: boolean;
  notes: string | null;
  thumbnailUrl: string | null;
}

export interface CameraAlert {
  id: string;
  cameraId: string;
  cameraName: string;
  type:
    | "motion_detected"
    | "camera_offline"
    | "storage_full"
    | "connection_lost";
  severity: "info" | "warning" | "critical";
  message: string;
  acknowledged: boolean;
  createdAt: string;
  thumbnailUrl: string | null;
}
