import { Request, Response } from 'express';
import { database } from '../config/database';
import { IQuestion, CreateQuestionRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
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

class QuestionController {
  // Create a new question
  createQuestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const questionData: CreateQuestionRequest = req.body;

    const newQuestion: IQuestion = {
      type: questionData.type,
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      difficulty: questionData.difficulty,
      tags: questionData.tags,
    };

    const result = await database.questions.insertOne(newQuestion);
    const createdQuestion = await database.questions.findOne({ _id: result.insertedId });

    const response: ApiResponse<IQuestion> = successResponse(createdQuestion!, 'Question created successfully');
    res.status(201).json(response);
  });

  // Get all questions with pagination and filtering
  getQuestions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);
    const { search, type, difficulty, tags } = req.query;

    // Build filter
    let filter: any = {};
    
    if (type) {
      filter.type = type;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      filter.tags = { $in: tagArray };
    }

    if (search) {
      const searchFilter = buildSearchFilter(search as string, ['questionText']);
      filter = { ...filter, ...searchFilter };
    }

    // Get total count for pagination
    const total = await database.questions.countDocuments(filter);
    
    // Get questions with pagination
    const questions = await database.questions
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IQuestion> = paginatedResponse(questions, pagination);
    res.json(response);
  });

  // Get question by ID
  getQuestionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const question = await database.questions.findOne({ _id: toObjectId(id) });
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const response: ApiResponse<IQuestion> = successResponse(question);
    res.json(response);
  });

  // Update question
  updateQuestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await database.questions.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Question not found', 404);
    }

    const response: ApiResponse<IQuestion> = successResponse(result, 'Question updated successfully');
    res.json(response);
  });

  // Delete question
  deleteQuestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Check if question is used in any tests
    const testCount = await database.tests.countDocuments({ 
      questions: toObjectId(id) 
    });
    
    if (testCount > 0) {
      throw new AppError('Cannot delete question that is used in tests', 400);
    }

    const result = await database.questions.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Question not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Question deleted successfully');
    res.json(response);
  });

  // Get questions by type
  getQuestionsByType = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);

    const validTypes = ['mcq', 'coding', 'descriptive'];
    if (!validTypes.includes(type)) {
      throw new AppError('Invalid question type', 400);
    }

    const filter = { type };
    const total = await database.questions.countDocuments(filter);
    const questions = await database.questions
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IQuestion> = paginatedResponse(questions, pagination);
    res.json(response);
  });

  // Get questions by difficulty
  getQuestionsByDifficulty = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { difficulty } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      throw new AppError('Invalid difficulty level', 400);
    }

    const filter = { difficulty };
    const total = await database.questions.countDocuments(filter);
    const questions = await database.questions
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IQuestion> = paginatedResponse(questions, pagination);
    res.json(response);
  });

  // Get questions by tags
  getQuestionsByTags = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tags } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req);

    if (!tags) {
      throw new AppError('Tags parameter is required', 400);
    }

    const tagArray = (tags as string).split(',');
    const filter = { tags: { $in: tagArray } };
    
    const total = await database.questions.countDocuments(filter);
    const questions = await database.questions
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse<IQuestion> = paginatedResponse(questions, pagination);
    res.json(response);
  });

  // Get random questions for test creation
  getRandomQuestions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { count = 10, type, difficulty, tags } = req.query;
    const questionCount = Math.min(parseInt(count as string), 50); // Max 50 questions

    // Build filter
    let filter: any = {};
    
    if (type) {
      filter.type = type;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      filter.tags = { $in: tagArray };
    }

    // Get random questions using aggregation
    const questions = await database.questions.aggregate([
      { $match: filter },
      { $sample: { size: questionCount } }
    ]).toArray();

    const response: ApiResponse<IQuestion[]> = successResponse(questions, `Retrieved ${questions.length} random questions`);
    res.json(response);
  });

  // Get question statistics
  getQuestionStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const typeStats = await database.questions.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const difficultyStats = await database.questions.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const tagStats = await database.questions.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray();

    const totalQuestions = await database.questions.countDocuments();

    const response: ApiResponse = successResponse({
      totalQuestions,
      typeBreakdown: typeStats,
      difficultyBreakdown: difficultyStats,
      popularTags: tagStats
    });
    res.json(response);
  });

  // Get all unique tags
  getAllTags = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tags = await database.questions.distinct('tags');
    
    const response: ApiResponse<string[]> = successResponse(tags.sort(), 'Retrieved all question tags');
    res.json(response);
  });
}

export default new QuestionController();