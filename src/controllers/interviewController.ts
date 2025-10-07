import { Request, Response } from 'express';
import { database } from '../config/database';
import { IInterview, CreateInterviewRequest, UpdateInterviewRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
import { 
  toObjectId, 
  getPaginationParams, 
  calculatePagination, 
  getSortParams,
  successResponse,
  paginatedResponse 
} from '../utils/helpers';
import { AppError, asyncHandler } from '../middleware/errorHandler';

class InterviewController {
  // Schedule a new interview
  createInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const interviewData: CreateInterviewRequest = req.body;
    
    // Verify candidate, job, and interviewer exist
    const candidate = await database.users.findOne({ 
      _id: toObjectId(interviewData.candidateId), 
      role: 'candidate' 
    });
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const job = await database.jobs.findOne({ _id: toObjectId(interviewData.jobId) });
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    const interviewer = await database.users.findOne({ 
      _id: toObjectId(interviewData.interviewerId) 
    });
    if (!interviewer) {
      throw new AppError('Interviewer not found', 404);
    }

    // Check if candidate has applied for this job
    const application = await database.applications.findOne({
      candidateId: toObjectId(interviewData.candidateId),
      jobId: toObjectId(interviewData.jobId)
    });
    if (!application) {
      throw new AppError('Candidate has not applied for this job', 400);
    }

    const newInterview: IInterview = {
      candidateId: toObjectId(interviewData.candidateId),
      jobId: toObjectId(interviewData.jobId),
      interviewerId: toObjectId(interviewData.interviewerId),
      round: interviewData.round,
      scheduledAt: new Date(interviewData.scheduledAt),
      status: 'scheduled'
    };

    const result = await database.interviews.insertOne(newInterview);
    const createdInterview = await database.interviews.findOne({ _id: result.insertedId });

    const response: ApiResponse<IInterview> = successResponse(createdInterview!, 'Interview scheduled successfully');
    res.status(201).json(response);
  });

  // Get all interviews with pagination and filtering
  getInterviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { scheduledAt: 1 }); // Default: upcoming first
    const { candidateId, jobId, interviewerId, status, round } = req.query;

    // Build filter
    let filter: any = {};
    
    if (candidateId) {
      filter.candidateId = toObjectId(candidateId as string);
    }

    if (jobId) {
      filter.jobId = toObjectId(jobId as string);
    }

    if (interviewerId) {
      filter.interviewerId = toObjectId(interviewerId as string);
    }

    if (status) {
      filter.status = status;
    }

    if (round) {
      filter.round = { $regex: round, $options: 'i' };
    }

    // Get total count for pagination
    const total = await database.interviews.countDocuments(filter);
    
    // Get interviews with related data
    const interviews = await database.interviews.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'users',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$interviewer' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
          pipeline: [
            { $project: { title: 1, department: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(interviews, pagination);
    res.json(response);
  });

  // Get interview by ID
  getInterviewById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const interviews = await database.interviews.aggregate([
      { $match: { _id: toObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1, resumeUrl: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'users',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$interviewer' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    if (interviews.length === 0) {
      throw new AppError('Interview not found', 404);
    }

    const response: ApiResponse = successResponse(interviews[0]);
    res.json(response);
  });

  // Update interview (feedback, rating, status)
  updateInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: UpdateInterviewRequest = req.body;

    const result = await database.interviews.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Interview not found', 404);
    }

    const response: ApiResponse<IInterview> = successResponse(result, 'Interview updated successfully');
    res.json(response);
  });

  // Delete interview
  deleteInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await database.interviews.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Interview not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Interview deleted successfully');
    res.json(response);
  });

  // Get interviews by candidate
  getInterviewsByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { scheduledAt: 1 });

    const filter = { candidateId: toObjectId(candidateId) };
    const total = await database.interviews.countDocuments(filter);
    
    const interviews = await database.interviews.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$interviewer' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
          pipeline: [
            { $project: { title: 1, department: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(interviews, pagination);
    res.json(response);
  });

  // Get interviews by interviewer
  getInterviewsByInterviewer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { interviewerId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { scheduledAt: 1 });

    const filter = { interviewerId: toObjectId(interviewerId) };
    const total = await database.interviews.countDocuments(filter);
    
    const interviews = await database.interviews.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
          pipeline: [
            { $project: { title: 1, department: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(interviews, pagination);
    res.json(response);
  });

  // Get upcoming interviews
  getUpcomingInterviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    
    const filter = { 
      scheduledAt: { $gte: new Date() },
      status: 'scheduled' as const
    };
    
    const total = await database.interviews.countDocuments(filter);
    
    const interviews = await database.interviews.aggregate([
      { $match: filter },
      { $sort: { scheduledAt: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'users',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$interviewer' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
          pipeline: [
            { $project: { title: 1, department: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(interviews, pagination);
    res.json(response);
  });

  // Get interview statistics
  getInterviewStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const statusStats = await database.interviews.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const roundStats = await database.interviews.aggregate([
      {
        $group: {
          _id: '$round',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    const upcomingCount = await database.interviews.countDocuments({
      scheduledAt: { $gte: new Date() },
      status: 'scheduled'
    });

    const completedWithRating = await database.interviews.countDocuments({
      status: 'completed',
      rating: { $exists: true }
    });

    const averageRating = await database.interviews.aggregate([
      { $match: { rating: { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]).toArray();

    const totalInterviews = await database.interviews.countDocuments();

    const response: ApiResponse = successResponse({
      totalInterviews,
      upcomingInterviews: upcomingCount,
      completedWithRating,
      averageRating: averageRating[0]?.averageRating || 0,
      statusBreakdown: statusStats,
      roundBreakdown: roundStats
    });
    res.json(response);
  });
}

export default new InterviewController();