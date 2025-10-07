import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  apiGetPaginated, 
  buildQueryString 
} from './api';
import {
  User,
  CreateUserRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '../types';

export class UserService {
  // Create a new user
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiPost<User>('/users', userData);
  }

  // Get all users with pagination and filtering
  static async getUsers(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<User>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<User>(`/users${queryString}`);
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiGet<User>(`/users/${id}`);
  }

  // Update user
  static async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiPut<User>(`/users/${id}`, userData);
  }

  // Delete user
  static async deleteUser(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/users/${id}`);
  }

  // Get candidates
  static async getCandidates(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<User>> {
    const queryString = buildQueryString({ ...params, role: 'candidate' });
    return apiGetPaginated<User>(`/users/candidates${queryString}`);
  }

  // Get admins
  static async getAdmins(params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<User>> {
    const queryString = buildQueryString({ ...params, role: 'admin' });
    return apiGetPaginated<User>(`/users/admins${queryString}`);
  }

  // Get user applications
  static async getUserApplications(userId: string, params: PaginationParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<any>> {
    const queryString = buildQueryString(params);
    return apiGetPaginated<any>(`/users/${userId}/applications${queryString}`);
  }
}