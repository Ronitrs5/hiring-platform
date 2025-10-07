import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Job, Application, LoadingState } from '../types';

// State interface
interface AppState {
  // User state
  currentUser: User | null;
  users: User[];
  
  // Job state
  jobs: Job[];
  currentJob: Job | null;
  
  // Application state
  applications: Application[];
  
  // UI state
  loading: LoadingState;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Action types
type AppAction = 
  // User actions
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; data: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  
  // Job actions
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'SET_CURRENT_JOB'; payload: Job | null }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: { id: string; data: Partial<Job> } }
  | { type: 'DELETE_JOB'; payload: string }
  
  // Application actions
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; data: Partial<Application> } }
  | { type: 'DELETE_APPLICATION'; payload: string }
  
  // UI actions
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; error?: string | null } }
  | { type: 'SET_PAGINATION'; payload: { page: number; limit: number; total: number; pages: number } }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AppState = {
  currentUser: null,
  users: [],
  jobs: [],
  currentJob: null,
  applications: [],
  loading: {
    isLoading: false,
    error: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // User cases
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload.id ? { ...user, ...action.payload.data } : user
        ),
        currentUser: state.currentUser?._id === action.payload.id 
          ? { ...state.currentUser, ...action.payload.data } 
          : state.currentUser,
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload),
        currentUser: state.currentUser?._id === action.payload ? null : state.currentUser,
      };
    
    // Job cases
    case 'SET_JOBS':
      return { ...state, jobs: action.payload };
    
    case 'SET_CURRENT_JOB':
      return { ...state, currentJob: action.payload };
    
    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.payload] };
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job._id === action.payload.id ? { ...job, ...action.payload.data } : job
        ),
        currentJob: state.currentJob?._id === action.payload.id 
          ? { ...state.currentJob, ...action.payload.data } 
          : state.currentJob,
      };
    
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job._id !== action.payload),
        currentJob: state.currentJob?._id === action.payload ? null : state.currentJob,
      };
    
    // Application cases
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app._id === action.payload.id ? { ...app, ...action.payload.data } : app
        ),
      };
    
    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter(app => app._id !== action.payload),
      };
    
    // UI cases
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: { 
          isLoading: action.payload.isLoading, 
          error: action.payload.error || null 
        } 
      };
    
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, loading: { ...state.loading, error: null } };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Action creators
export const appActions = {
  // User actions
  setCurrentUser: (user: User | null): AppAction => ({
    type: 'SET_CURRENT_USER',
    payload: user,
  }),
  
  setUsers: (users: User[]): AppAction => ({
    type: 'SET_USERS',
    payload: users,
  }),
  
  addUser: (user: User): AppAction => ({
    type: 'ADD_USER',
    payload: user,
  }),
  
  updateUser: (id: string, data: Partial<User>): AppAction => ({
    type: 'UPDATE_USER',
    payload: { id, data },
  }),
  
  deleteUser: (id: string): AppAction => ({
    type: 'DELETE_USER',
    payload: id,
  }),
  
  // Job actions
  setJobs: (jobs: Job[]): AppAction => ({
    type: 'SET_JOBS',
    payload: jobs,
  }),
  
  setCurrentJob: (job: Job | null): AppAction => ({
    type: 'SET_CURRENT_JOB',
    payload: job,
  }),
  
  addJob: (job: Job): AppAction => ({
    type: 'ADD_JOB',
    payload: job,
  }),
  
  updateJob: (id: string, data: Partial<Job>): AppAction => ({
    type: 'UPDATE_JOB',
    payload: { id, data },
  }),
  
  deleteJob: (id: string): AppAction => ({
    type: 'DELETE_JOB',
    payload: id,
  }),
  
  // Application actions
  setApplications: (applications: Application[]): AppAction => ({
    type: 'SET_APPLICATIONS',
    payload: applications,
  }),
  
  addApplication: (application: Application): AppAction => ({
    type: 'ADD_APPLICATION',
    payload: application,
  }),
  
  updateApplication: (id: string, data: Partial<Application>): AppAction => ({
    type: 'UPDATE_APPLICATION',
    payload: { id, data },
  }),
  
  deleteApplication: (id: string): AppAction => ({
    type: 'DELETE_APPLICATION',
    payload: id,
  }),
  
  // UI actions
  setLoading: (isLoading: boolean, error?: string | null): AppAction => ({
    type: 'SET_LOADING',
    payload: { isLoading, error },
  }),
  
  setPagination: (pagination: { page: number; limit: number; total: number; pages: number }): AppAction => ({
    type: 'SET_PAGINATION',
    payload: pagination,
  }),
  
  clearError: (): AppAction => ({
    type: 'CLEAR_ERROR',
  }),
};