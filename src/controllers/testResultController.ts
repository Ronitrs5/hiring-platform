import { Request, Response } from 'express';
import { database } from '../config/database';
import { ITestResult, CreateTestResultRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
import { 
  toObjectId, 
  getPaginationParams, 
  calculatePagination, 
  getSortParams,
  successResponse,
  paginatedResponse,
  calculateTestScore
} from '../utils/helpers';
import { AppError, asyncHandler } from '../middleware/errorHandler';

class TestResultController {
  // Create/Submit test result
  createTestResult = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const resultData: CreateTestResultRequest = req.body;
    
    // Verify candidate, test, and job exist
    const candidate = await database.users.findOne({ 
      _id: toObjectId(resultData.candidateId), 
      role: 'candidate' 
    });
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const test = await database.tests.findOne({ _id: toObjectId(resultData.testId) });
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    const job = await database.jobs.findOne({ _id: toObjectId(resultData.jobId) });
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Check if result already exists
    const existingResult = await database.testResults.findOne({
      candidateId: toObjectId(resultData.candidateId),
      testId: toObjectId(resultData.testId),
      jobId: toObjectId(resultData.jobId)
    });
    if (existingResult) {
      throw new AppError('Test result already exists for this candidate', 409);
    }

    // Get questions to validate answers and calculate scores
    const questionIds = resultData.answers.map(a => toObjectId(a.questionId));
    const questions = await database.questions.find({ 
      _id: { $in: questionIds } 
    }).toArray();

    // Calculate scores for each answer
    const processedAnswers = resultData.answers.map(answer => {
      const question = questions.find(q => q._id!.toString() === answer.questionId);
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 404);
      }

      const isCorrect = question.correctAnswer ? 
        answer.answer === question.correctAnswer : 
        false; // For non-MCQ questions, manual grading needed

      return {
        questionId: toObjectId(answer.questionId),
        answer: answer.answer,
        isCorrect,
        score: isCorrect ? 5 : 0 // Default 5 points per correct answer
      };
    });

    const totalScore = calculateTestScore(processedAnswers, questions);

    const newTestResult: ITestResult = {
      candidateId: toObjectId(resultData.candidateId),
      testId: toObjectId(resultData.testId),
      jobId: toObjectId(resultData.jobId),
      answers: processedAnswers,
      totalScore,
      startedAt: new Date(), // In real app, this would be stored when test starts
      submittedAt: new Date(),
      status: 'completed'
    };

    const result = await database.testResults.insertOne(newTestResult);
    const createdResult = await database.testResults.findOne({ _id: result.insertedId });

    const response: ApiResponse<ITestResult> = successResponse(createdResult!, 'Test result submitted successfully');
    res.status(201).json(response);
  });

  // Get all test results with pagination and filtering
  getTestResults = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { submittedAt: -1 });
    const { candidateId, testId, jobId, status } = req.query;

    // Build filter
    let filter: any = {};
    
    if (candidateId) {
      filter.candidateId = toObjectId(candidateId as string);
    }

    if (testId) {
      filter.testId = toObjectId(testId as string);
    }

    if (jobId) {
      filter.jobId = toObjectId(jobId as string);
    }

    if (status) {
      filter.status = status;
    }

    // Get total count for pagination
    const total = await database.testResults.countDocuments(filter);
    
    // Get test results with related data
    const results = await database.testResults.aggregate([
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
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test',
          pipeline: [
            { $project: { title: 1, duration: 1 } }
          ]
        }
      },
      { $unwind: '$test' },
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
    const response: PaginatedResponse = paginatedResponse(results, pagination);
    res.json(response);
  });

  // Get test result by ID
  getTestResultById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const results = await database.testResults.aggregate([
      { $match: { _id: toObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidate',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$candidate' },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test'
        }
      },
      { $unwind: '$test' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'questions',
          localField: 'answers.questionId',
          foreignField: '_id',
          as: 'questionDetails'
        }
      }
    ]).toArray();

    if (results.length === 0) {
      throw new AppError('Test result not found', 404);
    }

    const response: ApiResponse = successResponse(results[0]);
    res.json(response);
  });

  // Get test results by candidate
  getTestResultsByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { submittedAt: -1 });

    const filter = { candidateId: toObjectId(candidateId) };
    const total = await database.testResults.countDocuments(filter);
    
    const results = await database.testResults.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test',
          pipeline: [
            { $project: { title: 1, duration: 1 } }
          ]
        }
      },
      { $unwind: '$test' },
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
    const response: PaginatedResponse = paginatedResponse(results, pagination);
    res.json(response);
  });

  // Get test results by test
  getTestResultsByTest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { testId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { totalScore: -1 }); // Sort by score by default

    const filter = { testId: toObjectId(testId) };
    const total = await database.testResults.countDocuments(filter);
    
    const results = await database.testResults.aggregate([
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
            { $project: { name: 1, email: 1 } }
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
    const response: PaginatedResponse = paginatedResponse(results, pagination);
    res.json(response);
  });

  // Delete test result
  deleteTestResult = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await database.testResults.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Test result not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Test result deleted successfully');
    res.json(response);
  });

  // Get test result statistics
  getTestResultStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const scoreDistribution = await database.testResults.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$totalScore', 40] }, then: '0-39%' },
                { case: { $lt: ['$totalScore', 60] }, then: '40-59%' },
                { case: { $lt: ['$totalScore', 80] }, then: '60-79%' },
                { case: { $gte: ['$totalScore', 80] }, then: '80-100%' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const averageScores = await database.testResults.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          lowestScore: { $min: '$totalScore' }
        }
      }
    ]).toArray();

    const statusStats = await database.testResults.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const totalResults = await database.testResults.countDocuments();

    const response: ApiResponse = successResponse({
      totalResults,
      scoreDistribution,
      averageScore: averageScores[0]?.averageScore || 0,
      highestScore: averageScores[0]?.highestScore || 0,
      lowestScore: averageScores[0]?.lowestScore || 0,
      statusBreakdown: statusStats
    });
    res.json(response);
  });
}

export default new TestResultController();