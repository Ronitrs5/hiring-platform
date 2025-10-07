import React, { useState } from 'react';
import { Question, TestSession } from '../../types';
import { Button } from '../shared/Button';
import { Card, CardContent, CardHeader } from '../shared/Card';
import { formatTime } from '../../utils/helpers';

interface TestTakingPageProps {
  testSession: TestSession;
  onSubmitAnswer: (questionId: string, answer: string) => void;
  onSubmitTest: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
}

export const TestTakingPage: React.FC<TestTakingPageProps> = ({
  testSession,
  onSubmitAnswer,
  onSubmitTest,
  onNextQuestion,
  onPreviousQuestion,
}) => {
  const [currentAnswer, setCurrentAnswer] = useState<string>(
    testSession.answers[testSession.questions[testSession.currentQuestionIndex]._id] || ''
  );

  const currentQuestion = testSession.questions[testSession.currentQuestionIndex];
  const isLastQuestion = testSession.currentQuestionIndex === testSession.questions.length - 1;
  const isFirstQuestion = testSession.currentQuestionIndex === 0;

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
    onSubmitAnswer(currentQuestion._id, answer);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      onNextQuestion();
      setCurrentAnswer(
        testSession.answers[testSession.questions[testSession.currentQuestionIndex + 1]._id] || ''
      );
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      onPreviousQuestion();
      setCurrentAnswer(
        testSession.answers[testSession.questions[testSession.currentQuestionIndex - 1]._id] || ''
      );
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Question {testSession.currentQuestionIndex + 1} of {testSession.questions.length}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {currentQuestion.questionText}
            </p>
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Coding Question {testSession.currentQuestionIndex + 1} of {testSession.questions.length}
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a simplified coding interface. In a full implementation, 
                you would integrate Monaco Editor or similar for code editing with syntax highlighting.
              </p>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {currentQuestion.questionText}
            </p>
            {currentQuestion.testCases && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Sample Test Cases:</h4>
                <div className="space-y-2 text-sm">
                  {currentQuestion.testCases.slice(0, 2).map((testCase, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <div><strong>Input:</strong> {testCase.input}</div>
                      <div><strong>Output:</strong> {testCase.expectedOutput}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your code here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'descriptive':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Question {testSession.currentQuestionIndex + 1} of {testSession.questions.length}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {currentQuestion.questionText}
            </p>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Test in Progress</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Time Remaining: {formatTime(testSession.timeRemaining)}
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={onSubmitTest}
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {testSession.questions.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full text-sm font-medium border-2 ${
                  index === testSession.currentQuestionIndex
                    ? 'bg-blue-600 text-white border-blue-600'
                    : testSession.answers[testSession.questions[index]._id]
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
                onClick={() => {
                  // In a full implementation, you'd handle question navigation here
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={isLastQuestion ? onSubmitTest : handleNext}
          >
            {isLastQuestion ? 'Submit Test' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
