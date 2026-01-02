'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  useEffect(() => {
    if (!token) {
      setError('No reset token provided');
    }
  }, [token]);

  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5ecdf] p-4">
        <Card className="w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
          <CardHeader className="text-center p-8">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</CardTitle>
            <CardDescription className="text-gray-600">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Button 
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5ecdf] p-4">
        <Card className="w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
          <CardHeader className="text-center p-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</CardTitle>
            <CardDescription className="text-gray-600">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8 pt-0">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                You can now log in with your new password.
              </AlertDescription>
            </Alert>
            <p className="text-center text-sm text-gray-600">
              Redirecting to login page...
            </p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5ecdf] p-4">
      <Card className="w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
        <CardHeader className="text-center p-8">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-gray-900" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-8 pt-0">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20 pr-10 rounded-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20 pr-10 rounded-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <p className="text-xs text-gray-700 font-medium">Password must contain:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-green-700' : 'text-gray-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-600' : 'bg-gray-400'}`} />
                  8+ characters
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-green-700' : 'text-gray-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasUppercase ? 'bg-green-600' : 'bg-gray-400'}`} />
                  Uppercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-green-700' : 'text-gray-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasLowercase ? 'bg-green-600' : 'bg-gray-400'}`} />
                  Lowercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasNumber ? 'bg-green-600' : 'bg-gray-400'}`} />
                  Number
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !Object.values(passwordStrength).every(Boolean)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
