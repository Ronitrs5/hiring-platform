import { Router } from 'express';
import userController from '../controllers/userController';
import { validateRequest, userSchemas, validateObjectId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 enum: [candidate, admin]
 *                 example: "candidate"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               resumeUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/resume.pdf"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User with email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', 
  validateRequest(userSchemas.create),
  userController.createUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: role
 *         in: query
 *         description: Filter by user role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [candidate, admin]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  userController.getUsers
);

/**
 * @swagger
 * /users/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: List of candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/candidates', 
  userController.getCandidates
);

/**
 * @swagger
 * /users/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: List of admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/admins', 
  userController.getAdmins
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { error } = validateObjectId.validate(id);
    if (error) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }
    next();
  }),
  userController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Updated"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               resumeUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/updated-resume.pdf"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { error } = validateObjectId.validate(id);
    if (error) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }
    next();
  }),
  validateRequest(userSchemas.update),
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { error } = validateObjectId.validate(id);
    if (error) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }
    next();
  }),
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/applications:
 *   get:
 *     summary: Get user's applications
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: User applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/applications', 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { error } = validateObjectId.validate(id);
    if (error) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }
    next();
  }),
  userController.getUserApplications
);

export default router;