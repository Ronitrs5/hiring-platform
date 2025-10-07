# Hiring Platform Server

A comprehensive Node.js + Express + TypeScript server for a hiring platform with MongoDB integration.

## 🚀 Features

- **Complete CRUD Operations** for all hiring platform entities
- **MongoDB Integration** with proper indexing and relationships
- **TypeScript** for type safety and better development experience
- **Input Validation** using Joi schemas
- **Error Handling** with custom error classes and middleware
- **Rate Limiting** and security middlewares
- **Pagination** and filtering for all list endpoints
- **RESTful API** design with proper HTTP status codes
- **Environment Configuration** for different deployment environments
- **Swagger UI Documentation** with interactive API explorer

## 📊 Collections & Schemas

### Users Collection
- Candidates and admin profiles
- Role-based access control
- Applied jobs tracking

### Jobs Collection
- Job postings with requirements
- Department and location filtering
- Creator tracking

### Applications Collection
- Candidate job applications
- Status tracking (applied, test-assigned, interview-scheduled, rejected, selected)
- Relationship with users and jobs

### Questions Collection
- Question bank for tests
- Multiple question types (MCQ, Coding, Descriptive)
- Difficulty levels and tagging system

### Tests Collection
- Test configuration linking questions
- Duration and job association

### Test Results Collection
- Individual test performance
- Score calculation and tracking

### Interviews Collection
- Interview scheduling and feedback
- Round-based tracking with ratings

### Evaluations Collection
- Final hiring decisions
- Aggregated scores from tests and interviews

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hiring-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other configurations
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system or update the connection string in .env

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## � API Documentation

### Interactive Documentation
The API includes a comprehensive Swagger UI documentation that provides:
- **Interactive API Explorer** - Test endpoints directly from the browser
- **Request/Response Examples** - See exactly what data to send and expect
- **Schema Definitions** - Complete data models for all entities
- **Authentication Examples** - How to authenticate requests
- **Error Response Examples** - Understanding error codes and messages

Access the documentation at: **`http://localhost:3000/api-docs`**

### Alternative Documentation Formats
- **JSON Format**: `http://localhost:3000/swagger.json`
- **Health Check**: `http://localhost:3000/api/v1/health`

## �📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Users Endpoints
- `POST /users` - Create a new user
- `GET /users` - Get all users with filtering
- `GET /users/candidates` - Get all candidates
- `GET /users/admins` - Get all admins
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/applications` - Get user's applications

### Jobs Endpoints
- `POST /jobs` - Create a new job
- `GET /jobs` - Get all jobs with filtering
- `GET /jobs/stats` - Get job statistics
- `GET /jobs/department/:department` - Get jobs by department
- `GET /jobs/:id` - Get job by ID
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `GET /jobs/:id/applications` - Get job applications

### Applications Endpoints
- `POST /applications` - Create a new application
- `GET /applications` - Get all applications with filtering
- `GET /applications/stats` - Get application statistics
- `GET /applications/candidate/:candidateId` - Get applications by candidate
- `GET /applications/job/:jobId` - Get applications by job
- `GET /applications/:id` - Get application by ID
- `PUT /applications/:id/status` - Update application status
- `DELETE /applications/:id` - Delete application

### Questions Endpoints
- `POST /questions` - Create a new question
- `GET /questions` - Get all questions with filtering
- `GET /questions/stats` - Get question statistics
- `GET /questions/tags` - Get all question tags
- `GET /questions/random` - Get random questions for tests
- `GET /questions/type/:type` - Get questions by type
- `GET /questions/difficulty/:difficulty` - Get questions by difficulty
- `GET /questions/by-tags` - Get questions by tags
- `GET /questions/:id` - Get question by ID
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

## 🔒 Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional additional context"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔧 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction (asc/desc)

### Filtering
- `search` - Text search across relevant fields
- `status` - Filter by status (for applications)
- `role` - Filter by role (for users)
- `department` - Filter by department (for jobs)
- `type` - Filter by type (for questions)
- `difficulty` - Filter by difficulty (for questions)
- `tags` - Filter by tags (for questions)

## 🗄️ Database Indexes

The server automatically creates optimized indexes for:
- User email (unique)
- Application candidate-job combination (unique)
- Job department and location
- Question type, difficulty, and tags
- Test results by candidate and test
- Interview scheduling and status

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** to prevent abuse
- **Input validation** with Joi schemas
- **Error handling** without exposing sensitive information

## 🧪 Testing

The codebase includes comprehensive TypeScript types and validation schemas for testing:

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/hiring-platform` |
| `JWT_SECRET` | JWT signing secret | (required in production) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Joi Validation](https://joi.dev/)