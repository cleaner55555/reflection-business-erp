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
}
