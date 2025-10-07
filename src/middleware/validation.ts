import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }
    next();
  };
};

// User validation schemas
export const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('candidate', 'admin').required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    resumeUrl: Joi.string().uri().optional(),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    resumeUrl: Joi.string().uri().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

// Job validation schemas
export const jobSchemas = {
  create: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    department: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    requirements: Joi.array().items(Joi.string().min(1)).min(1).required(),
    createdBy: Joi.string().hex().length(24).required(),
  }),
  
  update: Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    department: Joi.string().min(2).max(100).optional(),
    location: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(10).optional(),
    requirements: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  }),
};

// Application validation schemas
export const applicationSchemas = {
  create: Joi.object({
    candidateId: Joi.string().hex().length(24).required(),
    jobId: Joi.string().hex().length(24).required(),
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('applied', 'test-assigned', 'interview-scheduled', 'rejected', 'selected').required(),
  }),
};

// Test validation schemas
export const testSchemas = {
  create: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    jobId: Joi.string().hex().length(24).optional(),
    questions: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    duration: Joi.number().integer().min(1).max(300).required(),
    createdBy: Joi.string().hex().length(24).required(),
  }),
  
  update: Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    questions: Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
    duration: Joi.number().integer().min(1).max(300).optional(),
  }),
};

// Question validation schemas
export const questionSchemas = {
  create: Joi.object({
    type: Joi.string().valid('mcq', 'coding', 'descriptive').required(),
    questionText: Joi.string().min(5).required(),
    options: Joi.array().items(Joi.string().min(1)).when('type', {
      is: 'mcq',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    correctAnswer: Joi.string().optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    tags: Joi.array().items(Joi.string().min(1)).min(1).required(),
  }),
  
  update: Joi.object({
    questionText: Joi.string().min(5).optional(),
    options: Joi.array().items(Joi.string().min(1)).optional(),
    correctAnswer: Joi.string().optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    tags: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  }),
};

// Test Result validation schemas
export const testResultSchemas = {
  create: Joi.object({
    candidateId: Joi.string().hex().length(24).required(),
    testId: Joi.string().hex().length(24).required(),
    jobId: Joi.string().hex().length(24).required(),
    answers: Joi.array().items(
      Joi.object({
        questionId: Joi.string().hex().length(24).required(),
        answer: Joi.string().required(),
      })
    ).min(1).required(),
  }),
};

// Interview validation schemas
export const interviewSchemas = {
  create: Joi.object({
    candidateId: Joi.string().hex().length(24).required(),
    jobId: Joi.string().hex().length(24).required(),
    interviewerId: Joi.string().hex().length(24).required(),
    round: Joi.string().min(2).max(100).required(),
    scheduledAt: Joi.date().iso().required(),
  }),
  
  update: Joi.object({
    feedback: Joi.string().min(5).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid('scheduled', 'completed', 'missed').optional(),
  }),
};

// Evaluation validation schemas
export const evaluationSchemas = {
  create: Joi.object({
    candidateId: Joi.string().hex().length(24).required(),
    jobId: Joi.string().hex().length(24).required(),
    testScore: Joi.number().min(0).max(100).optional(),
    interviewScores: Joi.array().items(
      Joi.object({
        round: Joi.string().min(2).max(100).required(),
        score: Joi.number().integer().min(1).max(5).required(),
        interviewerId: Joi.string().hex().length(24).required(),
      })
    ).min(0).required(),
    finalDecision: Joi.string().valid('selected', 'rejected', 'on-hold').required(),
    comments: Joi.string().min(5).optional(),
  }),
  
  update: Joi.object({
    testScore: Joi.number().min(0).max(100).optional(),
    interviewScores: Joi.array().items(
      Joi.object({
        round: Joi.string().min(2).max(100).required(),
        score: Joi.number().integer().min(1).max(5).required(),
        interviewerId: Joi.string().hex().length(24).required(),
      })
    ).min(0).optional(),
    finalDecision: Joi.string().valid('selected', 'rejected', 'on-hold').optional(),
    comments: Joi.string().min(5).optional(),
  }),
};

// Common validation helpers
export const validateObjectId = Joi.string().hex().length(24);
export const validatePagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});