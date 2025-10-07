import React, { useState, useEffect } from 'react';
import { AdminDashboardData, Job, Application, CreateJobForm } from '../types';
import { JobCreationForm } from '../components/admin/JobCreationForm';
import { Loading } from '../components/shared/Loading';
import { Card, CardContent, CardHeader } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { formatDate, formatDateTime } from '../utils/helpers';

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'candidates'>('dashboard');

  useEffect(() => {
    loadDashboardData();
    loadJobs();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock dashboard data
      const mockDashboardData: AdminDashboardData = {
        jobs: [],
        candidateStats: {
          total: 38,
          inProgress: 12,
          completed: 15,
          selected: 8,
          rejected: 3
        },
        recentActivity: [
          {
            id: '1',
            type: 'application',
            candidateName: 'John Doe',
            jobTitle: 'Frontend Developer',
            timestamp: '2024-02-08T10:00:00.000Z',
            details: 'New application submitted'
          },
          {
            id: '2',
            type: 'interview_scheduled',
            candidateName: 'Jane Smith',
            jobTitle: 'Product Manager',
            timestamp: '2024-02-07T14:30:00.000Z',
            details: 'Technical interview scheduled'
          }
        ]
      };
      setDashboardData(mockDashboardData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock jobs data
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
          updatedAt: '2024-01-15'
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
          updatedAt: '2024-01-20'
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
          updatedAt: '2024-01-25'
        }
      ];

      setJobs(mockJobs);
    } catch (err: any) {
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobApplications = async (jobId: string) => {
    try {
      setIsLoading(true);
      
      // Mock applications data
      const mockApplications: Application[] = [
        {
          _id: 'app1',
          candidateId: 'candidate1',
          jobId: jobId,
          status: 'applied',
          appliedAt: '2024-02-01',
          updatedAt: '2024-02-01'
        },
        {
          _id: 'app2',
          candidateId: 'candidate2',
          jobId: jobId,
          status: 'interview-scheduled',
          appliedAt: '2024-02-02',
          updatedAt: '2024-02-05'
        },
        {
          _id: 'app3',
          candidateId: 'candidate3',
          jobId: jobId,
          status: 'selected',
          appliedAt: '2024-01-28',
          updatedAt: '2024-02-08'
        }
      ];

      setJobApplications(mockApplications);
      const job = jobs.find(j => j._id === jobId);
      setSelectedJob(job || null);
    } catch (err: any) {
      setError('Failed to load job applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (jobData: CreateJobForm) => {
    try {
      setIsSubmitting(true);
      
      // Mock job creation
      const newJob: Job = {
        _id: `job_${Date.now()}`,
        title: jobData.title,
        department: jobData.department,
        location: jobData.location,
        description: jobData.description,
        requirements: jobData.requirements,
        createdBy: 'admin1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setJobs(prev => [newJob, ...prev]);
      setShowCreateJob(false);
      alert('Job created successfully!');
    } catch (err: any) {
      alert('Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      // Mock update success
      console.log('Updating application status:', applicationId, status);
      setJobApplications(prev =>
        prev.map(app =>
          app._id === applicationId ? { ...app, status: status as any } : app
        )
      );
      alert('Application status updated successfully!');
    } catch (err: any) {
      alert('Failed to update application status');
    }
  };

  if (isLoading && !selectedJob && !showCreateJob) {
    return <Loading message="Loading admin dashboard..." />;
  }

  if (error && !selectedJob && !showCreateJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadJobs}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show job creation form
  if (showCreateJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setShowCreateJob(false)}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <JobCreationForm
            onSubmit={handleCreateJob}
            onCancel={() => setShowCreateJob(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Show job applications view
  if (selectedJob) {
    const applicationsStats = {
      total: jobApplications.length,
      applied: jobApplications.filter(app => app.status === 'applied').length,
      inProgress: jobApplications.filter(app => 
        ['test-assigned', 'interview-scheduled'].includes(app.status)
      ).length,
      selected: jobApplications.filter(app => app.status === 'selected').length,
      rejected: jobApplications.filter(app => app.status === 'rejected').length,
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  ← Back to Jobs
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h1>
                  <p className="text-sm text-gray-600">
                    {selectedJob.department} • {selectedJob.location}
                  </p>
                </div>
              </div>
              <Badge>{applicationsStats.total} applications</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[
              { label: 'Total', value: applicationsStats.total, color: 'bg-blue-100 text-blue-800' },
              { label: 'Applied', value: applicationsStats.applied, color: 'bg-yellow-100 text-yellow-800' },
              { label: 'In Progress', value: applicationsStats.inProgress, color: 'bg-purple-100 text-purple-800' },
              { label: 'Selected', value: applicationsStats.selected, color: 'bg-green-100 text-green-800' },
              { label: 'Rejected', value: applicationsStats.rejected, color: 'bg-red-100 text-red-800' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`text-sm font-medium px-2 py-1 rounded-full ${stat.color}`}>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
            </CardHeader>
            <CardContent>
              {jobApplications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">This job hasn't received any applications.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobApplications.map((application) => (
                        <tr key={application._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {application.candidateId.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(application.appliedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="status" status={application.status}>
                              {application.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {application.currentStage || 'Initial Review'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex space-x-2">
                              <select
                                value={application.status}
                                onChange={(e) => handleUpdateApplicationStatus(application._id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="applied">Applied</option>
                                <option value="test-assigned">Test Assigned</option>
                                <option value="interview-scheduled">Interview Scheduled</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage jobs, monitor applications, and track hiring progress
              </p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setShowCreateJob(true)}>
                Create New Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', label: 'Overview' },
                { id: 'jobs', label: 'Jobs' },
                { id: 'candidates', label: 'Candidates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData?.jobs?.length || jobs.length}
                      </p>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData?.candidateStats?.total || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Candidates</p>
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
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData?.candidateStats?.inProgress || 0}
                      </p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData?.candidateStats?.selected || 0}
                      </p>
                      <p className="text-sm text-gray-600">Selected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentActivity?.length ? (
                    dashboardData.recentActivity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <strong>{activity.candidateName}</strong> - {activity.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Jobs</h2>
              <Button onClick={() => setShowCreateJob(true)}>
                Create New Job
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job._id} hover onClick={() => loadJobApplications(job._id)}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <Badge>
                          {job.requirements?.length || 0} requirements
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Candidates</h2>
            <Card>
              <CardContent className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Candidates View</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This feature would show a comprehensive list of all candidates across all jobs with filtering and search capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
