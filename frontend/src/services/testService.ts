import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetPaginated, 
  buildQueryString 
} from './api';
import {
  Test,
  TestResult,
  CreateTestRequest,
  CreateTestResultRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../types';

export class TestService {
  // Create a new test
  static async createTest(testData: CreateTestRequest): Promise<ApiResponse<Test>> {
    return apiPost<Test>('/tests', testData);
  }

  // Get all tests with pagination and filtering
  static async getTests(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Test>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<Test>(`/tests${queryString}`);
  }

  // Get test by ID
  static async getTestById(id: string): Promise<ApiResponse<Test>> {
    return apiGet<Test>(`/tests/${id}`);
  }

  // Update test
  static async updateTest(id: string, testData: Partial<Test>): Promise<ApiResponse<Test>> {
    return apiPut<Test>(`/tests/${id}`, testData);
  }

  // Delete test
  static async deleteTest(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/tests/${id}`);
  }

  // Get tests by job ID
  static async getTestsByJobId(jobId: string): Promise<PaginatedResponse<Test>> {
    return apiGetPaginated<Test>(`/tests/job/${jobId}`);
  }

  // Start a test
  static async startTest(testId: string, candidateId: string, jobId: string): Promise<ApiResponse<TestResult>> {
    return apiPost<TestResult>(`/tests/${testId}/start`, { candidateId, jobId });
  }

  // Submit test result
  static async submitTestResult(testResultData: CreateTestResultRequest): Promise<ApiResponse<TestResult>> {
    return apiPost<TestResult>('/test-results', testResultData);
  }

  // Get test result by ID
  static async getTestResultById(id: string): Promise<ApiResponse<TestResult>> {
    return apiGet<TestResult>(`/test-results/${id}`);
  }

  // Get test results by candidate and job
  static async getTestResultsByCandidateAndJob(candidateId: string, jobId: string): Promise<PaginatedResponse<TestResult>> {
    const queryString = buildQueryString({ candidateId, jobId });
    return apiGetPaginated<TestResult>(`/test-results${queryString}`);
  }

  // Get test results by test ID
  static async getTestResultsByTestId(testId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<TestResult>> {
    const queryString = buildQueryString({ ...params, testId });
    return apiGetPaginated<TestResult>(`/test-results${queryString}`);
  }

  // Update test result
  static async updateTestResult(id: string, updateData: Partial<TestResult>): Promise<ApiResponse<TestResult>> {
    return apiPut<TestResult>(`/test-results/${id}`, updateData);
  }
}