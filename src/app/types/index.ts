export interface Task {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'scheduled' | 'completed';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserInput {
  text: string;
}

export interface ProcessedTask {
  task: Task;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions?: string[];
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  suggestedActions?: {
    type: 'schedule' | 'modify' | 'info';
    description: string;
  }[];
  functionCall?: FunctionCall;
}

export type ProcessedResponse = ProcessedTask | ChatResponse;