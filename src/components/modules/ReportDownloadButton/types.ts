export interface ReportDownloadButtonProps {
  type: ReportType;
  data?: unknown;
  options?: Record<string, unknown>;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}
