import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { config } from './config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hiring Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for managing hiring processes including users, jobs, applications, tests, and evaluations',
      contact: {
        name: 'API Support',
        email: 'support@hiringplatform.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.hiringplatform.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john.doe@example.com',
            },
            role: {
              type: 'string',
              enum: ['candidate', 'admin'],
              description: 'User role',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '+1234567890',
            },
            resumeUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to resume file',
            },
            appliedJobs: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of job IDs the user has applied to',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Job: {
          type: 'object',
          required: ['title', 'department', 'location', 'description', 'requirements', 'createdBy'],
          properties: {
            _id: {
              type: 'string',
              description: 'Job ID',
            },
            title: {
              type: 'string',
              description: 'Job title',
              example: 'Frontend Developer',
            },
            department: {
              type: 'string',
              description: 'Department',
              example: 'Engineering',
            },
            location: {
              type: 'string',
              description: 'Job location',
              example: 'Remote',
            },
            description: {
              type: 'string',
              description: 'Job description',
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Job requirements',
              example: ['React', 'TypeScript', '3+ years experience'],
            },
            createdBy: {
              type: 'string',
              description: 'Admin user ID who created the job',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Application: {
          type: 'object',
          required: ['candidateId', 'jobId'],
          properties: {
            _id: {
              type: 'string',
              description: 'Application ID',
            },
            candidateId: {
              type: 'string',
              description: 'Candidate user ID',
            },
            jobId: {
              type: 'string',
              description: 'Job ID',
            },
            status: {
              type: 'string',
              enum: ['applied', 'test-assigned', 'interview-scheduled', 'rejected', 'selected'],
              description: 'Application status',
            },
            appliedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Application submission timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Question: {
          type: 'object',
          required: ['type', 'questionText', 'difficulty', 'tags'],
          properties: {
            _id: {
              type: 'string',
              description: 'Question ID',
            },
            type: {
              type: 'string',
              enum: ['mcq', 'coding', 'descriptive'],
              description: 'Question type',
            },
            questionText: {
              type: 'string',
              description: 'The question text',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Answer options (for MCQ)',
            },
            correctAnswer: {
              type: 'string',
              description: 'Correct answer',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Question difficulty level',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Question tags',
              example: ['JavaScript', 'Frontend'],
            },
          },
        },
        Test: {
          type: 'object',
          required: ['title', 'questions', 'duration', 'createdBy'],
          properties: {
            _id: {
              type: 'string',
              description: 'Test ID',
            },
            title: {
              type: 'string',
              description: 'Test title',
              example: 'Frontend Developer Assessment',
            },
            jobId: {
              type: 'string',
              description: 'Associated job ID (optional)',
            },
            questions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of question IDs',
            },
            duration: {
              type: 'integer',
              description: 'Test duration in minutes',
              example: 60,
            },
            createdBy: {
              type: 'string',
              description: 'Admin user ID who created the test',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        Interview: {
          type: 'object',
          required: ['candidateId', 'jobId', 'interviewerId', 'round', 'scheduledAt'],
          properties: {
            _id: {
              type: 'string',
              description: 'Interview ID',
            },
            candidateId: {
              type: 'string',
              description: 'Candidate user ID',
            },
            jobId: {
              type: 'string',
              description: 'Job ID',
            },
            interviewerId: {
              type: 'string',
              description: 'Interviewer user ID',
            },
            round: {
              type: 'string',
              description: 'Interview round',
              example: 'Technical Round 1',
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Interview scheduled time',
            },
            feedback: {
              type: 'string',
              description: 'Interview feedback',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Interview rating (1-5)',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'missed'],
              description: 'Interview status',
            },
          },
        },
        TestResult: {
          type: 'object',
          required: ['candidateId', 'testId', 'jobId', 'answers'],
          properties: {
            _id: {
              type: 'string',
              description: 'Test result ID',
            },
            candidateId: {
              type: 'string',
              description: 'Candidate user ID',
            },
            testId: {
              type: 'string',
              description: 'Test ID',
            },
            jobId: {
              type: 'string',
              description: 'Job ID',
            },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionId: {
                    type: 'string',
                    description: 'Question ID',
                  },
                  answer: {
                    type: 'string',
                    description: 'Candidate answer',
                  },
                  isCorrect: {
                    type: 'boolean',
                    description: 'Whether the answer is correct',
                  },
                  score: {
                    type: 'integer',
                    description: 'Points scored for this answer',
                  },
                },
              },
              description: 'Array of answers with scores',
            },
            totalScore: {
              type: 'integer',
              description: 'Total score achieved',
              example: 85,
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Test start timestamp',
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Test submission timestamp',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed'],
              description: 'Test result status',
            },
          },
        },
        Evaluation: {
          type: 'object',
          required: ['candidateId', 'jobId', 'finalDecision'],
          properties: {
            _id: {
              type: 'string',
              description: 'Evaluation ID',
            },
            candidateId: {
              type: 'string',
              description: 'Candidate user ID',
            },
            jobId: {
              type: 'string',
              description: 'Job ID',
            },
            testScore: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Test score (percentage)',
              example: 85,
            },
            interviewScores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  round: {
                    type: 'string',
                    description: 'Interview round name',
                    example: 'Technical Round 1',
                  },
                  score: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    description: 'Interview score (1-5)',
                  },
                  interviewerId: {
                    type: 'string',
                    description: 'Interviewer user ID',
                  },
                },
              },
              description: 'Array of interview scores',
            },
            finalDecision: {
              type: 'string',
              enum: ['selected', 'rejected', 'on-hold'],
              description: 'Final hiring decision',
            },
            comments: {
              type: 'string',
              description: 'Additional comments about the evaluation',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Optional success message',
            },
            error: {
              type: 'string',
              description: 'Error message (when success is false)',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              type: 'array',
              items: {},
              description: 'Array of data items',
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number',
                },
                limit: {
                  type: 'integer',
                  description: 'Items per page',
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items',
                },
                pages: {
                  type: 'integer',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term',
          required: false,
          schema: {
            type: 'string',
          },
        },
        SortByParam: {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          required: false,
          schema: {
            type: 'string',
          },
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
        },
        IdParam: {
          name: 'id',
          in: 'path',
          description: 'Resource ID',
          required: true,
          schema: {
            type: 'string',
            pattern: '^[a-f\\d]{24}$',
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Resource not found',
              },
            },
          },
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Invalid input data',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Validation failed',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Internal server error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Jobs',
        description: 'Job posting operations',
      },
      {
        name: 'Applications',
        description: 'Job application operations',
      },
      {
        name: 'Questions',
        description: 'Question bank operations',
      },
      {
        name: 'Tests',
        description: 'Test management operations',
      },
      {
        name: 'Test Results',
        description: 'Test result and scoring operations',
      },
      {
        name: 'Interviews',
        description: 'Interview scheduling and management',
      },
      {
        name: 'Evaluations',
        description: 'Final candidate evaluation and decision tracking',
      },
      {
        name: 'Health',
        description: 'API health and status checks',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .scheme-container { margin: 20px 0 30px 0 }
    `,
    customSiteTitle: 'Hiring Platform API Documentation',
  };

  // Setup Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
  
  // Serve swagger.json
  app.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger UI available at: /api-docs');
  console.log('📄 Swagger JSON available at: /swagger.json');
};

export { specs };