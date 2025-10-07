import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetPaginated, 
  buildQueryString 
} from './api';
import {
  Job,
  CreateJobRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams
} from '../types';

export class JobService {
  // Create a new job
  static async createJob(jobData: CreateJobRequest): Promise<ApiResponse<Job>> {
    return apiPost<Job>('/jobs', jobData);
  }

  // Get all jobs with pagination and filtering
  static async getJobs(params: PaginationParams & FilterParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Job>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Job>(`/jobs${queryString}`);
  }

  // Get job by ID
  static async getJobById(id: string): Promise<ApiResponse<Job>> {
    return apiGet<Job>(`/jobs/${id}`);
  }

  // Update job
  static async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return apiPut<Job>(`/jobs/${id}`, jobData);
  }

  // Delete job
  static async deleteJob(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/jobs/${id}`);
  }

  // Get job statistics
  static async getJobStats(): Promise<ApiResponse<any>> {
    return apiGet<any>('/jobs/stats');
  }

  // Get jobs by department
  static async getJobsByDepartment(department: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Job>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Job>(`/jobs/department/${department}${queryString}`);
  }

  // Get job applications
  static async getJobApplications(jobId: string, params: PaginationParams & { status?: string } = { page: 1, limit: 10 }): Promise<PaginatedResponse<any>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<any>(`/jobs/${jobId}/applications${queryString}`);
  }
}