// Frontend TypeScript interfaces based on backend models

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'admin' | 'interviewer';
  phone?: string;
  resumeUrl?: string;
  appliedJobs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  interviewLoop?: InterviewStage[];
  oaCutoff?: number;
  aptiCutoff?: number;
}

export interface InterviewStage {
  id: string;
  name: string;
  type: 'oa' | 'aptitude' | 'technical' | 'hr';
  order: number;
  duration?: number;
  cutoffScore?: number;
}

export interface Application {
  _id: string;
  candidateId: string;
  jobId: string;
  status: 'applied' | 'test-assigned' | 'interview-scheduled' | 'rejected' | 'selected';
  appliedAt: string;
  updatedAt: string;
  currentStage?: string;
  stageProgress?: StageProgress[];
}

export interface StageProgress {
  stageId: string;
  stageName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  score?: number;
  maxScore?: number;
  completedAt?: string;
}

export interface Test {
  _id: string;
  title: string;
  jobId?: string;
  questions: string[];
  duration: number;
  createdBy: string;
  createdAt: string;
  type: 'oa' | 'aptitude';
}

export interface Question {
  _id: string;
  type: 'mcq' | 'coding' | 'descriptive';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases?: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface TestResultAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
}

export interface TestResult {
  _id: string;
  candidateId: string;
  testId: string;
  jobId: string;
  answers: TestResultAnswer[];
  totalScore: number;
  startedAt: string;
  submittedAt?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Interview {
  _id: string;
  candidateId: string;
  jobId: string;
  interviewerId: string;
  round: string;
  scheduledAt: string;
  feedback?: string;
  rating?: number;
  status: 'scheduled' | 'completed' | 'missed';
  dimensions?: InterviewDimension[];
}

export interface InterviewDimension {
  name: string;
  score: number;
  maxScore: number;
  comments?: string;
}

export interface InterviewScore {
  round: string;
  score: number;
  interviewerId: string;
}

export interface Evaluation {
  _id: string;
  candidateId: string;
  jobId: string;
  testScore?: number;
  interviewScores: InterviewScore[];
  finalDecision: 'selected' | 'rejected' | 'on-hold';
  comments?: string;
  updatedAt: string;
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

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  role: 'candidate' | 'admin' | 'interviewer';
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: string;
}

// Test Taking types
export interface TestSession {
  testId: string;
  candidateId: string;
  jobId: string;
  questions: Question[];
  timeRemaining: number;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isSubmitted: boolean;
}

// Dashboard types
export interface CandidateDashboardData {
  applications: Application[];
  upcomingTests: Test[];
  upcomingInterviews: Interview[];
}

export interface AdminDashboardData {
  jobs: Job[];
  candidateStats: {
    total: number;
    inProgress: number;
    completed: number;
    selected: number;
    rejected: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'application' | 'test_completed' | 'interview_scheduled' | 'evaluation_updated';
  candidateName: string;
  jobTitle: string;
  timestamp: string;
  details: string;
}

// Form types
export interface CreateJobForm {
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  interviewLoop: InterviewStage[];
  oaCutoff: number;
  aptiCutoff: number;
}

export interface InterviewRatingForm {
  dimensions: {
    communication: number;
    technicalSkills: number;
    problemSolving: number;
    culturalFit: number;
    overallRating: number;
  };
  feedback: string;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
}
