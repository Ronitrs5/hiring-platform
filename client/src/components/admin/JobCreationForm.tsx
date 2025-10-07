import React, { useState } from 'react';
import { CreateJobForm, InterviewStage } from '../../types';
import { Card, CardContent, CardHeader } from '../shared/Card';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

interface JobCreationFormProps {
  onSubmit: (jobData: CreateJobForm) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const JobCreationForm: React.FC<JobCreationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateJobForm>({
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: [''],
    interviewLoop: [
      { id: '1', name: 'Online Assessment', type: 'oa', order: 1, duration: 120, cutoffScore: 60 },
      { id: '2', name: 'Aptitude Test', type: 'aptitude', order: 2, duration: 90, cutoffScore: 70 },
      { id: '3', name: 'Technical Round 1', type: 'technical', order: 3, cutoffScore: 3 },
      { id: '4', name: 'Technical Round 2', type: 'technical', order: 4, cutoffScore: 3 },
      { id: '5', name: 'HR Round', type: 'hr', order: 5, cutoffScore: 3 },
    ],
    oaCutoff: 60,
    aptiCutoff: 70,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (formData.requirements.every(req => !req.trim())) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
      };
      onSubmit(cleanedData);
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, requirements: newRequirements }));
    }
  };

  const handleStageChange = (index: number, field: keyof InterviewStage, value: any) => {
    const newStages = [...formData.interviewLoop];
    newStages[index] = { ...newStages[index], [field]: value };
    setFormData(prev => ({ ...prev, interviewLoop: newStages }));
  };

  const addStage = () => {
    const newStage: InterviewStage = {
      id: Date.now().toString(),
      name: '',
      type: 'technical',
      order: formData.interviewLoop.length + 1,
      cutoffScore: 3,
    };
    setFormData(prev => ({
      ...prev,
      interviewLoop: [...prev.interviewLoop, newStage]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.interviewLoop.length > 1) {
      const newStages = formData.interviewLoop.filter((_, i) => i !== index);
      // Reorder stages
      const reorderedStages = newStages.map((stage, i) => ({ ...stage, order: i + 1 }));
      setFormData(prev => ({ ...prev, interviewLoop: reorderedStages }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
          <p className="text-sm text-gray-600">Fill in the details to create a new job posting</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={errors.title}
                  placeholder="e.g. Senior Software Engineer"
                />
                
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  error={errors.department}
                  placeholder="e.g. Engineering"
                />
              </div>

              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                error={errors.location}
                placeholder="e.g. San Francisco, CA / Remote"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
              
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addRequirement}
              >
                Add Requirement
              </Button>
              
              {errors.requirements && (
                <p className="text-sm text-red-600">{errors.requirements}</p>
              )}
            </div>

            {/* Assessment Cutoffs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Assessment Cutoffs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Online Assessment Cutoff (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.oaCutoff}
                  onChange={(e) => setFormData(prev => ({ ...prev, oaCutoff: Number(e.target.value) }))}
                  placeholder="60"
                />
                
                <Input
                  label="Aptitude Test Cutoff (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.aptiCutoff}
                  onChange={(e) => setFormData(prev => ({ ...prev, aptiCutoff: Number(e.target.value) }))}
                  placeholder="70"
                />
              </div>
            </div>

            {/* Interview Loop */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Interview Loop</h3>
              
              <div className="space-y-4">
                {formData.interviewLoop.map((stage, index) => (
                  <Card key={stage.id} className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="Stage Name"
                        value={stage.name}
                        onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                        placeholder="e.g. Technical Round 1"
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={stage.type}
                          onChange={(e) => handleStageChange(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="oa">Online Assessment</option>
                          <option value="aptitude">Aptitude Test</option>
                          <option value="technical">Technical Interview</option>
                          <option value="hr">HR Interview</option>
                        </select>
                      </div>
                      
                      {(stage.type === 'oa' || stage.type === 'aptitude') && (
                        <Input
                          label="Duration (min)"
                          type="number"
                          min="1"
                          value={stage.duration || ''}
                          onChange={(e) => handleStageChange(index, 'duration', Number(e.target.value))}
                          placeholder="120"
                        />
                      )}
                      
                      <div className="flex items-end space-x-2">
                        <Input
                          label="Cutoff Score"
                          type="number"
                          min="1"
                          max="5"
                          value={stage.cutoffScore || ''}
                          onChange={(e) => handleStageChange(index, 'cutoffScore', Number(e.target.value))}
                          placeholder="3"
                          helperText={stage.type === 'oa' || stage.type === 'aptitude' ? '% score' : '1-5 rating'}
                        />
                        
                        {formData.interviewLoop.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeStage(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addStage}
              >
                Add Interview Stage
              </Button>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
