import { apiClient } from './apiClient';
import {
  User,
  Job,
  Application,
  Test,
  TestResult,
  Interview,
  Evaluation,
  LoginRequest,
  AuthToken,
  CandidateDashboardData,
  AdminDashboardData,
  CreateJobForm,
  InterviewRatingForm,
  TestSession,
  ApiResponse,
  PaginatedResponse
} from '../types';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthToken>> {
    return apiClient.post('/auth/login', credentials);
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static async refreshToken(): Promise<ApiResponse<AuthToken>> {
    return apiClient.post('/auth/refresh');
  }
}

export class UserService {
  static async getUsers(params?: any): Promise<PaginatedResponse<User>> {
    return apiClient.getPaginated('/users', params);
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${id}`);
  }

  static async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.post('/users', userData);
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put(`/users/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/${id}`);
  }
}

export class JobService {
  static async getJobs(params?: any): Promise<PaginatedResponse<Job>> {
    return apiClient.getPaginated('/jobs', params);
  }

  static async getJobById(id: string): Promise<ApiResponse<Job>> {
    return apiClient.get(`/jobs/${id}`);
  }

  static async createJob(jobData: CreateJobForm): Promise<ApiResponse<Job>> {
    return apiClient.post('/jobs', jobData);
  }

  static async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return apiClient.put(`/jobs/${id}`, jobData);
  }

  static async deleteJob(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/jobs/${id}`);
  }

  static async getJobApplications(jobId: string): Promise<PaginatedResponse<Application>> {
    return apiClient.getPaginated(`/jobs/${jobId}/applications`);
  }
}

export class ApplicationService {
  static async getApplications(params?: any): Promise<PaginatedResponse<Application>> {
    return apiClient.getPaginated('/applications', params);
  }

  static async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    return apiClient.get(`/applications/${id}`);
  }

  static async createApplication(applicationData: {
    candidateId: string;
    jobId: string;
  }): Promise<ApiResponse<Application>> {
    return apiClient.post('/applications', applicationData);
  }

  static async updateApplicationStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Application>> {
    return apiClient.patch(`/applications/${id}/status`, { status });
  }

  static async getCandidateApplications(candidateId: string): Promise<PaginatedResponse<Application>> {
    return apiClient.getPaginated(`/applications/candidate/${candidateId}`);
  }
}

export class TestService {
  static async getTests(params?: any): Promise<PaginatedResponse<Test>> {
    return apiClient.getPaginated('/tests', params);
  }

  static async getTestById(id: string): Promise<ApiResponse<Test>> {
    return apiClient.get(`/tests/${id}`);
  }

  static async createTest(testData: Partial<Test>): Promise<ApiResponse<Test>> {
    return apiClient.post('/tests', testData);
  }

  static async startTest(testId: string, candidateId: string): Promise<ApiResponse<TestSession>> {
    return apiClient.post(`/tests/${testId}/start`, { candidateId });
  }

  static async submitTest(
    testId: string,
    answers: Record<string, string>
  ): Promise<ApiResponse<TestResult>> {
    return apiClient.post(`/tests/${testId}/submit`, { answers });
  }

  static async getTestResult(resultId: string): Promise<ApiResponse<TestResult>> {
    return apiClient.get(`/test-results/${resultId}`);
  }

  static async getCandidateTestResults(candidateId: string): Promise<PaginatedResponse<TestResult>> {
    return apiClient.getPaginated(`/test-results/candidate/${candidateId}`);
  }
}

export class InterviewService {
  static async getInterviews(params?: any): Promise<PaginatedResponse<Interview>> {
    return apiClient.getPaginated('/interviews', params);
  }

  static async getInterviewById(id: string): Promise<ApiResponse<Interview>> {
    return apiClient.get(`/interviews/${id}`);
  }

  static async createInterview(interviewData: Partial<Interview>): Promise<ApiResponse<Interview>> {
    return apiClient.post('/interviews', interviewData);
  }

  static async updateInterview(
    id: string,
    interviewData: Partial<Interview>
  ): Promise<ApiResponse<Interview>> {
    return apiClient.put(`/interviews/${id}`, interviewData);
  }

  static async submitInterviewRating(
    id: string,
    rating: InterviewRatingForm
  ): Promise<ApiResponse<Interview>> {
    return apiClient.post(`/interviews/${id}/rating`, rating);
  }

  static async getInterviewerInterviews(interviewerId: string): Promise<PaginatedResponse<Interview>> {
    return apiClient.getPaginated(`/interviews/interviewer/${interviewerId}`);
  }

  static async getCandidateInterviews(candidateId: string): Promise<PaginatedResponse<Interview>> {
    return apiClient.getPaginated(`/interviews/candidate/${candidateId}`);
  }
}

export class EvaluationService {
  static async getEvaluations(params?: any): Promise<PaginatedResponse<Evaluation>> {
    return apiClient.getPaginated('/evaluations', params);
  }

  static async getEvaluationById(id: string): Promise<ApiResponse<Evaluation>> {
    return apiClient.get(`/evaluations/${id}`);
  }

  static async createEvaluation(evaluationData: Partial<Evaluation>): Promise<ApiResponse<Evaluation>> {
    return apiClient.post('/evaluations', evaluationData);
  }

  static async updateEvaluation(
    id: string,
    evaluationData: Partial<Evaluation>
  ): Promise<ApiResponse<Evaluation>> {
    return apiClient.put(`/evaluations/${id}`, evaluationData);
  }

  static async getCandidateEvaluation(candidateId: string, jobId: string): Promise<ApiResponse<Evaluation>> {
    return apiClient.get(`/evaluations/candidate/${candidateId}/job/${jobId}`);
  }
}

export class DashboardService {
  static async getCandidateDashboard(candidateId: string): Promise<ApiResponse<CandidateDashboardData>> {
    return apiClient.get(`/dashboard/candidate/${candidateId}`);
  }

  static async getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get('/dashboard/admin');
  }

  static async getJobStats(jobId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/dashboard/job/${jobId}/stats`);
  }
}
