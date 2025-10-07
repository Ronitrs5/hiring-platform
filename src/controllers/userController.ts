import { Request, Response } from 'express';
import { database } from '../config/database';
import { IUser, CreateUserRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
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

class UserController {
  // Create a new user
  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserRequest = req.body;
    
    // Check if user with email already exists
    const existingUser = await database.users.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const newUser: IUser = {
      ...userData,
      appliedJobs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.users.insertOne(newUser);
    const createdUser = await database.users.findOne({ _id: result.insertedId });

    const response: ApiResponse<IUser> = successResponse(createdUser!, 'User created successfully');
    res.status(201).json(response);
  });

  // Get all users with pagination and filtering
  getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);
    const { search, role } = req.query;

    // Build filter
    let filter: any = {};
    
      if (role === 'candidate' || role === 'admin') {
        filter.role = { $eq: role };
      }

    if (search) {
      const searchFilter = buildSearchFilter(search as string, ['name', 'email']);
      filter = { ...filter, ...searchFilter };
    }

    // Get total count for pagination
    const total = await database.users.countDocuments(filter);
    
    // Get users with pagination
    const users = await database.users
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IUser> = paginatedResponse(users, pagination);
    res.json(response);
  });

  // Get user by ID
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const user = await database.users.findOne({ _id: toObjectId(id) });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse<IUser> = successResponse(user);
    res.json(response);
  });

  // Update user
  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.email;
    delete updateData.role;
    delete updateData.createdAt;

    updateData.updatedAt = new Date();

    const result = await database.users.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse<IUser> = successResponse(result, 'User updated successfully');
    res.json(response);
  });

  // Delete user
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await database.users.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'User deleted successfully');
    res.json(response);
  });

  // Get user's applied jobs
  getUserApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { page, limit, skip } = getPaginationParams(req);

    // Get applications with job details
    const applications = await database.applications.aggregate([
      { $match: { candidateId: toObjectId(id) } },
      { $sort: { appliedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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

    const total = await database.applications.countDocuments({ candidateId: toObjectId(id) });
    const pagination = calculatePagination(total, page, limit);

    const response: PaginatedResponse = paginatedResponse(applications, pagination);
    res.json(response);
  });

  // Get candidates by role
  getCandidates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);
    const { search } = req.query;

    let filter: any = { role: 'candidate' };

    if (search) {
      const searchFilter = buildSearchFilter(search as string, ['name', 'email']);
      filter = { ...filter, ...searchFilter };
    }

    const total = await database.users.countDocuments(filter);
    const candidates = await database.users
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IUser> = paginatedResponse(candidates, pagination);
    res.json(response);
  });

  // Get admins by role
  getAdmins = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);

    const filter = { role: 'admin' };
    const total = await database.users.countDocuments(filter);
    const admins = await database.users
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IUser> = paginatedResponse(admins, pagination);
    res.json(response);
  });
}

export default new UserController();