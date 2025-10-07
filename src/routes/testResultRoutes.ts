import { Router } from 'express';
import testResultController from '../controllers/testResultController';
import { validateRequest, testResultSchemas } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /test-results:
 *   post:
 *     summary: Submit test result
 *     tags: [Test Results]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - testId
 *               - jobId
 *               - answers
 *             properties:
 *               candidateId:
 *                 type: string
 *                 description: Candidate user ID
 *               testId:
 *                 type: string
 *                 description: Test ID
 *               jobId:
 *                 type: string
 *                 description: Job ID
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       description: Question ID
 *                     answer:
 *                       type: string
 *                       description: Candidate's answer
 *                 example:
 *                   - questionId: "64a1b2c3d4e5f6789012345a"
 *                     answer: "A function inside another function"
 *                   - questionId: "64a1b2c3d4e5f6789012345b"
 *                     answer: "console.log('Hello World');"
 *     responses:
 *       201:
 *         description: Test result submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TestResult'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Candidate, test, job, or question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Test result already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  validateRequest(testResultSchemas.create),
  testResultController.createTestResult
);

/**
 * @swagger
 * /test-results:
 *   get:
 *     summary: Get all test results with pagination and filtering
 *     tags: [Test Results]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: candidateId
 *         in: query
 *         description: Filter by candidate ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: testId
 *         in: query
 *         description: Filter by test ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: jobId
 *         in: query
 *         description: Filter by job ID
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *     responses:
 *       200:
 *         description: List of test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', 
  testResultController.getTestResults
);

/**
 * @swagger
 * /test-results/stats:
 *   get:
 *     summary: Get test result statistics
 *     tags: [Test Results]
 *     responses:
 *       200:
 *         description: Test result statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', 
  testResultController.getTestResultStats
);

/**
 * @swagger
 * /test-results/candidate/{candidateId}:
 *   get:
 *     summary: Get test results by candidate
 *     tags: [Test Results]
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
 *         description: Candidate test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/candidate/:candidateId', 
  testResultController.getTestResultsByCandidate
);

/**
 * @swagger
 * /test-results/test/{testId}:
 *   get:
 *     summary: Get test results by test
 *     tags: [Test Results]
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/test/:testId', 
  testResultController.getTestResultsByTest
);

/**
 * @swagger
 * /test-results/{id}:
 *   get:
 *     summary: Get test result by ID
 *     tags: [Test Results]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TestResult'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  testResultController.getTestResultById
);

/**
 * @swagger
 * /test-results/{id}:
 *   delete:
 *     summary: Delete test result
 *     tags: [Test Results]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Test result deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', 
  testResultController.deleteTestResult
);

export default router;