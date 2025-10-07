import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';

interface InterviewRound {
  id: string;
  name: string;
  description: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed' | 'passed' | 'failed';
  icon: string;
}

const InterviewRounds: React.FC = () => {
  const { candidateId, jobId } = useParams<{ candidateId: string; jobId: string }>();
  const navigate = useNavigate();
  
  const [currentRound, setCurrentRound] = useState<string>('aptitude');
  const [success, setSuccess] = useState<string | null>(null);

  const rounds: InterviewRound[] = [
    {
      id: 'aptitude',
      name: 'Aptitude Test',
      description: 'General aptitude and logical reasoning assessment',
      duration: '45 minutes',
      status: currentRound === 'aptitude' ? 'in-progress' : 'pending',
      icon: '🧠'
    },
    {
      id: 'oa',
      name: 'Online Assessment (OA)',
      description: 'Coding challenges and problem-solving skills',
      duration: '90 minutes',
      status: 'pending',
      icon: '💻'
    },
    {
      id: 'technical',
      name: 'Technical Round',
      description: 'Technical interview with senior developers',
      duration: '60 minutes',
      status: 'pending',
      icon: '⚙️'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Round',
      description: 'Cultural fit and behavioral assessment',
      duration: '45 minutes',
      status: 'pending',
      icon: '👥'
    }
  ];

  const getStatusColor = (status: InterviewRound['status']) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: InterviewRound['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'passed': return 'Passed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const handleStartRound = (roundId: string) => {
    setSuccess(`Starting ${rounds.find(r => r.id === roundId)?.name}...`);
    
    // Simulate starting the round
    setTimeout(() => {
      setSuccess(`${rounds.find(r => r.id === roundId)?.name} completed successfully!`);
      
      // Move to next round or complete
      const currentIndex = rounds.findIndex(r => r.id === roundId);
      if (currentIndex < rounds.length - 1) {
        const nextRound = rounds[currentIndex + 1];
        setCurrentRound(nextRound.id);
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      } else {
        // All rounds completed
        setTimeout(() => {
          setSuccess('🎉 Congratulations! You have completed all interview rounds. HR will contact you soon.');
        }, 1000);
      }
    }, 2000);
  };

  const getRoundStatus = (roundId: string) => {
    const roundIndex = rounds.findIndex(r => r.id === roundId);
    const currentIndex = rounds.findIndex(r => r.id === currentRound);
    
    if (roundIndex < currentIndex) {
      return 'passed';
    } else if (roundIndex === currentIndex) {
      return 'in-progress';
    } else {
      return 'pending';
    }
  };

  return (
    <div className="interview-rounds">
      <div className="card-header">
        <div>
          <h1 className="card-title">Interview Process</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
            Complete all 4 rounds to proceed with your application
          </p>
        </div>
        <button 
          onClick={() => navigate(`/candidate/${candidateId}/jobs`)}
          className="btn btn-outline"
        >
          Back to Applications
        </button>
      </div>

      {success && (
        <Alert 
          type="success" 
          message={success} 
          onClose={() => setSuccess(null)} 
        />
      )}

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Overall Progress</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {rounds.findIndex(r => r.id === currentRound) + 1} of {rounds.length} rounds
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${((rounds.findIndex(r => r.id === currentRound) + 1) / rounds.length) * 100}%`,
                height: '100%',
                backgroundColor: '#10b981',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Interview Rounds */}
      <div className="grid">
        {rounds.map((round, index) => {
          const status = getRoundStatus(round.id);
          const isActive = status === 'in-progress';
          const isCompleted = status === 'passed';
          const isDisabled = status === 'pending' && round.id !== currentRound;

          return (
            <div 
              key={round.id} 
              className="card"
              style={{ 
                opacity: isDisabled ? 0.6 : 1,
                border: isActive ? '2px solid #f59e0b' : undefined,
                backgroundColor: isCompleted ? '#f0fdf4' : undefined
              }}
            >
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{round.icon}</span>
                  <div>
                    <h3 className="card-title" style={{ margin: 0 }}>{round.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Round {index + 1}
                    </span>
                  </div>
                </div>
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${getStatusColor(status)}20`,
                    color: getStatusColor(status),
                    border: `1px solid ${getStatusColor(status)}`,
                    fontSize: '0.75rem'
                  }}
                >
                  {getStatusText(status)}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '0.5rem' }}>
                  {round.description}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Duration:</strong> {round.duration}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isCompleted ? (
                  <span style={{ 
                    color: '#10b981', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    ✅ Completed
                  </span>
                ) : isActive ? (
                  <button 
                    onClick={() => handleStartRound(round.id)}
                    className="btn btn-primary"
                  >
                    Start Round
                  </button>
                ) : (
                  <button 
                    disabled
                    className="btn btn-outline"
                    style={{ opacity: 0.5 }}
                  >
                    Locked
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Instructions</h3>
        <ul style={{ color: '#4b5563', paddingLeft: '1.5rem' }}>
          <li>Complete rounds in sequential order</li>
          <li>Each round must be passed to unlock the next one</li>
          <li>You can take breaks between rounds</li>
          <li>Results will be communicated after all rounds are completed</li>
          <li>Contact HR if you face any technical issues</li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewRounds;