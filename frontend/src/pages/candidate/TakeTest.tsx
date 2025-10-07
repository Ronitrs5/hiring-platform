import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestService, QuestionService } from '../../services';
import { Test, Question } from '../../types';
import { useForm } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const TakeTest: React.FC = () => {
  const { candidateId, jobId, testId } = useParams<{ 
    candidateId: string; 
    jobId: string; 
    testId: string; 
  }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  const { values, handleChange } = useForm<Record<string, string>>({});

  const loadTest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const testResponse = await TestService.getTestById(testId!);
      const testData = testResponse.data;
      
      if (testData) {
        setTest(testData);

        // Load questions
        const questionPromises = testData.questions.map(questionId => 
          QuestionService.getQuestionById(questionId)
        );
        const questionResponses = await Promise.all(questionPromises);
        const questionsData = questionResponses.map(response => response.data).filter(Boolean) as Question[];
        setQuestions(questionsData);

        setTimeRemaining(testData.duration * 60); // Convert minutes to seconds
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const startTest = () => {
    setTestStarted(true);
  };

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      setError(null);

      const answers: { questionId: string; answer: string }[] = questions.map(question => ({
        questionId: question._id!,
        answer: values[question._id!] || ''
      }));

      await TestService.submitTestResult({
        candidateId: candidateId!,
        testId: testId!,
        jobId: jobId!,
        answers
      });

      navigate(`/candidate/${candidateId}/jobs/${jobId}`, {
        state: { message: 'Test submitted successfully!' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  }, [candidateId, testId, jobId, questions, values, navigate]);

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId, loadTest]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeRemaining, handleSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const totalTime = test?.duration ? test.duration * 60 : 0;
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) return '#10b981';
    if (percentage > 25) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!test) {
    return (
      <div className="card">
        <Alert type="error" message="Test not found" />
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="take-test">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">{test.title}</h1>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2>Test Instructions</h2>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>This test contains {questions.length} questions</li>
              <li>You have {test.duration} minutes to complete the test</li>
              <li>Make sure you have a stable internet connection</li>
              <li>You cannot pause or restart the test once started</li>
              <li>Click "Submit Test" when you're done or time runs out</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/candidate/${candidateId}/jobs/${jobId}`)}
              className="btn btn-secondary"
            >
              Go Back
            </button>
            <button
              onClick={startTest}
              className="btn btn-primary btn-lg"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="take-test">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">{test.title}</h1>
          <div 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: getTimeColor() 
            }}
          >
            Time: {formatTime(timeRemaining)}
          </div>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div style={{ marginBottom: '2rem' }}>
            {questions.map((question, index) => (
              <div key={question._id} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Question {index + 1} ({question.difficulty})
                  </h3>
                  <p style={{ lineHeight: '1.6' }}>{question.questionText}</p>
                </div>

                {question.type === 'mcq' && question.options ? (
                  <div>
                    {question.options.map((option, optionIndex) => (
                      <label 
                        key={optionIndex}
                        style={{
                          display: 'block',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderRadius: '0.25rem',
                          marginBottom: '0.25rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="radio"
                          name={question._id}
                          value={option}
                          checked={values[question._id!] === option}
                          onChange={() => handleChange(question._id!, option)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="form-textarea"
                    value={values[question._id!] || ''}
                    onChange={(e) => handleChange(question._id!, e.target.value)}
                    placeholder="Enter your answer..."
                    rows={question.type === 'coding' ? 8 : 4}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Submit Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TakeTest;