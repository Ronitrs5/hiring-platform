import { Router } from 'express';
import userRoutes from './userRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import questionRoutes from './questionRoutes';
import testRoutes from './testRoutes';
import testResultRoutes from './testResultRoutes';
import interviewRoutes from './interviewRoutes';
import evaluationRoutes from './evaluationRoutes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Hiring Platform API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Hiring Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', testRoutes);
router.use('/test-results', testResultRoutes);
router.use('/interviews', interviewRoutes);
router.use('/evaluations', evaluationRoutes);

export default router;