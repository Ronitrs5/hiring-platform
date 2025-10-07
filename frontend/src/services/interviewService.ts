import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetPaginated, 
  buildQueryString 
} from './api';
import {
  Interview,
  Evaluation,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  CreateEvaluationRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../types';

export class InterviewService {
  // Create a new interview
  static async createInterview(interviewData: CreateInterviewRequest): Promise<ApiResponse<Interview>> {
    return apiPost<Interview>('/interviews', interviewData);
  }

  // Get all interviews with pagination and filtering
  static async getInterviews(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Interview>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Interview>(`/interviews${queryString}`);
  }

  // Get interview by ID
  static async getInterviewById(id: string): Promise<ApiResponse<Interview>> {
    return apiGet<Interview>(`/interviews/${id}`);
  }

  // Update interview
  static async updateInterview(id: string, interviewData: UpdateInterviewRequest): Promise<ApiResponse<Interview>> {
    return apiPut<Interview>(`/interviews/${id}`, interviewData);
  }

  // Delete interview
  static async deleteInterview(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/interviews/${id}`);
  }

  // Get interviews by candidate ID
  static async getInterviewsByCandidateId(candidateId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Interview>> {
    const queryString = buildQueryString({ ...params, candidateId });
    return apiGetPaginated<Interview>(`/interviews${queryString}`);
  }

  // Get interviews by interviewer ID
  static async getInterviewsByInterviewerId(interviewerId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Interview>> {
    const queryString = buildQueryString({ ...params, interviewerId });
    return apiGetPaginated<Interview>(`/interviews${queryString}`);
  }

  // Get interviews by job ID
  static async getInterviewsByJobId(jobId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Interview>> {
    const queryString = buildQueryString({ ...params, jobId });
    return apiGetPaginated<Interview>(`/interviews${queryString}`);
  }
}

export class EvaluationService {
  // Create a new evaluation
  static async createEvaluation(evaluationData: CreateEvaluationRequest): Promise<ApiResponse<Evaluation>> {
    return apiPost<Evaluation>('/evaluations', evaluationData);
  }

  // Get all evaluations with pagination and filtering
  static async getEvaluations(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Evaluation>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Evaluation>(`/evaluations${queryString}`);
  }

  // Get evaluation by ID
  static async getEvaluationById(id: string): Promise<ApiResponse<Evaluation>> {
    return apiGet<Evaluation>(`/evaluations/${id}`);
  }

  // Update evaluation
  static async updateEvaluation(id: string, evaluationData: Partial<Evaluation>): Promise<ApiResponse<Evaluation>> {
    return apiPut<Evaluation>(`/evaluations/${id}`, evaluationData);
  }

  // Delete evaluation
  static async deleteEvaluation(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/evaluations/${id}`);
  }

  // Get evaluation by candidate and job
  static async getEvaluationByCandidateAndJob(candidateId: string, jobId: string): Promise<ApiResponse<Evaluation>> {
    const queryString = buildQueryString({ candidateId, jobId });
    return apiGet<Evaluation>(`/evaluations/candidate-job${queryString}`);
  }

  // Get evaluations by job ID
  static async getEvaluationsByJobId(jobId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Evaluation>> {
    const queryString = buildQueryString({ ...params, jobId });
    return apiGetPaginated<Evaluation>(`/evaluations${queryString}`);
  }
}