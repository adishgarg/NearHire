'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Github, Mail, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would typically call your API to create the user
      // For now, we'll just redirect to login
      console.log('Signup data:', formData);
      router.push('/auth/login?message=Account created successfully');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-zinc-400">Join thousands of freelancers and clients</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 hover:border-zinc-600"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 hover:border-zinc-600"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator className="bg-zinc-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-3 text-sm text-zinc-400">
              Or create account with email
            </span>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-300">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-300">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div className={cn(
                        "w-3 h-3 rounded-full flex items-center justify-center",
                        req.met ? "bg-emerald-500" : "bg-zinc-600"
                      )}>
                        {req.met && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span className={cn(
                        req.met ? "text-emerald-400" : "text-zinc-400"
                      )}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={cn(
                    "bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10",
                    formData.confirmPassword && formData.password !== formData.confirmPassword && "border-red-500 focus:border-red-500"
                  )}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                className="mt-0.5 border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <div className="text-sm text-zinc-400">
                I agree to the{' '}
                <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}