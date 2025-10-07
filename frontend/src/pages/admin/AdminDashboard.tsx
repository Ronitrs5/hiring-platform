import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobService, ApplicationService } from '../../services';
import { Job, Application } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const AdminDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsResponse, appsResponse, statsResponse] = await Promise.all([
        JobService.getJobs({ page: 1, limit: 5 }),
        ApplicationService.getApplications({ page: 1, limit: 10 }),
        JobService.getJobStats()
      ]);

      setJobs(jobsResponse.data);
      setApplications(appsResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="admin-dashboard">
      <div className="card-header">
        <h1 className="card-title">Admin Dashboard</h1>
        <div>
          <Link to="/admin/jobs/create" className="btn btn-primary">
            Create New Job
          </Link>
        </div>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3>Total Jobs</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.overview?.totalJobs || 0}
            </p>
          </div>
          <div className="card">
            <h3>Total Applications</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {applications.length}
            </p>
          </div>
          <div className="card">
            <h3>Departments</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.overview?.totalDepartments || 0}
            </p>
          </div>
          <div className="card">
            <h3>Locations</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {stats.overview?.totalLocations || 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2">
        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Jobs</h2>
            <Link to="/admin/jobs" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <p>No jobs found. <Link to="/admin/jobs/create">Create your first job</Link></p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.department}</td>
                      <td>{job.location}</td>
                      <td>
                        <Link 
                          to={`/admin/jobs/${job._id}/edit`} 
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Applications</h2>
            <Link to="/admin/candidates" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          {applications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((application) => (
                    <tr key={application._id}>
                      <td>{application.candidate?.name || 'N/A'}</td>
                      <td>{application.job?.title || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${application.status}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;