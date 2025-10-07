import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetPaginated, 
  buildQueryString 
} from './api';
import {
  Question,
  Application,
  CreateQuestionRequest,
  CreateApplicationRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../types';

export class QuestionService {
  // Create a new question
  static async createQuestion(questionData: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    return apiPost<Question>('/questions', questionData);
  }

  // Get all questions with pagination and filtering
  static async getQuestions(params: PaginationParams & { type?: string; difficulty?: string; tags?: string } = { page: 1, limit: 10 }): Promise<PaginatedResponse<Question>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Question>(`/questions${queryString}`);
  }

  // Get question by ID
  static async getQuestionById(id: string): Promise<ApiResponse<Question>> {
    return apiGet<Question>(`/questions/${id}`);
  }

  // Update question
  static async updateQuestion(id: string, questionData: Partial<Question>): Promise<ApiResponse<Question>> {
    return apiPut<Question>(`/questions/${id}`, questionData);
  }

  // Delete question
  static async deleteQuestion(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/questions/${id}`);
  }

  // Get questions by type
  static async getQuestionsByType(type: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Question>> {
    const queryString = buildQueryString({ ...params, type });
    return apiGetPaginated<Question>(`/questions${queryString}`);
  }

  // Get questions by difficulty
  static async getQuestionsByDifficulty(difficulty: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Question>> {
    const queryString = buildQueryString({ ...params, difficulty });
    return apiGetPaginated<Question>(`/questions${queryString}`);
  }

  // Get question statistics
  static async getQuestionStats(): Promise<ApiResponse<any>> {
    return apiGet<any>('/questions/stats');
  }
}

export class ApplicationService {
  // Create a new application
  static async createApplication(applicationData: CreateApplicationRequest): Promise<ApiResponse<Application>> {
    return apiPost<Application>('/applications', applicationData);
  }

  // Get all applications with pagination and filtering
  static async getApplications(params: PaginationParams & { status?: string; jobId?: string; candidateId?: string } = { page: 1, limit: 10 }): Promise<PaginatedResponse<Application>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Application>(`/applications${queryString}`);
  }

  // Get application by ID
  static async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    return apiGet<Application>(`/applications/${id}`);
  }

  // Update application status
  static async updateApplicationStatus(id: string, status: Application['status']): Promise<ApiResponse<Application>> {
    return apiPut<Application>(`/applications/${id}`, { status });
  }

  // Delete application
  static async deleteApplication(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/applications/${id}`);
  }

  // Get applications by candidate ID
  static async getApplicationsByCandidateId(candidateId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Application>> {
    const queryString = buildQueryString({ ...params, candidateId });
    return apiGetPaginated<Application>(`/applications${queryString}`);
  }

  // Get applications by job ID
  static async getApplicationsByJobId(jobId: string, params: PaginationParams & { status?: string } = { page: 1, limit: 10 }): Promise<PaginatedResponse<Application>> {
    const queryString = buildQueryString({ ...params, jobId });
    return apiGetPaginated<Application>(`/applications${queryString}`);
  }

  // Get application statistics
  static async getApplicationStats(): Promise<ApiResponse<any>> {
    return apiGet<any>('/applications/stats');
  }
}