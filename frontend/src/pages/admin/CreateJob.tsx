import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../../services';
import { CreateJobRequest } from '../../types';
import { useForm } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = (values: CreateJobRequest) => {
    const errors: Record<string, string> = {};
    
    if (!values.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!values.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (!values.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!values.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (values.requirements.length === 0) {
      errors.requirements = 'At least one requirement is needed';
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
    reset
  } = useForm<CreateJobRequest>({
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: [],
    // createdBy field is optional for demo purposes
  }, validateForm);

  const [currentRequirement, setCurrentRequirement] = useState('');

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      handleChange('requirements', [...values.requirements, currentRequirement.trim()]);
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = values.requirements.filter((_, i) => i !== index);
    handleChange('requirements', newRequirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await JobService.createJob(values);
      setSuccess('Job created successfully!');
      
      setTimeout(() => {
        navigate('/admin/jobs');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setCurrentRequirement('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="create-job">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create New Job</h1>
          <button 
            type="button" 
            onClick={handleReset}
            className="btn btn-outline"
          >
            Reset Form
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

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="form-input"
                value={values.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="e.g. Senior Frontend Developer"
              />
              {touched.title && errors.title && (
                <div className="form-error">{errors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                className="form-input"
                value={values.department}
                onChange={(e) => handleChange('department', e.target.value)}
                onBlur={() => handleBlur('department')}
                placeholder="e.g. Engineering"
              />
              {touched.department && errors.department && (
                <div className="form-error">{errors.department}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              value={values.location}
              onChange={(e) => handleChange('location', e.target.value)}
              onBlur={() => handleBlur('location')}
              placeholder="e.g. Remote, New York, San Francisco"
            />
            {touched.location && errors.location && (
              <div className="form-error">{errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea
              className="form-textarea"
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
            />
            {touched.description && errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Requirements *</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                placeholder="Enter a requirement..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="btn btn-primary"
                disabled={!currentRequirement.trim()}
              >
                Add
              </button>
            </div>
            
            {values.requirements.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {values.requirements.map((req, index) => (
                  <span 
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#e5e7eb',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {touched.requirements && errors.requirements && (
              <div className="form-error">{errors.requirements}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;