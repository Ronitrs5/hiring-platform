import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { JobService } from '../../services';
import { Job, PaginationParams } from '../../types';
import { usePagination } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  
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

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await JobService.deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <div className="job-list">
      <div className="card-header">
        <h1 className="card-title">Job Management</h1>
        <Link to="/admin/jobs/create" className="btn btn-primary">
          Create New Job
        </Link>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
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
        <div className="card">
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No jobs found.</p>
              <Link to="/admin/jobs/create" className="btn btn-primary">
                Create Your First Job
              </Link>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Requirements</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <strong>{job.title}</strong>
                        </td>
                        <td>{job.department}</td>
                        <td>{job.location}</td>
                        <td>
                          <span>{job.requirements.length} requirements</span>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link 
                              to={`/admin/jobs/${job._id}/edit`} 
                              className="btn btn-sm btn-outline"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => handleDelete(job._id!)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobList;