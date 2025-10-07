import { Request, Response } from 'express';
import { database } from '../config/database';
import { ITest, CreateTestRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
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

class TestController {
  // Create a new test
  createTest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const testData: CreateTestRequest = req.body;
    
    // Verify admin exists
    const admin = await database.users.findOne({ 
      _id: toObjectId(testData.createdBy), 
      role: 'admin' 
    });
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Verify job exists (if provided)
    if (testData.jobId) {
      const job = await database.jobs.findOne({ _id: toObjectId(testData.jobId) });
      if (!job) {
        throw new AppError('Job not found', 404);
      }
    }

    // Verify all questions exist
    const questionIds = testData.questions.map(id => toObjectId(id));
    const existingQuestions = await database.questions.find({ 
      _id: { $in: questionIds } 
    }).toArray();
    
    if (existingQuestions.length !== questionIds.length) {
      throw new AppError('One or more questions not found', 404);
    }

    const newTest: ITest = {
      title: testData.title,
      jobId: testData.jobId ? toObjectId(testData.jobId) : undefined,
      questions: questionIds,
      duration: testData.duration,
      createdBy: toObjectId(testData.createdBy),
      createdAt: new Date(),
    };

    const result = await database.tests.insertOne(newTest);
    const createdTest = await database.tests.findOne({ _id: result.insertedId });

    const response: ApiResponse<ITest> = successResponse(createdTest!, 'Test created successfully');
    res.status(201).json(response);
  });

  // Get all tests with pagination and filtering
  getTests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { createdAt: -1 });
    const { search, jobId, createdBy } = req.query;

    // Build filter
    let filter: any = {};
    
    if (jobId) {
      filter.jobId = toObjectId(jobId as string);
    }

    if (createdBy) {
      filter.createdBy = toObjectId(createdBy as string);
    }

    if (search) {
      const searchFilter = buildSearchFilter(search as string, ['title']);
      filter = { ...filter, ...searchFilter };
    }

    // Get total count for pagination
    const total = await database.tests.countDocuments(filter);
    
    // Get tests with pagination and related data
    const tests = await database.tests.aggregate([
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
      { $unwind: '$creator' },
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
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questionDetails',
          pipeline: [
            { $project: { type: 1, difficulty: 1, tags: 1 } }
          ]
        }
      },
      {
        $addFields: {
          questionCount: { $size: '$questions' },
          questionTypes: { 
            $reduce: {
              input: '$questionDetails.type',
              initialValue: [],
              in: { $setUnion: ['$$value', ['$$this']] }
            }
          }
        }
      }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(tests, pagination);
    res.json(response);
  });

  // Get test by ID
  getTestById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const tests = await database.tests.aggregate([
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
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questionDetails'
        }
      }
    ]).toArray();

    if (tests.length === 0) {
      throw new AppError('Test not found', 404);
    }

    const response: ApiResponse = successResponse(tests[0]);
    res.json(response);
  });

  // Update test
  updateTest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Verify questions exist if updating questions
    if (updateData.questions) {
      const questionIds = updateData.questions.map((qid: string) => toObjectId(qid));
      const existingQuestions = await database.questions.find({ 
        _id: { $in: questionIds } 
      }).toArray();
      
      if (existingQuestions.length !== questionIds.length) {
        throw new AppError('One or more questions not found', 404);
      }
      updateData.questions = questionIds;
    }

    const result = await database.tests.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Test not found', 404);
    }

    const response: ApiResponse<ITest> = successResponse(result, 'Test updated successfully');
    res.json(response);
  });

  // Delete test
  deleteTest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Check if test has results
    const resultCount = await database.testResults.countDocuments({ 
      testId: toObjectId(id) 
    });
    
    if (resultCount > 0) {
      throw new AppError('Cannot delete test that has results', 400);
    }

    const result = await database.tests.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Test not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Test deleted successfully');
    res.json(response);
  });

  // Get tests by job
  getTestsByJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { createdAt: -1 });

    const filter = { jobId: toObjectId(jobId) };
    const total = await database.tests.countDocuments(filter);
    const tests = await database.tests
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<ITest> = paginatedResponse(tests, pagination);
    res.json(response);
  });

  // Get test statistics
  getTestStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const durationStats = await database.tests.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$duration', 30] }, then: '0-30 minutes' },
                { case: { $lte: ['$duration', 60] }, then: '31-60 minutes' },
                { case: { $lte: ['$duration', 120] }, then: '61-120 minutes' }
              ],
              default: '120+ minutes'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const jobAssociationStats = await database.tests.aggregate([
      {
        $group: {
          _id: { $cond: [{ $eq: ['$jobId', null] }, 'General', 'Job-specific'] },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const monthlyStats = await database.tests.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]).toArray();

    const totalTests = await database.tests.countDocuments();
    const avgQuestionsPerTest = await database.tests.aggregate([
      {
        $group: {
          _id: null,
          avgQuestions: { $avg: { $size: '$questions' } }
        }
      }
    ]).toArray();

    const response: ApiResponse = successResponse({
      totalTests,
      averageQuestionsPerTest: avgQuestionsPerTest[0]?.avgQuestions || 0,
      durationBreakdown: durationStats,
      jobAssociation: jobAssociationStats,
      monthlyTrend: monthlyStats
    });
    res.json(response);
  });
}

export default new TestController();