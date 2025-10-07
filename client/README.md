# Hiring Platform - Frontend

A modern, clean React-based web application for managing the end-to-end hiring process. Built with TypeScript, Tailwind CSS, and React Router.

## 🚀 Features

### 👨‍💼 **Candidate Interface**
- **Login & Authentication** - Secure role-based access
- **Job Dashboard** - View shortlisted jobs and application status
- **Interview Loop Timeline** - Track progress through assessment stages
- **Test Taking Interface** - Online assessments with coding editor
- **Application Status Tracking** - Real-time updates on interview stages

### 👩‍💼 **Interviewer Dashboard**
- **Candidate Review** - Access candidate profiles and assessment scores
- **Interview Evaluation** - Multi-dimensional rating system
- **Rating & Feedback** - Structured evaluation forms
- **Interview Management** - Schedule and track interview sessions

### 🔧 **Admin/Talent Panel**
- **Job Creation** - Comprehensive job posting with interview loop setup
- **Live Monitoring** - Real-time candidate progress tracking
- **Application Management** - Bulk status updates and filtering
- **Analytics Dashboard** - Hiring metrics and candidate statistics
- **Decision Engine** - Automated scoring and recommendation system

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Code Editor**: Monaco Editor (for coding assessments)
- **Build Tool**: Create React App
- **Icons**: Lucide React

## 📁 Project Structure

```
client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── shared/          # Reusable UI components
│   │   ├── candidate/       # Candidate-specific components
│   │   ├── interviewer/     # Interviewer-specific components
│   │   └── admin/           # Admin-specific components
│   ├── pages/              # Main page components
│   ├── context/            # React Context providers
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Main App component
│   ├── index.tsx           # Entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 🚦 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Configure environment**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 UI/UX Design Principles

### **Clean & Modern**
- Minimalist design with focus on functionality
- Consistent spacing and typography
- Professional color palette

### **Responsive Design**
- Mobile-first approach
- Flexible layouts that work on all screen sizes
- Touch-friendly interface elements

### **User Experience**
- Intuitive navigation and clear information hierarchy
- Loading states and error handling
- Accessibility considerations (WCAG compliance)

### **Role-Based Interface**
- Tailored dashboards for each user type
- Context-aware navigation and features
- Secure route protection

## 🔐 Authentication & Security

- **JWT-based authentication**
- **Role-based access control** (Candidate, Interviewer, Admin)
- **Protected routes** with automatic redirects
- **Token refresh** mechanism
- **Secure API communication**

## 📱 Key User Flows

### **Candidate Journey**
1. Login → Dashboard → Job Selection → Assessment → Interview → Results

### **Interviewer Workflow**
1. Login → Interview List → Candidate Review → Evaluation → Submit Rating

### **Admin Process**
1. Login → Dashboard → Job Creation → Monitor Applications → Decision Making

## 🧪 Testing Strategy

- **Component Testing**: Jest + React Testing Library
- **Integration Testing**: API endpoint testing
- **E2E Testing**: User flow validation
- **Accessibility Testing**: Screen reader compatibility

## 🚀 Deployment

### **Development**
```bash
npm start
# Runs on http://localhost:3000
```

### **Production Build**
```bash
npm run build
# Creates optimized build in /build folder
```

### **Environment Variables**
- `REACT_APP_API_URL`: Backend API base URL
- `REACT_APP_ENV`: Environment (development/production)

## 🔧 Configuration

### **API Integration**
- Centralized API client with interceptors
- Automatic token management
- Error handling and retry logic
- Request/response type safety

### **Styling**
- Tailwind CSS for utility-first styling
- Custom design system with consistent components
- Dark mode support (future enhancement)
- Responsive breakpoints

## 📚 Component Library

### **Shared Components**
- `Button` - Configurable button with variants
- `Input` - Form input with validation
- `Card` - Container component with consistent styling
- `Badge` - Status indicators
- `Loading` - Loading states and spinners

### **Feature Components**
- `JobCard` - Job listing with progress tracking
- `TestTakingPage` - Assessment interface
- `CandidateEvaluation` - Interview rating form
- `JobCreationForm` - Admin job creation

## 🤝 Contributing

1. Follow the established code structure
2. Use TypeScript for type safety
3. Follow the component naming conventions
4. Write meaningful commit messages
5. Add proper error handling
6. Include loading states for async operations

## 📖 API Documentation

The frontend integrates with the backend API:
- **Base URL**: `http://localhost:5000/api`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`

### **Key Endpoints**
- `POST /auth/login` - User authentication
- `GET /jobs` - Fetch jobs list
- `POST /jobs` - Create new job
- `GET /applications` - Get applications
- `POST /interviews/{id}/rating` - Submit interview rating

## 🎯 Future Enhancements

- **Real-time notifications** using WebSockets
- **Advanced analytics** with charts and graphs
- **Bulk operations** for admin management
- **Email integration** for notifications
- **Calendar integration** for interview scheduling
- **Mobile app** using React Native
- **Offline support** with service workers

## 📄 Demo Credentials

For testing purposes:
- **Candidate**: candidate@demo.com / password123
- **Interviewer**: interviewer@demo.com / password123  
- **Admin**: admin@demo.com / password123

---

Built with ❤️ for efficient talent acquisition and management.
