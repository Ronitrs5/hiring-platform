import React, { useState, useEffect } from 'react';
import { Interview, User, Job, TestResult, InterviewRatingForm } from '../types';
import { CandidateEvaluation } from '../components/interviewer/CandidateEvaluation';
import { Loading } from '../components/shared/Loading';
import { Card, CardContent, CardHeader } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { formatDateTime, formatDate } from '../utils/helpers';

export const InterviewerDashboard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [candidate, setCandidate] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock interviews data
      const mockInterviews: Interview[] = [
        {
          _id: 'interview1',
          candidateId: 'candidate1',
          jobId: 'job1',
          interviewerId: 'interviewer1',
          round: 'Technical Round',
          scheduledAt: '2024-02-10T10:00:00.000Z',
          status: 'scheduled'
        },
        {
          _id: 'interview2',
          candidateId: 'candidate2',
          jobId: 'job2',
          interviewerId: 'interviewer1',
          round: 'HR Round',
          scheduledAt: '2024-02-12T14:00:00.000Z',
          status: 'completed',
          rating: 4,
          feedback: 'Good technical skills, needs improvement in communication'
        }
      ];

      setInterviews(mockInterviews);
    } catch (err: any) {
      setError('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidateDetails = async (interview: Interview) => {
    try {
      setIsLoading(true);
      
      // Mock candidate and job data
      const mockCandidate: User = {
        _id: interview.candidateId,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'candidate',
        phone: '+1-555-0123',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      };

      const mockJob: Job = {
        _id: interview.jobId,
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: 'Remote',
        description: 'We are looking for a skilled React developer...',
        requirements: ['React', 'TypeScript', 'Node.js'],
        createdBy: 'admin1',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      };

      const mockTestResults: TestResult[] = [
        {
          _id: 'result1',
          candidateId: interview.candidateId,
          testId: 'test1',
          jobId: interview.jobId,
          answers: [],
          totalScore: 85,
          startedAt: '2024-02-08T10:00:00.000Z',
          submittedAt: '2024-02-08T10:30:00.000Z',
          status: 'completed'
        }
      ];

      setCandidate(mockCandidate);
      setJob(mockJob);
      setTestResults(mockTestResults);
      setSelectedInterview(interview);
    } catch (err: any) {
      setError('Failed to load candidate details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async (rating: InterviewRatingForm) => {
    if (!selectedInterview) return;

    try {
      setIsSubmitting(true);
      
      // Mock successful submission
      console.log('Submitting rating:', rating);
      
      // Update the interview in the list
      setInterviews(prev => 
        prev.map(interview => 
          interview._id === selectedInterview._id 
            ? { ...interview, status: 'completed' as const, rating: rating.dimensions.overallRating, feedback: rating.feedback }
            : interview
        )
      );
      
      // Show success message and go back to list
      alert('Interview evaluation submitted successfully!');
      setSelectedInterview(null);
      setCandidate(null);
      setJob(null);
      setTestResults([]);
    } catch (err: any) {
      alert(err.message || 'Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToList = () => {
    setSelectedInterview(null);
    setCandidate(null);
    setJob(null);
    setTestResults([]);
  };

  if (isLoading && !selectedInterview) {
    return <Loading message="Loading your interviews..." />;
  }

  if (error && !selectedInterview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadInterviews}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show candidate evaluation if an interview is selected
  if (selectedInterview && candidate && job) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={goBackToList}>
                  ← Back to Interviews
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Interview Evaluation
                  </h1>
                  <p className="text-sm text-gray-600">
                    {job.title} • {selectedInterview.round} • {formatDateTime(selectedInterview.scheduledAt)}
                  </p>
                </div>
              </div>
              <Badge variant="status" status={selectedInterview.status}>
                {selectedInterview.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <Loading message="Loading candidate details..." />
          ) : (
            <CandidateEvaluation
              candidate={candidate}
              interview={selectedInterview}
              testResults={testResults}
              onSubmitRating={handleSubmitRating}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    );
  }

  // Show interviews list
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const missedInterviews = interviews.filter(i => i.status === 'missed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interviewer Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your scheduled interviews and evaluate candidates
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome, Sarah Johnson</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{interviews.length}</p>
                  <p className="text-sm text-gray-600">Total Interviews</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{upcomingInterviews.length}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{completedInterviews.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{missedInterviews.length}</p>
                  <p className="text-sm text-gray-600">Missed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div className="space-y-8">
          {/* Upcoming Interviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
              <Badge>{upcomingInterviews.length} scheduled</Badge>
            </div>
            
            {upcomingInterviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming interviews</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any interviews scheduled at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview._id} hover>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">Candidate Interview</h3>
                            <p className="text-sm text-gray-600">{interview.round}</p>
                          </div>
                          <Badge variant="status" status={interview.status}>
                            {interview.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Scheduled:</strong> {formatDateTime(interview.scheduledAt)}</p>
                          <p><strong>Candidate ID:</strong> {interview.candidateId.substring(0, 8)}...</p>
                          <p><strong>Job ID:</strong> {interview.jobId.substring(0, 8)}...</p>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => loadCandidateDetails(interview)}
                        >
                          Start Evaluation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Interviews */}
          {completedInterviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Completed Interviews</h2>
                <Badge>{completedInterviews.length} completed</Badge>
              </div>
              
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Round
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {completedInterviews.map((interview) => (
                          <tr key={interview._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {interview.candidateId.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {interview.round}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(interview.scheduledAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {interview.rating && (
                                <Badge>{interview.rating}/5</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadCandidateDetails(interview)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
