import { Request, Response } from 'express';
import { database } from '../config/database';
import { IJob, CreateJobRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
import { 
  toObjectId, 
  getPaginationParams, 
  calculatePagination, 
  getSortParams, 
  buildSearchFilter,
  successResponse,
  paginatedResponse 
} from '../utils/helpers';
import { AppError, asyncHandler } from '../middleware/errorHandler';

class JobController {
  // Create a new job
  createJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const jobData: CreateJobRequest = req.body;

    const newJob: IJob = {
      title: jobData.title,
      department: jobData.department,
      location: jobData.location,
      description: jobData.description,
      requirements: jobData.requirements,
      createdBy: jobData.createdBy ? toObjectId(jobData.createdBy) : toObjectId('000000000000000000000000'), // Default admin ID for demo
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.jobs.insertOne(newJob);
    const createdJob = await database.jobs.findOne({ _id: result.insertedId });

    const response: ApiResponse<IJob> = successResponse(createdJob!, 'Job created successfully');
    res.status(201).json(response);
  });

  // Get all jobs with pagination and filtering
  getJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);
    const { search, department, location } = req.query;

    // Build filter
    let filter: any = {};
    
    if (department) {
      filter.department = department;
    }

    if (location) {
      filter.location = location;
    }

    if (search) {
      const searchFilter = buildSearchFilter(search as string, ['title', 'description', 'department']);
      filter = { ...filter, ...searchFilter };
    }

    // Get total count for pagination
    const total = await database.jobs.countDocuments(filter);
    
    // Get jobs with pagination and creator info
    const jobs = await database.jobs.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { 
        $unwind: { 
          path: '$creator', 
          preserveNullAndEmptyArrays: true 
        } 
      }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(jobs, pagination);
    res.json(response);
  });

  // Get job by ID
  getJobById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const jobs = await database.jobs.aggregate([
      { $match: { _id: toObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { 
        $unwind: { 
          path: '$creator', 
          preserveNullAndEmptyArrays: true 
        } 
      }
    ]).toArray();

    if (jobs.length === 0) {
      throw new AppError('Job not found', 404);
    }

    const response: ApiResponse = successResponse(jobs[0]);
    res.json(response);
  });

  // Update job
  updateJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.createdAt;

    updateData.updatedAt = new Date();

    const result = await database.jobs.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Job not found', 404);
    }

    const response: ApiResponse<IJob> = successResponse(result, 'Job updated successfully');
    res.json(response);
  });

  // Delete job
  deleteJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Check if there are any applications for this job
    const applicationCount = await database.applications.countDocuments({ jobId: toObjectId(id) });
    if (applicationCount > 0) {
      throw new AppError('Cannot delete job with existing applications', 400);
    }

    const result = await database.jobs.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Job not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Job deleted successfully');
    res.json(response);
  });

  // Get job applications
  getJobApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const { status } = req.query;

    let filter: any = { jobId: toObjectId(id) };
    if (status) {
      filter.status = status;
    }

    // Get applications with candidate details
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

    const total = await database.applications.countDocuments(filter);
    const pagination = calculatePagination(total, page, limit);

    const response: PaginatedResponse = paginatedResponse(applications, pagination);
    res.json(response);
  });

  // Get jobs by department
  getJobsByDepartment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { department } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);

    const filter = { department };
    const total = await database.jobs.countDocuments(filter);
    const jobs = await database.jobs
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IJob> = paginatedResponse(jobs, pagination);
    res.json(response);
  });

  // Get job statistics
  getJobStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stats = await database.jobs.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          departments: { $addToSet: '$department' },
          locations: { $addToSet: '$location' }
        }
      },
      {
        $project: {
          _id: 0,
          totalJobs: 1,
          totalDepartments: { $size: '$departments' },
          totalLocations: { $size: '$locations' },
          departments: 1,
          locations: 1
        }
      }
    ]).toArray();

    const departmentStats = await database.jobs.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    const response: ApiResponse = successResponse({
      overview: stats[0] || { totalJobs: 0, totalDepartments: 0, totalLocations: 0, departments: [], locations: [] },
      departmentBreakdown: departmentStats
    });
    res.json(response);
  });
}

export default new JobController();