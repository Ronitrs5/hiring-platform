import { Request, Response } from 'express';
import { database } from '../config/database';
import { IApplication, CreateApplicationRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
import { 
  toObjectId, 
  getPaginationParams, 
  calculatePagination, 
  getSortParams,
  successResponse,
  paginatedResponse 
} from '../utils/helpers';
import { AppError, asyncHandler } from '../middleware/errorHandler';

class ApplicationController {
  // Create a new application
  createApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const applicationData: CreateApplicationRequest = req.body;
    
    // Check if user already applied for this job
    const existingApplication = await database.applications.findOne({
      candidateId: toObjectId(applicationData.candidateId),
      jobId: toObjectId(applicationData.jobId)
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 409);
    }

    // Verify candidate and job exist
    const candidate = await database.users.findOne({ 
      _id: toObjectId(applicationData.candidateId), 
      role: 'candidate' 
    });
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const job = await database.jobs.findOne({ _id: toObjectId(applicationData.jobId) });
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    const newApplication: IApplication = {
      candidateId: toObjectId(applicationData.candidateId),
      jobId: toObjectId(applicationData.jobId),
      status: 'applied',
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.applications.insertOne(newApplication);
    const createdApplication = await database.applications.findOne({ _id: result.insertedId });

    // Update user's appliedJobs array
    await database.users.updateOne(
      { _id: toObjectId(applicationData.candidateId) },
      { $addToSet: { appliedJobs: toObjectId(applicationData.jobId) } }
    );

    const response: ApiResponse<IApplication> = successResponse(createdApplication!, 'Application submitted successfully');
    res.status(201).json(response);
  });

  // Get all applications with pagination and filtering
  getApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { appliedAt: -1 });
    const { status, candidateId, jobId } = req.query;

    // Build filter
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    if (candidateId) {
      filter.candidateId = toObjectId(candidateId as string);
    }

    if (jobId) {
      filter.jobId = toObjectId(jobId as string);
    }

    // Get total count for pagination
    const total = await database.applications.countDocuments(filter);
    
    // Get applications with candidate and job details
    const applications = await database.applications.aggregate([
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
            { $project: { name: 1, email: 1, phone: 1, resumeUrl: 1 } }
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
            { $project: { title: 1, department: 1, location: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(applications, pagination);
    res.json(response);
  });

  // Get application by ID
  getApplicationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const applications = await database.applications.aggregate([
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
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    if (applications.length === 0) {
      throw new AppError('Application not found', 404);
    }

    const response: ApiResponse = successResponse(applications[0]);
    res.json(response);
  });

  // Update application status
  updateApplicationStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'test-assigned', 'interview-scheduled', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const result = await database.applications.findOneAndUpdate(
      { _id: toObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Application not found', 404);
    }

    const response: ApiResponse<IApplication> = successResponse(result, 'Application status updated successfully');
    res.json(response);
  });

  // Delete application
  deleteApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const application = await database.applications.findOne({ _id: toObjectId(id) });
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Remove from user's appliedJobs array
    await database.users.updateOne(
      { _id: application.candidateId },
      { $pull: { appliedJobs: application.jobId } }
    );

    const result = await database.applications.deleteOne({ _id: toObjectId(id) });

    const response: ApiResponse = successResponse(null, 'Application deleted successfully');
    res.json(response);
  });

  // Get applications by candidate
  getApplicationsByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const { status } = req.query;

    let filter: any = { candidateId: toObjectId(candidateId) };
    if (status) {
      filter.status = status;
    }

    const total = await database.applications.countDocuments(filter);
    
    const applications = await database.applications.aggregate([
      { $match: filter },
      { $sort: { appliedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
          pipeline: [
            { $project: { title: 1, department: 1, location: 1, description: 1 } }
          ]
        }
      },
      { $unwind: '$job' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(applications, pagination);
    res.json(response);
  });

  // Get applications by job
  getApplicationsByJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const { status } = req.query;

    let filter: any = { jobId: toObjectId(jobId) };
    if (status) {
      filter.status = status;
    }

    const total = await database.applications.countDocuments(filter);
    
    const applications = await database.applications.aggregate([
      { $match: filter },
      { $sort: { appliedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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
      { $unwind: '$candidate' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(applications, pagination);
    res.json(response);
  });

  // Get application statistics
  getApplicationStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const statusStats = await database.applications.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    const monthlyStats = await database.applications.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]).toArray();

    const totalApplications = await database.applications.countDocuments();

    const response: ApiResponse = successResponse({
      totalApplications,
      statusBreakdown: statusStats,
      monthlyTrend: monthlyStats
    });
    res.json(response);
  });
}

export default new ApplicationController();