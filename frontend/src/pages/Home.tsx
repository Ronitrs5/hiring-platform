import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Welcome to Hiring Platform</h1>
        </div>
        
        <div className="grid grid-cols-3">
          <div className="card">
            <h2 className="card-title">Admin Dashboard</h2>
            <p>Manage jobs, candidates, and view hiring analytics.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/admin" className="btn btn-primary">
                Go to Admin
              </Link>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Candidate Portal</h2>
            <p>View assigned jobs and take tests.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/candidate/670c75d8f4e4a1b2c3d4e5f6/jobs" className="btn btn-primary">
                Go to Candidate
              </Link>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Interviewer Portal</h2>
            <p>Evaluate candidates and provide feedback.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/interviewer/670c75d8f4e4a1b2c3d4e5f7" className="btn btn-primary">
                Go to Interviewer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;