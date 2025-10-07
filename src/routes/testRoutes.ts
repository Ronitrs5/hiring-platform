import { Router } from 'express';
import testController from '../controllers/testController';
import { validateRequest, testSchemas } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /tests:
 *   post:
 *     summary: Create a new test
 *     tags: [Tests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *               - duration
 *               - createdBy
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Frontend Developer Assessment"
 *               jobId:
 *                 type: string
 *                 description: Optional job ID to associate with the test
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of question IDs
 *                 example: ["64a1b2c3d4e5f6789012345a", "64a1b2c3d4e5f6789012345b"]
 *               duration:
 *                 type: integer
 *                 description: Test duration in minutes
 *                 example: 60
 *               createdBy:
 *                 type: string
 *                 description: Admin user ID who created the test
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Test'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Admin, job, or questions not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  validateRequest(testSchemas.create),
  testController.createTest
);

/**
 * @swagger
 * /tests:
 *   get:
 *     summary: Get all tests with pagination and filtering
 *     tags: [Tests]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: jobId
 *         in: query
 *         description: Filter by job ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: createdBy
 *         in: query
 *         description: Filter by creator ID
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', 
  testController.getTests
);

/**
 * @swagger
 * /tests/stats:
 *   get:
 *     summary: Get test statistics
 *     tags: [Tests]
 *     responses:
 *       200:
 *         description: Test statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', 
  testController.getTestStats
);

/**
 * @swagger
 * /tests/job/{jobId}:
 *   get:
 *     summary: Get tests by job
 *     tags: [Tests]
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
 *         description: Job tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/job/:jobId', 
  testController.getTestsByJob
);

/**
 * @swagger
 * /tests/{id}:
 *   get:
 *     summary: Get test by ID
 *     tags: [Tests]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Test retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Test'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  testController.getTestById
);

/**
 * @swagger
 * /tests/{id}:
 *   put:
 *     summary: Update test
 *     tags: [Tests]
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
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *     responses:
 *       200:
 *         description: Test updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Test'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', 
  validateRequest(testSchemas.update),
  testController.updateTest
);

/**
 * @swagger
 * /tests/{id}:
 *   delete:
 *     summary: Delete test
 *     tags: [Tests]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Cannot delete test that has results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', 
  testController.deleteTest
);

export default router;