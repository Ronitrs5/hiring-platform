import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { database } from './config/database';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors(config.cors));
    
    // Rate limiting
    const limiter = rateLimit(config.rateLimit);
    this.app.use('/api/', limiter);
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging middleware
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Setup Swagger documentation
    setupSwagger(this.app);
    
    // API routes
    this.app.use('/api/v1', routes);
    
    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Welcome to Hiring Platform API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
          users: '/api/v1/users',
          jobs: '/api/v1/jobs',
          applications: '/api/v1/applications',
          questions: '/api/v1/questions'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await database.connect();
      
      // Create database indexes
      await database.createIndexes();
      
      // Start the server
      const port = config.port;
      this.app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`📱 Environment: ${config.nodeEnv}`);
        console.log(`🔗 API URL: http://localhost:${port}/api/v1`);
        console.log(`📋 Health Check: http://localhost:${port}/api/v1/health`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await database.disconnect();
      console.log('🛑 Server stopped gracefully');
    } catch (error) {
      console.error('❌ Error stopping server:', error);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Create server instance
const server = new Server();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📋 SIGTERM received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📋 SIGINT received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  server.start();
}

export default server;