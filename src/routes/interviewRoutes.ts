import { Router } from 'express';
import interviewController from '../controllers/interviewController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createInterviewSchema = Joi.object({
  candidateId: Joi.string().hex().length(24).required(),
  jobId: Joi.string().hex().length(24).required(),
  interviewerId: Joi.string().hex().length(24).required(),
  round: Joi.string().required(),
  scheduledAt: Joi.date().greater('now').required()
});

const updateInterviewSchema = Joi.object({
  scheduledAt: Joi.date().greater('now'),
  status: Joi.string().valid('scheduled', 'completed', 'missed'),
  feedback: Joi.string().max(2000),
  rating: Joi.number().min(1).max(5),
  notes: Joi.string().max(1000)
});

/**
 * @swagger
 * /api/interviews:
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - jobId
 *               - interviewerId
 *               - round
 *               - scheduledAt
 *             properties:
 *               candidateId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the candidate
 *               jobId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the job
 *               interviewerId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the interviewer
 *               round:
 *                 type: string
 *                 description: Interview round (e.g., "Technical", "HR", "Final")
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled date and time for the interview
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input or candidate hasn't applied for the job
 *       404:
 *         description: Candidate, job, or interviewer not found
 */
router.post('/', validateRequest(createInterviewSchema), interviewController.createInterview);

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: Get all interviews with pagination and filtering
 *     tags: [Interviews]
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
 *         name: interviewerId
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filter by interviewer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, missed]
 *         description: Filter by interview status
 *       - in: query
 *         name: round
 *         schema:
 *           type: string
 *         description: Filter by interview round
 *     responses:
 *       200:
 *         description: List of interviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', interviewController.getInterviews);

/**
 * @swagger
 * /api/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Interview not found
 */
router.get('/:id', interviewController.getInterviewById);

/**
 * @swagger
 * /api/interviews/{id}:
 *   put:
 *     summary: Update interview (status, feedback, rating)
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: New scheduled date and time
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, missed]
 *                 description: Interview status
 *               feedback:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Interview feedback
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Interview rating (1-5)
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Interview not found
 */
router.put('/:id', validateRequest(updateInterviewSchema), interviewController.updateInterview);

/**
 * @swagger
 * /api/interviews/{id}:
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Interview not found
 */
router.delete('/:id', interviewController.deleteInterview);

/**
 * @swagger
 * /api/interviews/candidate/{candidateId}:
 *   get:
 *     summary: Get interviews by candidate
 *     tags: [Interviews]
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
 *         description: Candidate interviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/candidate/:candidateId', interviewController.getInterviewsByCandidate);

/**
 * @swagger
 * /api/interviews/interviewer/{interviewerId}:
 *   get:
 *     summary: Get interviews by interviewer
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: interviewerId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Interviewer ID
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/sortOrder'
 *     responses:
 *       200:
 *         description: Interviewer interviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/interviewer/:interviewerId', interviewController.getInterviewsByInterviewer);

/**
 * @swagger
 * /api/interviews/upcoming:
 *   get:
 *     summary: Get upcoming scheduled interviews
 *     tags: [Interviews]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Upcoming interviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/upcoming', interviewController.getUpcomingInterviews);

/**
 * @swagger
 * /api/interviews/stats:
 *   get:
 *     summary: Get interview statistics
 *     tags: [Interviews]
 *     responses:
 *       200:
 *         description: Interview statistics retrieved successfully
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
 *                         totalInterviews:
 *                           type: number
 *                           description: Total number of interviews
 *                         upcomingInterviews:
 *                           type: number
 *                           description: Number of upcoming scheduled interviews
 *                         completedWithRating:
 *                           type: number
 *                           description: Number of completed interviews with ratings
 *                         averageRating:
 *                           type: number
 *                           description: Average rating across all interviews
 *                         statusBreakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Interview status
 *                               count:
 *                                 type: number
 *                                 description: Number of interviews with this status
 *                         roundBreakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Interview round
 *                               count:
 *                                 type: number
 *                                 description: Number of interviews in this round
 *                               averageRating:
 *                                 type: number
 *                                 description: Average rating for this round
 */
router.get('/stats', interviewController.getInterviewStats);

export default router;