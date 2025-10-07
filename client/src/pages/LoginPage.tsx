import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card, CardContent, CardHeader } from '../components/shared/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'admin' | 'interviewer'>('candidate');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, isLoading, error, clearError } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;
    
    try {
      await login(email, password, role);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleRoleChange = (newRole: 'candidate' | 'admin' | 'interviewer') => {
    setRole(newRole);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hiring Platform</h1>
          <h2 className="mt-6 text-2xl font-medium text-gray-900">Sign in to your account</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
              {(['candidate', 'interviewer', 'admin'] as const).map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => handleRoleChange(roleOption)}
                  className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                    role === roleOption
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </button>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <p><strong>Candidate:</strong> candidate@demo.com / password123</p>
                <p><strong>Interviewer:</strong> interviewer@demo.com / password123</p>
                <p><strong>Admin:</strong> admin@demo.com / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
