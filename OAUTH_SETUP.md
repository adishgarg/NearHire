# OAuth Setup Guide for NearHire

## Overview
NearHire now has OAuth authentication implemented with Google and GitHub providers using NextAuth v5.

## Current Setup

### Files Created/Modified:
1. **`src/lib/auth.ts`** - NextAuth configuration with Google/GitHub providers
2. **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth API route handler
3. **`src/middleware.ts`** - Route protection middleware
4. **`src/app/layout.tsx`** - SessionProvider wrapper
5. **Auth pages** - Login/signup pages already have OAuth buttons

### Authentication Features:
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration  
- ✅ JWT-based sessions (for build compatibility)
- ✅ Login/logout functionality
- ✅ Protected routes (dashboard, profile, orders, messages, gigs/create)
- ✅ Session management in Header component

## Setup Instructions

### 1. Environment Variables
Copy `.env.local.template` to `.env.local` and fill in:

```bash
# Required for NextAuth
NEXTAUTH_SECRET="your-long-random-string-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_ID="your-github-app-id" 
GITHUB_SECRET="your-github-app-secret"
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### 3. GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://your-domain.com/api/auth/callback/github` (production)

### 4. Production Deployment (Vercel)
Add environment variables in Vercel dashboard:
- `NEXTAUTH_SECRET` - Generate a strong secret
- `NEXTAUTH_URL` - Your production URL (e.g., https://nearhire.vercel.app)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID` & `GITHUB_SECRET`

## Usage

### For Users:
1. Click "Sign in" or "Join NearHire" in header
2. Choose email login or OAuth (Google/GitHub)
3. After login, avatar appears in header with dropdown menu
4. Click avatar → "Logout" to sign out

### For Developers:
```tsx
import { useSession, signIn, signOut } from 'next-auth/react'

function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  
  if (session) {
    return (
      <>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  
  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
      <button onClick={() => signIn('github')}>Sign in with GitHub</button>
    </>
  )
}
```

## Next Steps (Optional Enhancements)

### 1. Database Integration
To store user sessions in database, uncomment in `auth.ts`:
```ts
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Add to NextAuth config:
adapter: PrismaAdapter(prisma),
session: { strategy: "database" },
```

### 2. Additional Providers
Add more OAuth providers (Discord, Twitter, etc.):
```ts
import Discord from "next-auth/providers/discord"

providers: [
  // ... existing providers
  Discord({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  })
]
```

### 3. Role-based Access
Add user roles to JWT:
```ts
callbacks: {
  jwt({ token, user }) {
    if (user) token.role = user.role
    return token
  },
  session({ session, token }) {
    session.user.role = token.role
    return session
  }
}
```

## Troubleshooting

### Common Issues:
1. **Build errors**: Use JWT strategy instead of database strategy for build compatibility
2. **Redirect errors**: Ensure callback URLs match exactly in OAuth app settings
3. **Session not persisting**: Check NEXTAUTH_SECRET is set
4. **CORS errors**: Verify NEXTAUTH_URL matches your domain

### Testing OAuth Locally:
1. Use ngrok for localhost tunneling: `ngrok http 3000`
2. Update OAuth app redirect URLs to use ngrok URL
3. Set NEXTAUTH_URL to ngrok URL in .env.local