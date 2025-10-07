import { Router } from 'express';
import questionController from '../controllers/questionController';
import { validateRequest, questionSchemas } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - questionText
 *               - difficulty
 *               - tags
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [mcq, coding, descriptive]
 *               questionText:
 *                 type: string
 *                 example: "What is a closure in JavaScript?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A function inside another function", "A loop", "A variable", "An object"]
 *               correctAnswer:
 *                 type: string
 *                 example: "A function inside another function"
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Frontend"]
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Question'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', 
  validateRequest(questionSchemas.create),
  questionController.createQuestion
);

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions with pagination and filtering
 *     tags: [Questions]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: type
 *         in: query
 *         description: Filter by question type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mcq, coding, descriptive]
 *       - name: difficulty
 *         in: query
 *         description: Filter by difficulty level
 *         required: false
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - name: tags
 *         in: query
 *         description: Filter by tags (comma-separated)
 *         required: false
 *         schema:
 *           type: string
 *           example: "JavaScript,Frontend"
 *     responses:
 *       200:
 *         description: List of questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', 
  questionController.getQuestions
);

/**
 * @swagger
 * /questions/stats:
 *   get:
 *     summary: Get question statistics
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Question statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', 
  questionController.getQuestionStats
);

/**
 * @swagger
 * /questions/tags:
 *   get:
 *     summary: Get all question tags
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: All question tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/tags', 
  questionController.getAllTags
);

/**
 * @swagger
 * /questions/random:
 *   get:
 *     summary: Get random questions for test creation
 *     tags: [Questions]
 *     parameters:
 *       - name: count
 *         in: query
 *         description: Number of random questions to retrieve
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - name: type
 *         in: query
 *         description: Filter by question type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mcq, coding, descriptive]
 *       - name: difficulty
 *         in: query
 *         description: Filter by difficulty level
 *         required: false
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - name: tags
 *         in: query
 *         description: Filter by tags (comma-separated)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Random questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/random', 
  questionController.getRandomQuestions
);

/**
 * @swagger
 * /questions/type/{type}:
 *   get:
 *     summary: Get questions by type
 *     tags: [Questions]
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mcq, coding, descriptive]
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Questions by type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid question type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/type/:type', 
  questionController.getQuestionsByType
);

/**
 * @swagger
 * /questions/difficulty/{difficulty}:
 *   get:
 *     summary: Get questions by difficulty
 *     tags: [Questions]
 *     parameters:
 *       - name: difficulty
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Questions by difficulty retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid difficulty level
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/difficulty/:difficulty', 
  questionController.getQuestionsByDifficulty
);

/**
 * @swagger
 * /questions/by-tags:
 *   get:
 *     summary: Get questions by tags
 *     tags: [Questions]
 *     parameters:
 *       - name: tags
 *         in: query
 *         description: Comma-separated list of tags
 *         required: true
 *         schema:
 *           type: string
 *           example: "JavaScript,Frontend"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Questions by tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Tags parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/by-tags', 
  questionController.getQuestionsByTags
);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Question'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  questionController.getQuestionById
);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update question
 *     tags: [Questions]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Question'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', 
  validateRequest(questionSchemas.update),
  questionController.updateQuestion
);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Cannot delete question that is used in tests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', 
  questionController.deleteQuestion
);

export default router;