import React, { useState } from 'react';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { InterviewerDashboard } from './pages/InterviewerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

type ViewType = 'home' | 'candidate' | 'interviewer' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const HomePage: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hiring Platform</h1>
        <p className="text-lg text-gray-600 mb-8">
          Internal Hiring Management System
        </p>
        
        <div className="p-6 bg-white rounded-md shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">👨‍💼</div>
                <h3 className="font-semibold text-gray-900 mb-2">Candidate Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">View jobs, take tests, track applications</p>
                <button
                  onClick={() => setCurrentView('candidate')}
                  className="btn btn-primary w-full"
                >
                  View Candidate
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">👩‍💼</div>
                <h3 className="font-semibold text-gray-900 mb-2">Interviewer Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">Review candidates, conduct evaluations</p>
                <button
                  onClick={() => setCurrentView('interviewer')}
                  className="btn btn-primary w-full"
                >
                  View Interviewer
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
                <p className="text-sm text-gray-600 mb-3">Manage jobs, monitor hiring process</p>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="btn btn-primary w-full"
                >
                  View Admin
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
            <p className="text-xs text-gray-500 text-center">
              Demo Mode - No authentication required. Click any dashboard to explore the interface.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-100 rounded-md mx-auto" style={{ maxWidth: '600px' }}>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Features Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>👨‍💼 Candidate Interface</strong>
              <ul className="mt-1 text-left">
                <li>• Job Dashboard</li>
                <li>• Test Taking</li>
                <li>• Progress Tracking</li>
              </ul>
            </div>
            <div>
              <strong>👩‍💼 Interviewer Dashboard</strong>
              <ul className="mt-1 text-left">
                <li>• Candidate Review</li>
                <li>• Interview Rating</li>
                <li>• Evaluation Forms</li>
              </ul>
            </div>
            <div>
              <strong>🔧 Admin Panel</strong>
              <ul className="mt-1 text-left">
                <li>• Job Creation</li>
                <li>• Live Monitoring</li>
                <li>• Decision Engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation: React.FC = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">Hiring Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Demo Mode</span>
            <button
              onClick={() => setCurrentView('home')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'candidate':
        return (
          <>
            <Navigation />
            <CandidateDashboard />
          </>
        );
      case 'interviewer':
        return (
          <>
            <Navigation />
            <InterviewerDashboard />
          </>
        );
      case 'admin':
        return (
          <>
            <Navigation />
            <AdminDashboard />
          </>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
};

export default App;
