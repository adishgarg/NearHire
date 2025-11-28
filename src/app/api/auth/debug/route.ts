import { NextResponse } from 'next/server';

export async function GET() {
  // Debug OAuth configuration
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Missing ❌',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Missing ❌',
    githubId: process.env.GITHUB_ID ? 'Set ✓' : 'Missing ❌',
    githubSecret: process.env.GITHUB_SECRET ? 'Set ✓' : 'Missing ❌',
    nextauthUrl: process.env.NEXTAUTH_URL || 'Not set',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'Set ✓' : 'Missing ❌'
  };

  return NextResponse.json({
    message: 'OAuth Configuration Check',
    config,
    redirectUris: {
      google: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      github: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
    }
  });
}