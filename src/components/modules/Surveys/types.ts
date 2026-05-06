export interface Survey {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  responseCount: number;
  status: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options?: string[];
}
