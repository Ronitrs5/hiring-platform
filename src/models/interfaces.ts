import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'candidate' | 'admin' | 'interviewer';
  phone?: string;
  resumeUrl?: string;
  appliedJobs?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IJob {
  _id?: ObjectId;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplication {
  _id?: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  status: 'applied' | 'test-assigned' | 'interview-scheduled' | 'rejected' | 'selected';
  appliedAt: Date;
  updatedAt: Date;
}

export interface ITest {
  _id?: ObjectId;
  title: string;
  jobId?: ObjectId;
  questions: ObjectId[];
  duration: number; // in minutes
  createdBy: ObjectId;
  createdAt: Date;
}

export interface IQuestion {
  _id?: ObjectId;
  type: 'mcq' | 'coding' | 'descriptive';
  questionText: string;
  options?: string[]; // optional for MCQ
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface ITestResultAnswer {
  questionId: ObjectId;
  answer: string;
  isCorrect: boolean;
  score: number;
}

export interface ITestResult {
  _id?: ObjectId;
  candidateId: ObjectId;
  testId: ObjectId;
  jobId: ObjectId;
  answers: ITestResultAnswer[];
  totalScore: number;
  startedAt: Date;
  submittedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface IInterview {
  _id?: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  interviewerId: ObjectId;
  round: string;
  scheduledAt: Date;
  feedback?: string;
  rating?: number; // 1-5 scale
  status: 'scheduled' | 'completed' | 'missed';
}

export interface IInterviewScore {
  round: string;
  score: number;
  interviewerId: ObjectId;
}

export interface IEvaluation {
  _id?: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  testScore?: number;
  interviewScores: IInterviewScore[];
  finalDecision: 'selected' | 'rejected' | 'on-hold';
  comments?: string;
  updatedAt: Date;
}

// Request/Response DTOs
export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'candidate' | 'admin';
  phone?: string;
  resumeUrl?: string;
}

export interface CreateJobRequest {
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  createdBy: string; // ObjectId as string
}

export interface CreateApplicationRequest {
  candidateId: string; // ObjectId as string
  jobId: string; // ObjectId as string
}

export interface CreateTestRequest {
  title: string;
  jobId?: string; // ObjectId as string
  questions: string[]; // ObjectId array as strings
  duration: number;
  createdBy: string; // ObjectId as string
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
  candidateId: string; // ObjectId as string
  testId: string; // ObjectId as string
  jobId: string; // ObjectId as string
  answers: {
    questionId: string; // ObjectId as string
    answer: string;
  }[];
}

export interface CreateInterviewRequest {
  candidateId: string; // ObjectId as string
  jobId: string; // ObjectId as string
  interviewerId: string; // ObjectId as string
  round: string;
  scheduledAt: Date;
}

export interface UpdateInterviewRequest {
  feedback?: string;
  rating?: number;
  status?: 'scheduled' | 'completed' | 'missed';
}

export interface CreateEvaluationRequest {
  candidateId: string; // ObjectId as string
  jobId: string; // ObjectId as string
  testScore?: number;
  interviewScores: {
    round: string;
    score: number;
    interviewerId: string; // ObjectId as string
  }[];
  finalDecision: 'selected' | 'rejected' | 'on-hold';
  comments?: string;
}

// API Response types
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