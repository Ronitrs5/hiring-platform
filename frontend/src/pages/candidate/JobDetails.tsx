import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JobService, ApplicationService, TestService } from '../../services';
import { Job, Application, Test } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const JobDetails: React.FC = () => {
  const { candidateId, jobId } = useParams<{ candidateId: string; jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobResponse, applicationsResponse, testsResponse] = await Promise.all([
        JobService.getJobById(jobId!),
        ApplicationService.getApplicationsByCandidateId(candidateId!),
        TestService.getTestsByJobId(jobId!)
      ]);

      if (jobResponse.data) {
        setJob(jobResponse.data);
      }
      
      // Find the specific application for this job
      const currentApplication = applicationsResponse.data.find(
        app => app.jobId === jobId
      );
      setApplication(currentApplication || null);
      
      setTests(testsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId, candidateId]);

  useEffect(() => {
    if (jobId && candidateId) {
      loadJobDetails();
    }
  }, [jobId, candidateId, loadJobDetails]);

  const getInterviewLoop = () => {
    return [
      { step: 1, name: 'Online Assessment (OA)', status: getStepStatus('oa') },
      { step: 2, name: 'Aptitude Test', status: getStepStatus('aptitude') },
      { step: 3, name: 'Technical Interview', status: getStepStatus('technical') },
      { step: 4, name: 'HR Interview', status: getStepStatus('hr') },
      { step: 5, name: 'Final Decision', status: getStepStatus('final') }
    ];
  };

  const getStepStatus = (stepType: string) => {
    if (!application) return 'pending';
    
    switch (application.status) {
      case 'applied':
        return stepType === 'oa' ? 'current' : 'pending';
      case 'test-assigned':
        return stepType === 'oa' ? 'current' : 'pending';
      case 'interview-scheduled':
        if (stepType === 'oa' || stepType === 'aptitude') return 'completed';
        return stepType === 'technical' ? 'current' : 'pending';
      case 'selected':
        return 'completed';
      case 'rejected':
        return 'failed';
      default:
        return 'pending';
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'current': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!job) {
    return (
      <div className="card">
        <Alert type="error" message="Job not found" />
      </div>
    );
  }

  const interviewLoop = getInterviewLoop();

  return (
    <div className="job-details">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">{job.title}</h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
              {job.department} • {job.location}
            </p>
          </div>
          <Link 
            to={`/candidate/${candidateId}/jobs`}
            className="btn btn-outline"
          >
            Back to Applications
          </Link>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <div className="grid grid-cols-2">
          {/* Job Information */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Job Description</h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {job.description}
            </p>

            <h3 style={{ marginBottom: '0.5rem' }}>Requirements</h3>
            <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              {job.requirements.map((req, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>
                  {req}
                </li>
              ))}
            </ul>

            {application && (
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Application Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`status-badge status-${application.status}`}>
                    {application.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interview Loop */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Interview Process</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {interviewLoop.map((step) => (
                <div 
                  key={step.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: `2px solid ${getStepColor(step.status)}`,
                    borderRadius: '0.5rem',
                    backgroundColor: step.status === 'current' ? `${getStepColor(step.status)}10` : 'transparent'
                  }}
                >
                  <div 
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      backgroundColor: getStepColor(step.status),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      marginRight: '1rem'
                    }}
                  >
                    {step.status === 'completed' ? '✓' : step.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0', color: getStepColor(step.status) }}>
                      {step.name}
                    </h4>
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      fontSize: '0.875rem', 
                      color: '#6b7280',
                      textTransform: 'capitalize'
                    }}>
                      {step.status}
                    </p>
                  </div>
                  
                  {step.status === 'current' && step.name.includes('Assessment') && (
                    <Link 
                      to={`/candidate/${candidateId}/jobs/${jobId}/test/demo-test-id`}
                      className="btn btn-success btn-sm"
                    >
                      Take Test
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {tests.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Available Tests</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {tests.map((test) => (
                    <div 
                      key={test._id} 
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{test.title}</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          Duration: {test.duration} minutes • {test.questions.length} questions
                        </p>
                      </div>
                      {application?.status === 'test-assigned' && (
                        <Link 
                          to={`/candidate/${candidateId}/jobs/${jobId}/test/${test._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Start Test
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;