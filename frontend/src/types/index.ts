// User Types
export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'candidate' | 'admin' | 'interviewer';
  phone?: string;
  resumeUrl?: string;
  appliedJobs?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Job Types
export interface Job {
  _id?: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Application Types
export interface Application {
  _id?: string;
  candidateId: string;
  jobId: string;
  status: 'applied' | 'test-assigned' | 'interview-scheduled' | 'rejected' | 'selected';
  appliedAt: Date;
  updatedAt: Date;
  candidate?: User;
  job?: Job;
}

// Question Types
export interface Question {
  _id?: string;
  type: 'mcq' | 'coding' | 'descriptive';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// Test Types
export interface Test {
  _id?: string;
  title: string;
  jobId?: string;
  questions: string[];
  duration: number;
  createdBy: string;
  createdAt: Date;
}

// Test Result Types
export interface TestResultAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
}

export interface TestResult {
  _id?: string;
  candidateId: string;
  testId: string;
  jobId: string;
  answers: TestResultAnswer[];
  totalScore: number;
  startedAt: Date;
  submittedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

// Interview Types
export interface Interview {
  _id?: string;
  candidateId: string;
  jobId: string;
  interviewerId: string;
  round: string;
  scheduledAt: Date;
  feedback?: string;
  rating?: number;
  status: 'scheduled' | 'completed' | 'missed';
  interviewer?: User;
  candidate?: User;
  job?: Job;
}

// Evaluation Types
export interface InterviewScore {
  round: string;
  score: number;
  interviewerId: string;
}

export interface Evaluation {
  _id?: string;
  candidateId: string;
  jobId: string;
  testScore?: number;
  interviewScores: InterviewScore[];
  finalDecision: 'selected' | 'rejected' | 'on-hold';
  comments?: string;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request Types for Forms
export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'candidate' | 'admin' | 'interviewer';
  phone?: string;
  resumeUrl?: string;
}

export interface CreateJobRequest {
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  createdBy?: string;
}

export interface CreateApplicationRequest {
  candidateId: string;
  jobId: string;
}

export interface CreateTestRequest {
  title: string;
  jobId?: string;
  questions: string[];
  duration: number;
  createdBy: string;
}

export interface CreateQuestionRequest {
  type: 'mcq' | 'coding' | 'descriptive';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface CreateTestResultRequest {
  candidateId: string;
  testId: string;
  jobId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export interface CreateInterviewRequest {
  candidateId: string;
  jobId: string;
  interviewerId: string;
  round: string;
  scheduledAt: Date;
}

export interface UpdateInterviewRequest {
  feedback?: string;
  rating?: number;
  status?: 'scheduled' | 'completed' | 'missed';
}

export interface CreateEvaluationRequest {
  candidateId: string;
  jobId: string;
  testScore?: number;
  interviewScores: {
    round: string;
    score: number;
    interviewerId: string;
  }[];
  finalDecision: 'selected' | 'rejected' | 'on-hold';
  comments?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  department?: string;
  location?: string;
  status?: string;
  role?: string;
}