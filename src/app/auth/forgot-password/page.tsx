'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5ecdf] p-4">
        <Card className="w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent password reset instructions to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8 pt-0">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
              </AlertDescription>
            </Alert>
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Didn't receive the email? Check your spam folder.</p>
              <p>The link will expire in 1 hour.</p>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button 
              onClick={() => router.push('/auth/login')}
              variant="outline"
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
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
            <Mail className="h-12 w-12 text-gray-900" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions
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
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20 rounded-full"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="p-8 pt-0">
          <p className="text-center w-full text-gray-600">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
