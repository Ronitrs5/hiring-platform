import { Router } from 'express';
import jobController from '../controllers/jobController';
import { validateRequest, jobSchemas } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - department
 *               - location
 *               - description
 *               - requirements
 *               - createdBy
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Frontend Developer"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               location:
 *                 type: string
 *                 example: "Remote"
 *               description:
 *                 type: string
 *                 example: "We are looking for a skilled Frontend Developer..."
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "TypeScript", "3+ years experience"]
 *               createdBy:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  validateRequest(jobSchemas.create),
  jobController.createJob
);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with pagination and filtering
 *     tags: [Jobs]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: department
 *         in: query
 *         description: Filter by department
 *         required: false
 *         schema:
 *           type: string
 *           example: "Engineering"
 *       - name: location
 *         in: query
 *         description: Filter by location
 *         required: false
 *         schema:
 *           type: string
 *           example: "Remote"
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  jobController.getJobs
);

/**
 * @swagger
 * /jobs/stats:
 *   get:
 *     summary: Get job statistics
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job statistics retrieved successfully
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
 *                         overview:
 *                           type: object
 *                           properties:
 *                             totalJobs:
 *                               type: integer
 *                               example: 25
 *                             totalDepartments:
 *                               type: integer
 *                               example: 5
 *                             totalLocations:
 *                               type: integer
 *                               example: 3
 *                             departments:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Engineering", "Marketing", "Sales"]
 *                             locations:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Remote", "New York", "San Francisco"]
 *                         departmentBreakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Engineering"
 *                               count:
 *                                 type: integer
 *                                 example: 15
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', 
  jobController.getJobStats
);

/**
 * @swagger
 * /jobs/department/{department}:
 *   get:
 *     summary: Get jobs by department
 *     tags: [Jobs]
 *     parameters:
 *       - name: department
 *         in: path
 *         required: true
 *         description: Department name
 *         schema:
 *           type: string
 *           example: "Engineering"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/department/:department', 
  jobController.getJobsByDepartment
);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', 
  jobController.getJobById
);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               location:
 *                 type: string
 *                 example: "Remote"
 *               description:
 *                 type: string
 *                 example: "Updated job description..."
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "TypeScript", "5+ years experience"]
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', 
  validateRequest(jobSchemas.update),
  jobController.updateJob
);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         description: Cannot delete job with existing applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', 
  jobController.deleteJob
);

/**
 * @swagger
 * /jobs/{id}/applications:
 *   get:
 *     summary: Get applications for a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         description: Filter applications by status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [applied, test-assigned, interview-scheduled, rejected, selected]
 *           example: "applied"
 *     responses:
 *       200:
 *         description: Job applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Application'
 *                           - type: object
 *                             properties:
 *                               candidate:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   phone:
 *                                     type: string
 *                                   resumeUrl:
 *                                     type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/applications', 
  jobController.getJobApplications
);

export default router;