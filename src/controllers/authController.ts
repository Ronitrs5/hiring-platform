import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { database } from '../config/database';
import { IUser, ApiResponse } from '../models/interfaces';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/helpers';

interface LoginRequest {
  email: string;
  password: string;
  role: 'candidate' | 'admin' | 'interviewer';
}

interface LoginResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

interface RegisterRequest extends LoginRequest {
  name: string;
}

class AuthController {
  // Register a new user
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role }: RegisterRequest = req.body;
    
    // Check if user already exists
    const existingUser = await database.users.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser: IUser = {
      name,
      email,
      password: hashedPassword,
      role,
      appliedJobs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.users.insertOne(newUser);
    const createdUser = await database.users.findOne({ _id: result.insertedId });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: createdUser!._id, 
        email: createdUser!.email, 
        role: createdUser!.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = createdUser!;

    const response: ApiResponse<LoginResponse> = successResponse(
      { user: userWithoutPassword, token },
      'User registered successfully'
    );
    
    res.status(201).json(response);
  });

  // Login user
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, role }: LoginRequest = req.body;
    
    // Find user by email and role
    const user = await database.users.findOne({ email, role });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse<LoginResponse> = successResponse(
      { user: userWithoutPassword, token },
      'Login successful'
    );
    
    res.status(200).json(response);
  });

  // Get current user profile
  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId; // Will be set by auth middleware
    
    const user = await database.users.findOne({ _id: userId });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    
    const response: ApiResponse<Omit<IUser, 'password'>> = successResponse(
      userWithoutPassword,
      'Profile retrieved successfully'
    );
    
    res.status(200).json(response);
  });

  // Create demo users for testing
  createDemoUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const demoUsers = [
      {
        name: 'Demo Candidate',
        email: 'candidate@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'candidate' as const,
        appliedJobs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Interviewer',
        email: 'interviewer@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'interviewer' as const,
        appliedJobs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: await bcrypt.hash('password123', 12),
        role: 'admin' as const,
        appliedJobs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Delete existing demo users
    await database.users.deleteMany({ 
      email: { $in: ['candidate@demo.com', 'interviewer@demo.com', 'admin@demo.com'] } 
    });

    // Insert new demo users
    await database.users.insertMany(demoUsers);

    const response: ApiResponse<{ count: number }> = successResponse(
      { count: demoUsers.length },
      'Demo users created successfully'
    );
    
    res.status(201).json(response);
  });
}

export default new AuthController();
