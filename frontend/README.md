# Hiring Platform - React Frontend

A comprehensive React-based frontend application for the hiring platform that integrates with the backend APIs to provide a complete recruitment management system.

## 🌟 Features

### Admin Dashboard
- **Job Management**: Create, edit, delete, and manage job postings
- **Candidate Overview**: View all candidates and their application statuses
- **Analytics Dashboard**: View statistics and hiring metrics
- **Real-time Status Updates**: Track candidate progress through interview loops

### Candidate Portal
- **Job Applications**: View assigned jobs and application status
- **Interview Loop Tracking**: Visual representation of hiring process (OA → Apti → Interviews)
- **Online Testing**: Take Online Assessments and Aptitude tests
- **Progress Monitoring**: Track application status and next steps

### Interviewer Dashboard
- **Interview Management**: View upcoming and completed interviews
- **Candidate Evaluation**: Access candidate profiles and test scores
- **Feedback System**: Provide ratings and detailed feedback
- **Performance Analytics**: Review interview history and ratings

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Alert.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Pagination.tsx
│   │   └── layout/          # Layout components
│   │       └── Header.tsx
│   ├── contexts/            # React Context for state management
│   │   └── AppContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── index.ts
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── JobList.tsx
│   │   │   ├── CreateJob.tsx
│   │   │   ├── EditJob.tsx
│   │   │   └── CandidateList.tsx
│   │   ├── candidate/       # Candidate pages
│   │   │   ├── CandidateJobs.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   └── TakeTest.tsx
│   │   ├── interviewer/     # Interviewer pages
│   │   │   ├── InterviewerDashboard.tsx
│   │   │   └── CandidateInterview.tsx
│   │   └── Home.tsx
│   ├── services/            # API service layer
│   │   ├── api.ts
│   │   ├── userService.ts
│   │   ├── jobService.ts
│   │   ├── testService.ts
│   │   ├── interviewService.ts
│   │   ├── applicationService.ts
│   │   └── index.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:3001`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiring-platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the frontend root:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🔧 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API with useReducer
- **HTTP Client**: Axios
- **Styling**: Custom CSS with responsive design
- **Form Handling**: Custom form hooks with validation
- **Component Architecture**: Functional components with hooks

## 📱 Key Features Implementation

### 1. Dynamic Routing
- Role-based routing for Admin, Candidate, and Interviewer
- Protected routes and navigation
- URL parameters for dynamic content

### 2. State Management
```typescript
// Global state with Context API
const { state, dispatch } = useAppContext();

// Local component state with custom hooks
const { values, errors, handleChange, validate } = useForm(initialValues, validationSchema);
```

### 3. API Integration
```typescript
// Service layer with error handling
const response = await JobService.getJobs({ page: 1, limit: 10 });
```

### 4. Form Validation
- Real-time validation
- Custom validation schemas
- Error handling and user feedback

### 5. Responsive Design
- Mobile-first approach
- Flexible grid system
- Responsive tables and components

## 🎯 User Workflows

### Admin Workflow
1. **Dashboard Overview**: View statistics and recent activities
2. **Job Management**: Create/edit jobs with requirements
3. **Candidate Monitoring**: Track candidate progress and scores
4. **Interview Coordination**: Monitor interview schedules and feedback

### Candidate Workflow
1. **View Applications**: See assigned jobs and their status
2. **Job Details**: Review job requirements and interview process
3. **Take Tests**: Complete online assessments and aptitude tests
4. **Track Progress**: Monitor application status through interview loop

### Interviewer Workflow
1. **Dashboard**: View scheduled and completed interviews
2. **Candidate Review**: Access candidate profiles and test scores
3. **Conduct Interviews**: Provide ratings and detailed feedback
4. **Performance Tracking**: Review interview history and analytics

## 🔄 API Integration

The frontend integrates with the backend through a comprehensive service layer:

- **User Management**: Registration, profile management, role-based access
- **Job Operations**: CRUD operations for job postings
- **Application Tracking**: Status updates and progress monitoring
- **Test Management**: Online test delivery and result processing
- **Interview System**: Scheduling, feedback, and evaluation
- **Analytics**: Real-time statistics and reporting

## 🎨 UI/UX Features

- **Intuitive Navigation**: Clear role-based navigation
- **Visual Status Indicators**: Color-coded status badges and progress indicators
- **Interactive Forms**: Real-time validation and error handling
- **Responsive Tables**: Mobile-friendly data presentation
- **Loading States**: Smooth loading animations and error handling
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Customization

### Adding New Pages
1. Create component in appropriate `pages/` subdirectory
2. Add route in `App.tsx`
3. Update navigation in `Header.tsx`

### Extending API Services
1. Add new service methods in `services/`
2. Update type definitions in `types/index.ts`
3. Implement in components with error handling

### Styling Customization
- Modify `index.css` for global styles
- Use CSS custom properties for theming
- Responsive breakpoints defined in media queries

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Integration with Backend

This frontend is designed to work seamlessly with the hiring platform backend. Ensure the backend server is running and accessible at the configured API URL.

For backend setup instructions, refer to the backend README file.