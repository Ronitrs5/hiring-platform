import { ObjectId } from 'mongodb';
import { Request } from 'express';
import { config } from '../config/config';

// Utility function to convert string to ObjectId
export const toObjectId = (id: string): ObjectId => {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ObjectId format: ${id}`);
  }
};

// Utility function to validate ObjectId format
export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

// Pagination utility
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit as string) || config.pagination.defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Calculate pagination info
export const calculatePagination = (total: number, page: number, limit: number) => {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

// Sort utility
export interface SortParams {
  [key: string]: 1 | -1;
}

export const getSortParams = (req: Request, defaultSort: SortParams = { createdAt: -1 }): SortParams => {
  const sortBy = req.query.sortBy as string;
  const sortOrder = req.query.sortOrder as string;

  if (sortBy) {
    const order = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }

  return defaultSort;
};

// Filter utility for search
export const buildSearchFilter = (searchTerm: string, fields: string[]) => {
  if (!searchTerm) return {};

  const searchRegex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchRegex }
    }))
  };
};

// Date range filter utility
export const buildDateRangeFilter = (startDate?: string, endDate?: string, field = 'createdAt') => {
  const filter: any = {};

  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) {
      filter[field].$gte = new Date(startDate);
    }
    if (endDate) {
      filter[field].$lte = new Date(endDate);
    }
  }

  return filter;
};

// Response utility functions
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  ...(message && { message })
});

export const paginatedResponse = <T>(
  data: T[],
  pagination: ReturnType<typeof calculatePagination>
) => ({
  success: true,
  data,
  pagination
});

export const errorResponse = (error: string, message?: string) => ({
  success: false,
  error,
  ...(message && { message })
});

// Utility to sanitize user input (remove sensitive fields)
export const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Utility to format date strings
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Utility to calculate test score
export const calculateTestScore = (answers: any[], questions: any[]): number => {
  let totalScore = 0;
  let maxScore = 0;

  answers.forEach(answer => {
    const question = questions.find(q => q._id.toString() === answer.questionId.toString());
    if (question) {
      maxScore += question.points || 5; // Default 5 points per question
      if (answer.isCorrect) {
        totalScore += question.points || 5;
      }
    }
  });

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Utility to generate random test questions
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Utility to mask sensitive information in logs
export const maskSensitiveData = (obj: any): any => {
  const masked = { ...obj };
  const sensitiveFields = ['password', 'email', 'phone'];
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });
  
  return masked;
};

// Utility to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility to generate unique filename
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};