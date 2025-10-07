import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService, ApplicationService } from '../../services';
import { Job, PaginationParams } from '../../types';
import { usePagination } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';

const CandidateJobBrowse: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [applying, setApplying] = useState<string | null>(null);
  
  const { page, limit, goToPage } = usePagination();

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: PaginationParams & { department?: string; location?: string } = {
        page,
        limit,
        search: search || undefined,
        department: department || undefined,
        location: location || undefined,
      };

      const response = await JobService.getJobs(params);
      setJobs(response.data);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, department, location]);

  const handleApply = async (jobId: string) => {
    if (!candidateId) return;

    try {
      setApplying(jobId);
      setError(null);

      await ApplicationService.createApplication({
        candidateId,
        jobId,
      });

      setSuccess('Application submitted successfully!');
      
      // Navigate to interview rounds after successful application
      setTimeout(() => {
        navigate(`/candidate/${candidateId}/jobs/${jobId}/interview-rounds`);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <div className="candidate-job-browse">
      <div className="card-header">
        <h1 className="card-title">Browse Available Jobs</h1>
        <button 
          onClick={() => navigate(`/candidate/${candidateId}/jobs`)}
          className="btn btn-outline"
        >
          My Applications
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
          onClose={() => setSuccess(null)} 
        />
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by department..."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <div className="grid">
          {jobs.length === 0 ? (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>No Jobs Available</h2>
                <p>There are currently no job openings matching your criteria.</p>
              </div>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{job.title}</h3>
                  <span className="status-badge" style={{ 
                    backgroundColor: '#10b98120', 
                    color: '#10b981',
                    border: '1px solid #10b981' 
                  }}>
                    Open
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p><strong>Department:</strong> {job.department}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {job.description.substring(0, 150)}
                    {job.description.length > 150 ? '...' : ''}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Requirements ({job.requirements.length}):
                  </h4>
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, paddingLeft: '1rem' }}>
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                    {job.requirements.length > 3 && (
                      <li>...and {job.requirements.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => handleApply(job._id!)}
                    disabled={applying === job._id}
                    className="btn btn-primary"
                  >
                    {applying === job._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {jobs.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
};

export default CandidateJobBrowse;