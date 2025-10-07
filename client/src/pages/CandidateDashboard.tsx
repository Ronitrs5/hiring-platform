import React, { useState, useEffect } from 'react';
import { Application, Job } from '../types';
import { JobCard } from '../components/candidate/JobCard';
import { Loading } from '../components/shared/Loading';
import { Card, CardContent, CardHeader } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { formatDate, formatDateTime } from '../utils/helpers';

export const CandidateDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for demo
      const mockJobs: Job[] = [
        {
          _id: '1',
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'Remote',
          description: 'We are looking for a skilled React developer...',
          requirements: ['React', 'TypeScript', 'Node.js'],
          createdBy: 'admin1',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
        {
          _id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'San Francisco, CA',
          description: 'Lead product strategy and development...',
          requirements: ['Product Management', 'Analytics', 'Leadership'],
          createdBy: 'admin1',
          createdAt: '2024-01-20',
          updatedAt: '2024-01-20',
        },
        {
          _id: '3',
          title: 'Data Scientist',
          department: 'Data',
          location: 'New York, NY',
          description: 'Analyze data and build ML models...',
          requirements: ['Python', 'Machine Learning', 'SQL'],
          createdBy: 'admin1',
          createdAt: '2024-01-25',
          updatedAt: '2024-01-25',
        }
      ];

      const mockApplications: Application[] = [
        {
          _id: 'app1',
          candidateId: 'candidate1',
          jobId: '1',
          status: 'interview-scheduled',
          appliedAt: '2024-02-01',
          updatedAt: '2024-02-05',
        },
        {
          _id: 'app2',
          candidateId: 'candidate1',
          jobId: '2',
          status: 'test-assigned',
          appliedAt: '2024-02-03',
          updatedAt: '2024-02-03',
        }
      ];

      // Create job lookup
      const jobsMap: Record<string, Job> = {};
      mockJobs.forEach(job => {
        jobsMap[job._id!] = job;
      });

      setJobs(jobsMap);
      setApplications(mockApplications);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStage = async (stageId: string) => {
    // In a full implementation, this would handle starting a test or interview stage
    console.log('Starting stage:', stageId);
    // Navigate to test taking page or show interview details
  };

  const handleViewJobDetails = (jobId: string) => {
    // Navigate to job details page
    console.log('Viewing job details:', jobId);
  };

  if (isLoading) {
    return <Loading message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeApplications = applications.filter(app => 
    ['applied', 'test-assigned', 'interview-scheduled'].includes(app.status)
  );
  const completedApplications = applications.filter(app => 
    ['selected', 'rejected'].includes(app.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, John Doe!
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your application progress and upcoming assessments
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Candidate Dashboard</p>
              <p className="text-xs text-gray-400">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{activeApplications.length}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">
                    {applications.filter(app => app.status === 'selected').length}
                  </p>
                  <p className="text-sm text-gray-600">Selected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">
                    {applications.filter(app => ['test-assigned', 'interview-scheduled'].includes(app.status)).length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Applications */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Applications</h2>
              <Badge>{activeApplications.length} active</Badge>
            </div>
            
            {activeApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active applications</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any active applications at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeApplications.map((application) => (
                  <JobCard
                    key={application._id}
                    application={application}
                    job={jobs[application.jobId]}
                    onStartStage={handleStartStage}
                    onViewDetails={() => handleViewJobDetails(application.jobId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application) => (
                    <div key={application._id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {jobs[application.jobId]?.title || 'Loading...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(application.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Status Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'applied').length },
                    { status: 'test-assigned', label: 'Test Assigned', count: applications.filter(a => a.status === 'test-assigned').length },
                    { status: 'interview-scheduled', label: 'Interview Scheduled', count: applications.filter(a => a.status === 'interview-scheduled').length },
                    { status: 'selected', label: 'Selected', count: applications.filter(a => a.status === 'selected').length },
                    { status: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
                  ].map((item) => (
                    <div key={item.status} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="status" status={item.status}>
                          {item.label}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
