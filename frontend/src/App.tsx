import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobList from './pages/admin/JobList';
import CreateJob from './pages/admin/CreateJob';
import EditJob from './pages/admin/EditJob';
import CandidateList from './pages/admin/CandidateList';
import CandidateJobs from './pages/candidate/CandidateJobs';
import CandidateJobBrowse from './pages/candidate/CandidateJobBrowse';
import InterviewRounds from './pages/candidate/InterviewRounds';
import JobDetails from './pages/candidate/JobDetails';
import TakeTest from './pages/candidate/TakeTest';
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import CandidateInterview from './pages/interviewer/CandidateInterview';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <div className="container">
              <Routes>
                {/* Home Route */}
                <Route path="/" element={<Home />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/jobs" element={<JobList />} />
                <Route path="/admin/jobs/create" element={<CreateJob />} />
                <Route path="/admin/jobs/:id/edit" element={<EditJob />} />
                <Route path="/admin/candidates" element={<CandidateList />} />
                
                {/* Candidate Routes */}
                <Route path="/candidate/:candidateId/jobs" element={<CandidateJobs />} />
                <Route path="/candidate/:candidateId/browse-jobs" element={<CandidateJobBrowse />} />
                <Route path="/candidate/:candidateId/jobs/:jobId/interview-rounds" element={<InterviewRounds />} />
                <Route path="/candidate/:candidateId/jobs/:jobId" element={<JobDetails />} />
                <Route path="/candidate/:candidateId/jobs/:jobId/test/:testId" element={<TakeTest />} />
                
                {/* Interviewer Routes */}
                <Route path="/interviewer/:interviewerId" element={<InterviewerDashboard />} />
                <Route path="/interviewer/:interviewerId/candidate/:candidateId/job/:jobId" element={<CandidateInterview />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;