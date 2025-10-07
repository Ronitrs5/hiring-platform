import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  InterviewService, 
  UserService, 
  JobService, 
  TestService, 
  EvaluationService 
} from '../../services';
import { Interview, User, Job, TestResult, Evaluation } from '../../types';
import { useForm } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const CandidateInterview: React.FC = () => {
  const { interviewerId, candidateId, jobId } = useParams<{ 
    interviewerId: string; 
    candidateId: string; 
    jobId: string; 
  }>();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = (values: any) => {
    const errors: Record<string, string> = {};
    
    if (!values.rating || values.rating < 1 || values.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    
    if (!values.feedback?.trim()) {
      errors.feedback = 'Feedback is required';
    }
    
    return errors;
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    setFieldValue
  } = useForm<{
    rating: number;
    feedback: string;
    status: 'scheduled' | 'completed' | 'missed';
  }>({
    rating: 0,
    feedback: '',
    status: 'scheduled'
  }, validateForm);

  const loadCandidateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        candidateResponse,
        jobResponse,
        interviewsResponse,
        testResultsResponse
      ] = await Promise.all([
        UserService.getUserById(candidateId!),
        JobService.getJobById(jobId!),
        InterviewService.getInterviewsByCandidateId(candidateId!),
        TestService.getTestResultsByCandidateAndJob(candidateId!, jobId!)
      ]);

      if (candidateResponse.data) {
        setCandidate(candidateResponse.data);
      }
      if (jobResponse.data) {
        setJob(jobResponse.data);
      }
      
      // Filter interviews for this job
      const jobInterviews = interviewsResponse.data.filter(
        interview => interview.jobId === jobId
      );
      setInterviews(jobInterviews);
      
      setTestResults(testResultsResponse.data);

      // Try to load existing evaluation
      try {
        const evaluationResponse = await EvaluationService.getEvaluationByCandidateAndJob(candidateId!, jobId!);
        if (evaluationResponse.data) {
          setEvaluation(evaluationResponse.data);
        }
      } catch (err) {
        // No evaluation exists yet, which is fine
      }

      // If there's an existing interview by this interviewer, populate the form
      const existingInterview = jobInterviews.find(
        interview => interview.interviewerId === interviewerId
      );
      
      if (existingInterview) {
        setFieldValue('rating', existingInterview.rating || 0);
        setFieldValue('feedback', existingInterview.feedback || '');
        setFieldValue('status', existingInterview.status);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate data');
    } finally {
      setLoading(false);
    }
  }, [candidateId, jobId, interviewerId, setFieldValue]);

  useEffect(() => {
    if (candidateId && jobId && interviewerId) {
      loadCandidateData();
    }
  }, [candidateId, jobId, interviewerId, loadCandidateData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Find or create interview record
      const existingInterview = interviews.find(
        interview => interview.interviewerId === interviewerId
      );

      if (existingInterview) {
        // Update existing interview
        await InterviewService.updateInterview(existingInterview._id!, {
          rating: values.rating,
          feedback: values.feedback,
          status: values.status
        });
      } else {
        // Create new interview record
        await InterviewService.createInterview({
          candidateId: candidateId!,
          jobId: jobId!,
          interviewerId: interviewerId!,
          round: 'technical', // Default to technical round
          scheduledAt: new Date()
        });
      }

      setSuccess('Interview feedback submitted successfully!');
      
      setTimeout(() => {
        navigate(`/interviewer/${interviewerId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalTestScore = () => {
    if (testResults.length === 0) return 0;
    const totalScore = testResults.reduce((sum, result) => sum + result.totalScore, 0);
    return Math.round(totalScore / testResults.length);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!candidate || !job) {
    return (
      <div className="card">
        <Alert type="error" message="Candidate or job not found" />
      </div>
    );
  }

  return (
    <div className="candidate-interview">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Interview: {candidate.name}</h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
              {job.title} • {job.department}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/interviewer/${interviewerId}`)}
            className="btn btn-outline"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        {success && (
          <Alert 
            type="success" 
            message={success} 
          />
        )}

        <div className="grid grid-cols-2">
          {/* Candidate Information */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Candidate Profile</h2>
            
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Contact Information</h3>
              <p><strong>Name:</strong> {candidate.name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
              {candidate.resumeUrl && (
                <p>
                  <strong>Resume:</strong>{' '}
                  <a 
                    href={candidate.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    View Resume
                  </a>
                </p>
              )}
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Test Performance</h3>
              {testResults.length === 0 ? (
                <p>No test results available.</p>
              ) : (
                <div>
                  <p><strong>Average Score:</strong> {calculateTotalTestScore()}%</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    {testResults.map((result, index) => (
                      <div 
                        key={result._id} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          backgroundColor: index % 2 === 0 ? '#f9fafb' : 'transparent',
                          borderRadius: '0.25rem'
                        }}
                      >
                        <span>Test {index + 1}</span>
                        <span style={{ fontWeight: 'bold' }}>{result.totalScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>Previous Interviews</h3>
              {interviews.length === 0 ? (
                <p>No previous interviews.</p>
              ) : (
                <div>
                  {interviews.map((interview) => (
                    <div 
                      key={interview._id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ textTransform: 'capitalize' }}>{interview.round} Round</strong>
                        {interview.rating && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '0.5rem' }}>{interview.rating}/5</span>
                            <div style={{ display: 'flex' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                  key={star}
                                  style={{ 
                                    color: star <= interview.rating! ? '#f59e0b' : '#e5e7eb',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {interview.feedback && (
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          fontSize: '0.875rem', 
                          color: '#4b5563' 
                        }}>
                          {interview.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interview Form */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Interview Feedback</h2>
            
            <form onSubmit={handleSubmit} className="card">
              <div className="form-group">
                <label className="form-label">Overall Rating *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleChange('rating', rating)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '2rem',
                        color: rating <= values.rating ? '#f59e0b' : '#e5e7eb',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    ({values.rating}/5)
                  </span>
                </div>
                {touched.rating && errors.rating && (
                  <div className="form-error">{errors.rating}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Interview Status *</label>
                <select
                  className="form-select"
                  value={values.status}
                  onChange={(e) => handleChange('status', e.target.value as any)}
                  onBlur={() => handleBlur('status')}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Feedback *</label>
                <textarea
                  className="form-textarea"
                  value={values.feedback}
                  onChange={(e) => handleChange('feedback', e.target.value)}
                  onBlur={() => handleBlur('feedback')}
                  placeholder="Provide detailed feedback about the candidate's performance, technical skills, communication, etc."
                  rows={8}
                />
                {touched.feedback && errors.feedback && (
                  <div className="form-error">{errors.feedback}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/interviewer/${interviewerId}`)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterview;