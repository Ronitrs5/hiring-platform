import { MongoClient, Db, Collection } from 'mongodb';
import { config } from './config';
import { 
  IUser, 
  IJob, 
  IApplication, 
  ITest, 
  IQuestion, 
  ITestResult, 
  IInterview, 
  IEvaluation 
} from '../models/interfaces';

class DatabaseConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(config.mongodb.uri, config.mongodb.options);
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Collection getters with proper typing
  get users(): Collection<IUser> {
    return this.getDb().collection<IUser>('users');
  }

  get jobs(): Collection<IJob> {
    return this.getDb().collection<IJob>('jobs');
  }

  get applications(): Collection<IApplication> {
    return this.getDb().collection<IApplication>('applications');
  }

  get tests(): Collection<ITest> {
    return this.getDb().collection<ITest>('tests');
  }

  get questions(): Collection<IQuestion> {
    return this.getDb().collection<IQuestion>('questions');
  }

  get testResults(): Collection<ITestResult> {
    return this.getDb().collection<ITestResult>('testResults');
  }

  get interviews(): Collection<IInterview> {
    return this.getDb().collection<IInterview>('interviews');
  }

  get evaluations(): Collection<IEvaluation> {
    return this.getDb().collection<IEvaluation>('evaluations');
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.getDb().admin().ping();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Create indexes for better performance
  async createIndexes(): Promise<void> {
    try {
      // Users indexes
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.users.createIndex({ role: 1 });

      // Jobs indexes
      await this.jobs.createIndex({ createdBy: 1 });
      await this.jobs.createIndex({ department: 1 });
      await this.jobs.createIndex({ createdAt: -1 });

      // Applications indexes
      await this.applications.createIndex({ candidateId: 1 });
      await this.applications.createIndex({ jobId: 1 });
      await this.applications.createIndex({ status: 1 });
      await this.applications.createIndex({ candidateId: 1, jobId: 1 }, { unique: true });

      // Tests indexes
      await this.tests.createIndex({ jobId: 1 });
      await this.tests.createIndex({ createdBy: 1 });

      // Questions indexes
      await this.questions.createIndex({ type: 1 });
      await this.questions.createIndex({ difficulty: 1 });
      await this.questions.createIndex({ tags: 1 });

      // Test Results indexes
      await this.testResults.createIndex({ candidateId: 1 });
      await this.testResults.createIndex({ testId: 1 });
      await this.testResults.createIndex({ jobId: 1 });
      await this.testResults.createIndex({ status: 1 });

      // Interviews indexes
      await this.interviews.createIndex({ candidateId: 1 });
      await this.interviews.createIndex({ jobId: 1 });
      await this.interviews.createIndex({ interviewerId: 1 });
      await this.interviews.createIndex({ scheduledAt: 1 });
      await this.interviews.createIndex({ status: 1 });

      // Evaluations indexes
      await this.evaluations.createIndex({ candidateId: 1 });
      await this.evaluations.createIndex({ jobId: 1 });
      await this.evaluations.createIndex({ finalDecision: 1 });

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const database = new DatabaseConnection();

// Export for easier access in controllers
export { DatabaseConnection };