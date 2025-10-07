import { Router } from 'express';
import evaluationController from '../controllers/evaluationController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createEvaluationSchema = Joi.object({
  candidateId: Joi.string().hex().length(24).required(),
  jobId: Joi.string().hex().length(24).required(),
  testScore: Joi.number().min(0).max(100),
  interviewScores: Joi.array().items(
    Joi.object({
      round: Joi.string().required(),
      score: Joi.number().min(0).max(100).required(),
      interviewerId: Joi.string().hex().length(24).required()
    })
  ).required(),
  finalDecision: Joi.string().valid('selected', 'rejected', 'on-hold').required(),
  comments: Joi.string().max(2000)
});

const updateEvaluationSchema = Joi.object({
  testScore: Joi.number().min(0).max(100),
  interviewScores: Joi.array().items(
    Joi.object({
      round: Joi.string().required(),
      score: Joi.number().min(0).max(100).required(),
      interviewerId: Joi.string().hex().length(24).required()
    })
  ),
  finalDecision: Joi.string().valid('selected', 'rejected', 'on-hold'),
  comments: Joi.string().max(2000)
});

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Create a new evaluation
 *     tags: [Evaluations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - jobId
 *               - interviewScores
 *               - finalDecision
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the candidate
 *               jobId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the job
 *               testScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Test score (0-100)
 *               interviewScores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     round:
 *                       type: string
 *                       description: Interview round name
 *                     score:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Interview score (0-100)
 *                     interviewerId:
 *                       type: string
 *                       format: objectId
 *                       description: ID of the interviewer
 *                 description: Array of interview scores
 *               finalDecision:
 *                 type: string
 *                 enum: [selected, rejected, on-hold]
 *                 description: Final hiring decision
 *               comments:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Additional comments
 *     responses:
 *       201:
 *         description: Evaluation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input or evaluation already exists
 *       404:
 *         description: Candidate, job not found, or no application exists
 */
router.post('/', validateRequest(createEvaluationSchema), evaluationController.createEvaluation);

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Get all evaluations with pagination and filtering
 *     tags: [Evaluations]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *       - in: query
 *         name: candidateId
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filter by candidate ID
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filter by job ID
 *       - in: query
 *         name: finalDecision
 *         schema:
 *           type: string
 *           enum: [selected, rejected, on-hold]
 *         description: Filter by final decision
 *       - in: query
 *         name: evaluatedBy
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filter by evaluator ID
 *     responses:
 *       200:
 *         description: List of evaluations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', evaluationController.getEvaluations);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Get evaluation by ID with comprehensive details
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Evaluation ID
 *     responses:
 *       200:
 *         description: Evaluation retrieved successfully with related data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Evaluation not found
 */
router.get('/:id', evaluationController.getEvaluationById);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     summary: Update evaluation
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Evaluation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Updated test score
 *               interviewScores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     round:
 *                       type: string
 *                       description: Interview round name
 *                     score:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Interview score
 *                     interviewerId:
 *                       type: string
 *                       format: objectId
 *                       description: Interviewer ID
 *                 description: Updated interview scores
 *               finalDecision:
 *                 type: string
 *                 enum: [selected, rejected, on-hold]
 *                 description: Updated final decision
 *               comments:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Updated comments
 *     responses:
 *       200:
 *         description: Evaluation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Evaluation not found
 */
router.put('/:id', validateRequest(updateEvaluationSchema), evaluationController.updateEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: Delete evaluation
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Evaluation ID
 *     responses:
 *       200:
 *         description: Evaluation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Evaluation not found
 */
router.delete('/:id', evaluationController.deleteEvaluation);

/**
 * @swagger
 * /api/evaluations/candidate/{candidateId}:
 *   get:
 *     summary: Get evaluations by candidate
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Candidate ID
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *     responses:
 *       200:
 *         description: Candidate evaluations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/candidate/:candidateId', evaluationController.getEvaluationsByCandidate);

/**
 * @swagger
 * /api/evaluations/job/{jobId}:
 *   get:
 *     summary: Get evaluations by job (ranking candidates)
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Job ID
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *     responses:
 *       200:
 *         description: Job evaluations retrieved successfully (sorted by scores)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/job/:jobId', evaluationController.getEvaluationsByJob);

/**
 * @swagger
 * /api/evaluations/stats:
 *   get:
 *     summary: Get evaluation statistics and analytics
 *     tags: [Evaluations]
 *     responses:
 *       200:
 *         description: Evaluation statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalEvaluations:
 *                           type: number
 *                           description: Total number of evaluations
 *                         averageScore:
 *                           type: number
 *                           description: Average test score across all evaluations
 *                         recentEvaluations:
 *                           type: number
 *                           description: Number of evaluations in the last 30 days
 *                         decisionBreakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Final decision
 *                               count:
 *                                 type: number
 *                                 description: Number of evaluations with this decision
 *                               averageScore:
 *                                 type: number
 *                                 description: Average score for this decision
 *                         scoreDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Score range
 *                               count:
 *                                 type: number
 *                                 description: Number of evaluations in this range
 *                         topPerformers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             description: Top 10 selected candidates with highest scores
 */
router.get('/stats', evaluationController.getEvaluationStats);

/**
 * @swagger
 * /api/evaluations/summary/{candidateId}/{jobId}:
 *   get:
 *     summary: Get comprehensive candidate evaluation summary
 *     tags: [Evaluations]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Candidate ID
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Comprehensive evaluation summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         evaluation:
 *                           $ref: '#/components/schemas/Evaluation'
 *                         candidate:
 *                           type: object
 *                           description: Candidate information
 *                         job:
 *                           type: object
 *                           description: Job information
 *                         application:
 *                           type: object
 *                           description: Application details
 *                         interviews:
 *                           type: array
 *                           description: All interviews for this candidate-job combination
 *                         testResults:
 *                           type: array
 *                           description: All test results for this candidate-job combination
 *       404:
 *         description: Evaluation not found for this candidate and job
 */
router.get('/summary/:candidateId/:jobId', evaluationController.getCandidateEvaluationSummary);

export default router;