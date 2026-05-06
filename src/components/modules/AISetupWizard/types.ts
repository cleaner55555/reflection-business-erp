export interface AIResult {
  modules: string[]
  industry: string
  explanation: string
}

export interface StepIndicatorProps {
  step: number
}

export interface DescribeStepProps {
  description: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  error: string
  onDescriptionChange: (v: string) => void
  onAnalyze: () => void
}

export interface ConfirmStepProps {
  aiResult: AIResult | null
  selectedModules: Set<string>
  onToggleModule: (id: string) => void
  onToggleGroup: (groupModules: { id: string }[]) => void
  onSetSelectedModules: (s: Set<string>) => void
  onBack: () => void
  onConfirm: () => void
}
