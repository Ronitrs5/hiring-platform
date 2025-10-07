import React, { useEffect, useState, useCallback } from 'react';
import { UserService, ApplicationService } from '../../services';
import { User, Application } from '../../types';
import { usePagination } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';

const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const { page, limit, goToPage } = usePagination();

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await UserService.getCandidates({
        page,
        limit,
        search: search || undefined,
      });

      setCandidates(response.data);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const loadApplications = useCallback(async () => {
    try {
      const response = await ApplicationService.getApplications({ page: 1, limit: 1000 });
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }, []);

  const getCandidateApplications = (candidateId: string) => {
    return applications.filter(app => app.candidateId === candidateId);
  };

  const getCandidateStats = (candidateId: string) => {
    const candidateApps = getCandidateApplications(candidateId);
    return {
      total: candidateApps.length,
      applied: candidateApps.filter(app => app.status === 'applied').length,
      testAssigned: candidateApps.filter(app => app.status === 'test-assigned').length,
      interviewScheduled: candidateApps.filter(app => app.status === 'interview-scheduled').length,
      selected: candidateApps.filter(app => app.status === 'selected').length,
      rejected: candidateApps.filter(app => app.status === 'rejected').length,
    };
  };

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="candidate-list">
      <div className="card-header">
        <h1 className="card-title">Candidate Management</h1>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Search */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Search Candidates</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <div className="card">
          {candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No candidates found.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Applications</th>
                      <th>Status Summary</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => {
                      const stats = getCandidateStats(candidate._id!);
                      return (
                        <tr key={candidate._id}>
                          <td>
                            <strong>{candidate.name}</strong>
                          </td>
                          <td>{candidate.email}</td>
                          <td>{candidate.phone || 'N/A'}</td>
                          <td>
                            <span style={{ 
                              background: '#e5e7eb', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem'
                            }}>
                              {stats.total} applications
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {stats.applied > 0 && (
                                <span className="status-badge status-applied">
                                  {stats.applied} Applied
                                </span>
                              )}
                              {stats.testAssigned > 0 && (
                                <span className="status-badge status-test-assigned">
                                  {stats.testAssigned} Test Assigned
                                </span>
                              )}
                              {stats.interviewScheduled > 0 && (
                                <span className="status-badge status-interview-scheduled">
                                  {stats.interviewScheduled} Interviews
                                </span>
                              )}
                              {stats.selected > 0 && (
                                <span className="status-badge status-selected">
                                  {stats.selected} Selected
                                </span>
                              )}
                              {stats.rejected > 0 && (
                                <span className="status-badge status-rejected">
                                  {stats.rejected} Rejected
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
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

export default CandidateList;