import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApplicationService } from '../../services';
import { Application } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const CandidateJobs: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApplicationService.getApplicationsByCandidateId(candidateId!);
      setApplications(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidateId) {
      loadApplications();
    }
  }, [candidateId, loadApplications]);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied': return '#2563eb';
      case 'test-assigned': return '#f59e0b';
      case 'interview-scheduled': return '#8b5cf6';
      case 'selected': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNextStep = (status: Application['status']) => {
    switch (status) {
      case 'applied': return 'Waiting for test assignment';
      case 'test-assigned': return 'Take the assigned test';
      case 'interview-scheduled': return 'Prepare for interviews';
      case 'selected': return 'Congratulations! You have been selected';
      case 'rejected': return 'Application was not successful';
      default: return 'Unknown status';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="candidate-jobs">
      <div className="card-header">
        <h1 className="card-title">My Job Applications</h1>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {applications.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>No Applications Found</h2>
            <p>You haven't applied to any jobs yet.</p>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Browse available positions and apply to get started with your career journey.
            </p>
            <Link to={`/candidate/${candidateId}/browse-jobs`} className="btn btn-primary">
              Browse Available Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid">
          {applications.map((application) => (
            <div key={application._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{application.job?.title || 'Unknown Job'}</h3>
                  <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                    {application.job?.department} • {application.job?.location}
                  </p>
                </div>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${getStatusColor(application.status)}20`,
                    color: getStatusColor(application.status),
                    border: `1px solid ${getStatusColor(application.status)}`,
                  }}
                >
                  {application.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                <p><strong>Next Step:</strong> {getNextStep(application.status)}</p>
              </div>

              {application.job?.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {application.job.description.substring(0, 150)}
                    {application.job.description.length > 150 ? '...' : ''}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Link 
                  to={`/candidate/${candidateId}/jobs/${application.jobId}`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
                
                {application.status === 'test-assigned' && (
                  <Link 
                    to={`/candidate/${candidateId}/jobs/${application.jobId}/test/demo-test-id`}
                    className="btn btn-success btn-sm"
                  >
                    Take Test
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;