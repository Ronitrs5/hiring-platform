import { Request, Response } from 'express';
import { database } from '../config/database';
import { IEvaluation, CreateEvaluationRequest, ApiResponse, PaginatedResponse } from '../models/interfaces';
import { 
  toObjectId, 
  getPaginationParams, 
  calculatePagination, 
  getSortParams,
  successResponse,
  paginatedResponse 
} from '../utils/helpers';
import { AppError, asyncHandler } from '../middleware/errorHandler';

class EvaluationController {
  // Create a new evaluation
  createEvaluation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const evaluationData: CreateEvaluationRequest = req.body;
    
    // Verify candidate and job exist
    const candidate = await database.users.findOne({ 
      _id: toObjectId(evaluationData.candidateId), 
      role: 'candidate' 
    });
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const job = await database.jobs.findOne({ _id: toObjectId(evaluationData.jobId) });
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Check if candidate has applied for this job
    const application = await database.applications.findOne({
      candidateId: toObjectId(evaluationData.candidateId),
      jobId: toObjectId(evaluationData.jobId)
    });
    if (!application) {
      throw new AppError('Candidate has not applied for this job', 400);
    }

    // Check if evaluation already exists for this candidate-job combination
    const existingEvaluation = await database.evaluations.findOne({
      candidateId: toObjectId(evaluationData.candidateId),
      jobId: toObjectId(evaluationData.jobId)
    });
    if (existingEvaluation) {
      throw new AppError('Evaluation already exists for this candidate and job', 400);
    }

    const newEvaluation: IEvaluation = {
      candidateId: toObjectId(evaluationData.candidateId),
      jobId: toObjectId(evaluationData.jobId),
      testScore: evaluationData.testScore || 0,
      interviewScores: evaluationData.interviewScores.map(score => ({
        round: score.round,
        score: score.score,
        interviewerId: toObjectId(score.interviewerId)
      })),
      finalDecision: evaluationData.finalDecision,
      comments: evaluationData.comments || '',
      updatedAt: new Date()
    };

    const result = await database.evaluations.insertOne(newEvaluation);
    const createdEvaluation = await database.evaluations.findOne({ _id: result.insertedId });

    const response: ApiResponse<IEvaluation> = successResponse(createdEvaluation!, 'Evaluation created successfully');
    res.status(201).json(response);
  });

  // Get all evaluations with pagination and filtering
  getEvaluations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { createdAt: -1 }); // Default: newest first
    const { candidateId, jobId, finalDecision, evaluatedBy } = req.query;

    // Build filter
    let filter: any = {};
    
    if (candidateId) {
      filter.candidateId = toObjectId(candidateId as string);
    }

    if (jobId) {
      filter.jobId = toObjectId(jobId as string);
    }

    if (finalDecision) {
      filter.finalDecision = finalDecision;
    }

    if (evaluatedBy) {
      filter.evaluatedBy = toObjectId(evaluatedBy as string);
    }

    // Get total count for pagination
    const total = await database.evaluations.countDocuments(filter);
    
    // Get evaluations with related data
    const evaluations = await database.evaluations.aggregate([
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
          localField: 'evaluatedBy',
          foreignField: '_id',
          as: 'evaluator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$evaluator' },
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
    const response: PaginatedResponse = paginatedResponse(evaluations, pagination);
    res.json(response);
  });

  // Get evaluation by ID
  getEvaluationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const evaluations = await database.evaluations.aggregate([
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
          localField: 'evaluatedBy',
          foreignField: '_id',
          as: 'evaluator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$evaluator' },
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
          from: 'interviews',
          let: { candidateId: '$candidateId', jobId: '$jobId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$candidateId', '$$candidateId'] },
                    { $eq: ['$jobId', '$$jobId'] }
                  ]
                }
              }
            },
            { $sort: { scheduledAt: 1 } }
          ],
          as: 'interviews'
        }
      },
      {
        $lookup: {
          from: 'testResults',
          let: { candidateId: '$candidateId', jobId: '$jobId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$candidateId', '$$candidateId'] },
                    { $eq: ['$jobId', '$$jobId'] }
                  ]
                }
              }
            }
          ],
          as: 'testResults'
        }
      }
    ]).toArray();

    if (evaluations.length === 0) {
      throw new AppError('Evaluation not found', 404);
    }

    const response: ApiResponse = successResponse(evaluations[0]);
    res.json(response);
  });

  // Update evaluation
  updateEvaluation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = req.body;

    // Convert string IDs to ObjectIds if provided
    if (updateData.candidateId) {
      updateData.candidateId = toObjectId(updateData.candidateId);
    }
    if (updateData.jobId) {
      updateData.jobId = toObjectId(updateData.jobId);
    }
    if (updateData.interviewScores) {
      updateData.interviewScores = updateData.interviewScores.map((score: any) => ({
        round: score.round,
        score: score.score,
        interviewerId: toObjectId(score.interviewerId)
      }));
    }

    updateData.updatedAt = new Date();

    const result = await database.evaluations.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Evaluation not found', 404);
    }

    const response: ApiResponse<IEvaluation> = successResponse(result, 'Evaluation updated successfully');
    res.json(response);
  });

  // Delete evaluation
  deleteEvaluation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await database.evaluations.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      throw new AppError('Evaluation not found', 404);
    }

    const response: ApiResponse = successResponse(null, 'Evaluation deleted successfully');
    res.json(response);
  });

  // Get evaluations by candidate
  getEvaluationsByCandidate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { createdAt: -1 });

    const filter = { candidateId: toObjectId(candidateId) };
    const total = await database.evaluations.countDocuments(filter);
    
    const evaluations = await database.evaluations.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'evaluatedBy',
          foreignField: '_id',
          as: 'evaluator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$evaluator' },
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
    const response: PaginatedResponse = paginatedResponse(evaluations, pagination);
    res.json(response);
  });

  // Get evaluations by job
  getEvaluationsByJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, { overallScore: -1 }); // Default: highest scores first

    const filter = { jobId: toObjectId(jobId) };
    const total = await database.evaluations.countDocuments(filter);
    
    const evaluations = await database.evaluations.aggregate([
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
          localField: 'evaluatedBy',
          foreignField: '_id',
          as: 'evaluator',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$evaluator' }
    ]).toArray();

    const pagination = calculatePagination(total, page, limit);
    const response: PaginatedResponse = paginatedResponse(evaluations, pagination);
    res.json(response);
  });

  // Get evaluation statistics
  getEvaluationStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const decisionStats = await database.evaluations.aggregate([
      {
        $group: {
          _id: '$finalDecision',
          count: { $sum: 1 },
          averageScore: { $avg: '$testScore' }
        }
      }
    ]).toArray();

    const scoreDistribution = await database.evaluations.aggregate([
      {
        $bucket: {
          groupBy: '$testScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();

    const recentEvaluations = await database.evaluations.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const averageScore = await database.evaluations.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$testScore' },
          totalEvaluations: { $sum: 1 }
        }
      }
    ]).toArray();

    const topPerformers = await database.evaluations.aggregate([
      { $match: { finalDecision: 'selected' } },
      { $sort: { testScore: -1 } },
      { $limit: 10 },
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

    const response: ApiResponse = successResponse({
      totalEvaluations: averageScore[0]?.totalEvaluations || 0,
      averageScore: averageScore[0]?.averageScore || 0,
      recentEvaluations,
      decisionBreakdown: decisionStats,
      scoreDistribution,
      topPerformers
    });
    res.json(response);
  });

  // Get comprehensive candidate evaluation (all related data)
  getCandidateEvaluationSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { candidateId, jobId } = req.params;

    // Get evaluation
    const evaluation = await database.evaluations.findOne({
      candidateId: toObjectId(candidateId),
      jobId: toObjectId(jobId)
    });

    if (!evaluation) {
      throw new AppError('Evaluation not found for this candidate and job', 404);
    }

    // Get related data in parallel
    const [candidate, job, interviews, testResults, application] = await Promise.all([
      database.users.findOne({ _id: toObjectId(candidateId) }),
      database.jobs.findOne({ _id: toObjectId(jobId) }),
      database.interviews.find({
        candidateId: toObjectId(candidateId),
        jobId: toObjectId(jobId)
      }).sort({ scheduledAt: 1 }).toArray(),
      database.testResults.find({
        candidateId: toObjectId(candidateId),
        jobId: toObjectId(jobId)
      }).toArray(),
      database.applications.findOne({
        candidateId: toObjectId(candidateId),
        jobId: toObjectId(jobId)
      })
    ]);

    const summary = {
      evaluation,
      candidate: {
        name: candidate?.name,
        email: candidate?.email,
        phone: candidate?.phone,
        resumeUrl: candidate?.resumeUrl
      },
      job: {
        title: job?.title,
        department: job?.department,
        description: job?.description
      },
      application: {
        status: application?.status,
        appliedAt: application?.appliedAt
      },
      interviews: interviews.map(interview => ({
        round: interview.round,
        scheduledAt: interview.scheduledAt,
        status: interview.status,
        feedback: interview.feedback,
        rating: interview.rating
      })),
      testResults: testResults.map(result => ({
        totalScore: result.totalScore,
        submittedAt: result.submittedAt,
        status: result.status,
        answers: result.answers?.length || 0
      }))
    };

    const response: ApiResponse = successResponse(summary);
    res.json(response);
  });
}

export default new EvaluationController();