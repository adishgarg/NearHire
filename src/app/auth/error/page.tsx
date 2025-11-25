'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access was denied. Please try again.'
      case 'Verification':
        return 'The verification link has expired or has already been used.'
      case 'OAuthAccountNotLinked':
        return 'This account is already linked to another provider. Try signing in with a different method.'
      case 'OAuthSignin':
        return 'Error occurred during OAuth signin. Please try again.'
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback. Please try again.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. The account may already exist.'
      case 'EmailCreateAccount':
        return 'Could not create account with email. Please try a different approach.'
      case 'Callback':
        return 'Error occurred during callback. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in with your original provider.'
      default:
        return 'An error occurred during authentication. Please try again.'
    }
  }

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
      case 'EmailCreateAccount':
      case 'OAuthCreateAccount':
        return 'Account Already Exists'
      case 'AccessDenied':
        return 'Access Denied'
      case 'Configuration':
        return 'Server Error'
      default:
        return 'Authentication Error'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl rounded-lg">
        <div className="text-center pb-4 p-6">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {getErrorTitle(error)}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="space-y-4 p-6">{/* Rest of content */}
          {error === 'OAuthAccountNotLinked' || error === 'OAuthCreateAccount' ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
              <p className="text-amber-300 text-sm">
                💡 <strong>Tip:</strong> Try signing in instead of signing up if you already have an account.
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/auth/login">
                Try Sign In
              </Link>
            </Button>
            
            {error === 'OAuthAccountNotLinked' && (
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/auth/signup">
                  Create New Account
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600">
              <Link href="/" className="flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          {error && (
            <div className="pt-4 border-t border-zinc-800">
              <details className="text-xs text-zinc-500">
                <summary className="cursor-pointer hover:text-zinc-400">Error Details</summary>
                <p className="mt-2 font-mono bg-zinc-950 p-2 rounded border">
                  Error Code: {error}
                </p>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}