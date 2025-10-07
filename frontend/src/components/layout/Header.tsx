import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Hiring Platform
          </Link>
          
          <nav className="nav">
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
              Admin
            </Link>
            <Link to="/candidate/670c75d8f4e4a1b2c3d4e5f6/browse-jobs" className={`nav-link ${isActive('/candidate')}`}>
              Candidate
            </Link>
            <Link to="/interviewer/670c75d8f4e4a1b2c3d4e5f7" className={`nav-link ${isActive('/interviewer')}`}>
              Interviewer
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;