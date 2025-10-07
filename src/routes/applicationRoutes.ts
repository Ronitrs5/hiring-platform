import { Router } from 'express';
import applicationController from '../controllers/applicationController';
import { validateRequest, applicationSchemas } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - jobId
 *             properties:
 *               candidateId:
 *                 type: string
 *                 description: Candidate user ID
 *               jobId:
 *                 type: string
 *                 description: Job ID
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Application already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  validateRequest(applicationSchemas.create),
  applicationController.createApplication
);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get all applications with pagination and filtering
 *     tags: [Applications]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         description: Filter by application status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [applied, test-assigned, interview-scheduled, rejected, selected]
 *       - name: candidateId
 *         in: query
 *         description: Filter by candidate ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: jobId
 *         in: query
 *         description: Filter by job ID
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', 
  applicationController.getApplications
);

/**
 * @swagger
 * /applications/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Applications]
 *     responses:
 *       200:
 *         description: Application statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', 
  applicationController.getApplicationStats
);

/**
 * @swagger
 * /applications/candidate/{candidateId}:
 *   get:
 *     summary: Get applications by candidate
 *     tags: [Applications]
 *     parameters:
 *       - name: candidateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Candidate applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/candidate/:candidateId', 
  applicationController.getApplicationsByCandidate
);

/**
 * @swagger
 * /applications/job/{jobId}:
 *   get:
 *     summary: Get applications by job
 *     tags: [Applications]
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Job applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/job/:jobId', 
  applicationController.getApplicationsByJob
);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  applicationController.getApplicationById
);

/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [applied, test-assigned, interview-scheduled, rejected, selected]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Application'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id/status', 
  validateRequest(applicationSchemas.updateStatus),
  applicationController.updateApplicationStatus
);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Delete application
 *     tags: [Applications]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', 
  applicationController.deleteApplication
);

export default router;