'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingComplete = searchParams.get('onboardingComplete');

  // Check for post-onboarding redirect
  useEffect(() => {
    if (onboardingComplete === 'true') {
      const redirectPath = localStorage.getItem('postOnboardingRedirect');
      if (redirectPath) {
        localStorage.removeItem('postOnboardingRedirect');
        // Show message to user
        setError('Please sign in again to complete setup.');
      }
    }
  }, [onboardingComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.ok) {
        // Check for stored redirect path
        const redirectPath = localStorage.getItem('postOnboardingRedirect') || '/profile';
        localStorage.removeItem('postOnboardingRedirect');
        router.push(redirectPath);
      } else {
        setError('Invalid email or password. Please try again.');
        console.error('Login failed:', result?.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      console.log(`🔄 Starting ${provider} OAuth sign-in...`);
      
      // Get stored redirect path or default to profile
      const redirectPath = localStorage.getItem('postOnboardingRedirect') || '/profile';
      
      await signIn(provider, { 
        callbackUrl: redirectPath
      });
      
    } catch (error) {
      console.error(`💥 ${provider} OAuth login error:`, error);
      router.push('/auth/error?error=OAuthSignin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center p-4">
      <Card className="relative w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 rounded-full"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 rounded-full"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator className="bg-gray-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-600">
              Or sign in with email
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20 rounded-full"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20 pr-10 rounded-full"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Loading fallback for Suspense boundary
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center p-4">
      <Card className="relative w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mx-auto"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}