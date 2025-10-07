import React, { useState } from 'react';
import { User, Interview, TestResult, InterviewRatingForm } from '../../types';
import { Card, CardContent, CardHeader } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { formatDate, getScoreBadgeColor } from '../../utils/helpers';

interface CandidateEvaluationProps {
  candidate: User;
  interview: Interview;
  testResults: TestResult[];
  onSubmitRating: (rating: InterviewRatingForm) => void;
  isSubmitting?: boolean;
}

export const CandidateEvaluation: React.FC<CandidateEvaluationProps> = ({
  candidate,
  interview,
  testResults,
  onSubmitRating,
  isSubmitting = false,
}) => {
  const [ratings, setRatings] = useState({
    communication: 0,
    technicalSkills: 0,
    problemSolving: 0,
    culturalFit: 0,
    overallRating: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [recommendation, setRecommendation] = useState<'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire'>('hire');

  const handleRatingChange = (dimension: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [dimension]: value }));
  };

  const handleSubmit = () => {
    const ratingForm: InterviewRatingForm = {
      dimensions: ratings,
      feedback,
      recommendation,
    };
    onSubmitRating(ratingForm);
  };

  const isFormValid = () => {
    return Object.values(ratings).every(rating => rating > 0) && feedback.trim().length > 0;
  };

  const RatingInput = ({ 
    label, 
    dimension, 
    value 
  }: { 
    label: string; 
    dimension: keyof typeof ratings; 
    value: number; 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleRatingChange(dimension, rating)}
            className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
              value >= rating
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {value === 0 && 'Click to rate'}
        {value === 1 && 'Poor'}
        {value === 2 && 'Below Average'}
        {value === 3 && 'Average'}
        {value === 4 && 'Good'}
        {value === 5 && 'Excellent'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Candidate Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Candidate Information</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{candidate.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {candidate.email}</p>
                {candidate.phone && <p><strong>Phone:</strong> {candidate.phone}</p>}
                <p><strong>Applied:</strong> {formatDate(candidate.createdAt)}</p>
              </div>
            </div>
            <div>
              {candidate.resumeUrl ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(candidate.resumeUrl, '_blank')}
                  >
                    View Resume
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Previous Assessment Results</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Assessment</h4>
                    <p className="text-sm text-gray-600">
                      Completed on {formatDate(result.submittedAt || result.startedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getScoreBadgeColor(result.totalScore, 100)}>
                      {result.totalScore}/100
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.answers.length} questions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Rating Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Interview Evaluation</h2>
          <p className="text-sm text-gray-600">Rate the candidate on different dimensions (1-5 scale)</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Rating Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RatingInput
                label="Communication Skills"
                dimension="communication"
                value={ratings.communication}
              />
              <RatingInput
                label="Technical Skills"
                dimension="technicalSkills"
                value={ratings.technicalSkills}
              />
              <RatingInput
                label="Problem Solving"
                dimension="problemSolving"
                value={ratings.problemSolving}
              />
              <RatingInput
                label="Cultural Fit"
                dimension="culturalFit"
                value={ratings.culturalFit}
              />
            </div>

            {/* Overall Rating */}
            <div className="border-t pt-6">
              <RatingInput
                label="Overall Rating"
                dimension="overallRating"
                value={ratings.overallRating}
              />
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendation
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'strong_hire', label: 'Strong Hire', color: 'bg-green-100 text-green-800 border-green-300' },
                  { value: 'hire', label: 'Hire', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  { value: 'no_hire', label: 'No Hire', color: 'bg-red-100 text-red-800 border-red-300' },
                  { value: 'strong_no_hire', label: 'Strong No Hire', color: 'bg-red-200 text-red-900 border-red-400' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRecommendation(option.value as any)}
                    className={`p-3 text-sm font-medium border-2 rounded-lg transition-colors ${
                      recommendation === option.value
                        ? option.color
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Feedback *
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about the candidate's performance, strengths, areas for improvement, and any specific observations..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Evaluation Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Communication</p>
                  <p className="font-medium">{ratings.communication}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Technical</p>
                  <p className="font-medium">{ratings.technicalSkills}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Problem Solving</p>
                  <p className="font-medium">{ratings.problemSolving}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Cultural Fit</p>
                  <p className="font-medium">{ratings.culturalFit}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Overall</p>
                  <p className="font-medium">{ratings.overallRating}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Recommendation</p>
                  <p className="font-medium capitalize">{recommendation.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  // Reset form or navigate back
                  setRatings({
                    communication: 0,
                    technicalSkills: 0,
                    problemSolving: 0,
                    culturalFit: 0,
                    overallRating: 0,
                  });
                  setFeedback('');
                  setRecommendation('hire');
                }}
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                isLoading={isSubmitting}
              >
                Submit Evaluation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
