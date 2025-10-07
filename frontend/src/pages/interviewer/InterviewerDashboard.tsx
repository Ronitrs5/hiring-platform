import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { InterviewService, JobService } from '../../services';
import { Interview, Job } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const InterviewerDashboard: React.FC = () => {
  const { interviewerId } = useParams<{ interviewerId: string }>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await InterviewService.getInterviewsByInterviewerId(interviewerId!);
      setInterviews(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [interviewerId]);

  const loadJobs = useCallback(async () => {
    try {
      const response = await JobService.getJobs({ page: 1, limit: 100 });
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  }, []);

  useEffect(() => {
    if (interviewerId) {
      loadInterviews();
      loadJobs();
    }
  }, [interviewerId, loadInterviews, loadJobs]);

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j._id === jobId);
    return job?.title || 'Unknown Job';
  };

  const getUpcomingInterviews = () => {
    return interviews.filter(interview => 
      interview.status === 'scheduled' && 
      new Date(interview.scheduledAt) > new Date()
    );
  };

  const getCompletedInterviews = () => {
    return interviews.filter(interview => interview.status === 'completed');
  };

  const getPendingInterviews = () => {
    return interviews.filter(interview => 
      interview.status === 'scheduled' &&
      new Date(interview.scheduledAt) <= new Date()
    );
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const upcomingInterviews = getUpcomingInterviews();
  const completedInterviews = getCompletedInterviews();
  const pendingInterviews = getPendingInterviews();

  return (
    <div className="interviewer-dashboard">
      <div className="card-header">
        <h1 className="card-title">Interviewer Dashboard</h1>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>Total Interviews</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {interviews.length}
          </p>
        </div>
        <div className="card">
          <h3>Upcoming</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {upcomingInterviews.length}
          </p>
        </div>
        <div className="card">
          <h3>Pending Review</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {pendingInterviews.length}
          </p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {completedInterviews.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Pending Interviews */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Reviews</h2>
          </div>
          
          {pendingInterviews.length === 0 ? (
            <p>No pending interviews.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Round</th>
                    <th>Scheduled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInterviews.map((interview) => (
                    <tr key={interview._id}>
                      <td>{interview.candidate?.name || 'N/A'}</td>
                      <td>{getJobTitle(interview.jobId)}</td>
                      <td>
                        <span style={{ 
                          textTransform: 'capitalize',
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          {interview.round}
                        </span>
                      </td>
                      <td>{new Date(interview.scheduledAt).toLocaleDateString()}</td>
                      <td>
                        <Link 
                          to={`/interviewer/${interviewerId}/candidate/${interview.candidateId}/job/${interview.jobId}`}
                          className="btn btn-sm btn-primary"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Interviews</h2>
          </div>
          
          {upcomingInterviews.length === 0 ? (
            <p>No upcoming interviews.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Round</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingInterviews.map((interview) => (
                    <tr key={interview._id}>
                      <td>{interview.candidate?.name || 'N/A'}</td>
                      <td>{getJobTitle(interview.jobId)}</td>
                      <td>
                        <span style={{ 
                          textTransform: 'capitalize',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          {interview.round}
                        </span>
                      </td>
                      <td>{new Date(interview.scheduledAt).toLocaleDateString()}</td>
                      <td>
                        <span className="status-badge status-interview-scheduled">
                          Scheduled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Completed Interviews */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Completed Interviews</h2>
        </div>
        
        {completedInterviews.length === 0 ? (
          <p>No completed interviews.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Round</th>
                  <th>Date</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedInterviews.slice(0, 10).map((interview) => (
                  <tr key={interview._id}>
                    <td>{interview.candidate?.name || 'N/A'}</td>
                    <td>{getJobTitle(interview.jobId)}</td>
                    <td>
                      <span style={{ 
                        textTransform: 'capitalize',
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        {interview.round}
                      </span>
                    </td>
                    <td>{new Date(interview.scheduledAt).toLocaleDateString()}</td>
                    <td>
                      {interview.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem' }}>{interview.rating}/5</span>
                          <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <span 
                                key={star}
                                style={{ 
                                  color: star <= interview.rating! ? '#f59e0b' : '#e5e7eb',
                                  fontSize: '0.875rem'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Not rated</span>
                      )}
                    </td>
                    <td>
                      <Link 
                        to={`/interviewer/${interviewerId}/candidate/${interview.candidateId}/job/${interview.jobId}`}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerDashboard;