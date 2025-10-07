import React from 'react';
import { Application, Job } from '../../types';
import { Card, CardContent, CardHeader } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { formatDate, getStageIcon } from '../../utils/helpers';

interface JobCardProps {
  application: Application;
  job: Job;
  onStartStage: (stageId: string) => void;
  onViewDetails: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  application,
  job,
  onStartStage,
  onViewDetails,
}) => {
  const currentStageProgress = application.stageProgress?.find(
    (stage) => stage.status === 'pending' || stage.status === 'in-progress'
  );

  const completedStages = application.stageProgress?.filter(
    (stage) => stage.status === 'completed'
  ).length || 0;

  const totalStages = application.stageProgress?.length || 0;

  return (
    <Card hover className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
          </div>
          <Badge variant="status" status={application.status}>
            {application.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedStages}/{totalStages} stages completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalStages > 0 ? (completedStages / totalStages) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Current Stage */}
          {currentStageProgress && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getStageIcon(currentStageProgress.stageName.toLowerCase())}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {currentStageProgress.stageName}
                    </h4>
                    <Badge variant="status" status={currentStageProgress.status}>
                      {currentStageProgress.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {currentStageProgress.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => onStartStage(currentStageProgress.stageId)}
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Stage Timeline */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Interview Loop</h5>
            <div className="space-y-2">
              {application.stageProgress?.map((stage, index) => (
                <div key={stage.stageId} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    stage.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : stage.status === 'in-progress'
                      ? 'bg-blue-500 text-white'
                      : stage.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stage.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {stage.stageName}
                    </span>
                    {stage.score !== undefined && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({stage.score}/{stage.maxScore})
                      </span>
                    )}
                  </div>
                  <Badge variant="status" status={stage.status}>
                    {stage.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Job Details */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              {job.description.length > 120 
                ? `${job.description.substring(0, 120)}...` 
                : job.description
              }
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Applied on {formatDate(application.appliedAt)}
              </span>
              <Button variant="ghost" size="sm" onClick={onViewDetails}>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
