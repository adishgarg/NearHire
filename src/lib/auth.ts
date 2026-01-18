export const runtime = "nodejs"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Helper function to get Prisma client safely
let prismaInstance: any

async function getPrismaClient() {
  try {
    console.log('🔄 Initializing Prisma v5 client...')
    
    const { PrismaClient } = await import('@prisma/client')
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
      await prismaInstance.$connect()
      console.log('✅ Prisma client connected successfully')
    }
    return prismaInstance
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error)
    throw error
  }
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is not set. OAuth will not work without it.")
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      async profile(profile, tokens) {
        console.log("🐙 GitHub profile received - Login:", profile.login, "Email:", profile.email)

        let email = profile.email as string | null

        // Fetch primary email if not public
        if (!email && tokens?.access_token) {
          try {
            console.log("📧 Fetching GitHub emails via API...")
            const res = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/vnd.github+json",
                "Accept-Language": "en-us",
                "User-Agent": "NearHire/1.0 (https://near-hire.vercel.app)",
              },
            })

            if (res.ok) {
              const emails = await res.json()
              console.log("📧 GitHub emails fetched:", JSON.stringify(emails, null, 2))
              
              const primary = Array.isArray(emails)
                ? emails.find((e: any) => e.primary && e.verified)
                : null

              email = primary?.email || null
              
              if (!email && Array.isArray(emails) && emails.length > 0) {
                // Use first verified email if no primary
                const verified = emails.find((e: any) => e.verified)
                email = verified?.email || null
              }
              
              console.log("📧 Selected email:", email)
            } else {
              console.error("❌ Failed to fetch GitHub emails - Status:", res.status)
            }
          } catch (err) {
            console.error("❌ Failed to fetch GitHub emails:", err)
          }
        }

        // If still no email, create a fallback using GitHub ID
        if (!email) {
          email = `${profile.login}@github-user-${profile.id}.nearhire.local`
          console.log("⚠️ No email found, using fallback:", email)
        }

        const userProfile = {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email,
          image: profile.avatar_url,
        }
        
        console.log("✅ GitHub profile processed:", JSON.stringify(userProfile, null, 2))
        return userProfile
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        try {
          const prisma = await getPrismaClient()
          
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              onboardingCompleted: true,
            }
          })

          if (!user || !user.password) {
            throw new Error("Invalid email or password")
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          console.log('✅ Credentials authentication successful:', user.email)
          
          // Return user object that will be saved in JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            onboardingCompleted: user.onboardingCompleted,
          }
        } catch (error) {
          console.error('❌ Credentials authentication failed:', error)
          throw new Error("Authentication failed")
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🚀 SignIn callback started')
        console.log('   User:', JSON.stringify(user, null, 2))
        console.log('   Provider:', account?.provider)
        
        if (!user.email) {
          console.error('❌ No email provided for user after profile processing')
          console.error('   User object:', JSON.stringify(user, null, 2))
          console.error('   Profile:', JSON.stringify(profile, null, 2))
          return false
        }

        // For OAuth providers, create/update user in database
        if (account?.provider === 'google' || account?.provider === 'github') {
          try {
            const prisma = await getPrismaClient()
            
            console.log('   Attempting to upsert user with email:', user.email)
            
            const dbUser = await prisma.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
              },
              create: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
              },
            })
            
            // CRITICAL: Update the user.id to match the database ID
            user.id = dbUser.id
            
            console.log('✅ User upserted successfully - Email:', dbUser.email, 'DB ID:', dbUser.id)
            return true
          } catch (error) {
            console.error('❌ Database error during OAuth sign in:', error)
            // Allow sign in anyway and let JWT callback handle it
            console.log('⚠️ Allowing sign in despite database error')
            return true
          }
        }
        
        console.log('✅ SignIn callback successful')
        return true
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        // Allow sign in to proceed
        return true
      }
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string || session.user.name
        session.user.image = token.picture as string || session.user.image
        // Add onboarding status to session
        const extendedUser = session.user as any
        extendedUser.onboardingCompleted = token.onboardingCompleted as boolean
      }
      
      return session
    },
    async jwt({ token, account, user, trigger }) {
      // On sign in (when user object is available)
      if (user) {
        // For OAuth, we need to get the database user ID
        if (account?.provider === 'google' || account?.provider === 'github') {
          try {
            const prisma = await getPrismaClient()
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email as string },
              select: { id: true, email: true, name: true, image: true, onboardingCompleted: true }
            })
            
            if (dbUser) {
              token.id = dbUser.id
              token.email = dbUser.email
              token.name = dbUser.name
              token.picture = dbUser.image
              token.onboardingCompleted = dbUser.onboardingCompleted
            } else {
              // Use OAuth user data as fallback
              token.id = user.id
              token.email = user.email
              token.name = user.name
              token.picture = user.image
              token.onboardingCompleted = false // Default for new OAuth users
            }
            
          } catch (error) {
            // Fallback to OAuth user data
            token.id = user.id
            token.email = user.email
            token.name = user.name
            token.picture = user.image
            token.onboardingCompleted = false
          }
        } else {
          // For credentials login, use the user ID directly
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.picture = user.image
          token.onboardingCompleted = (user as any).onboardingCompleted ?? false
        }
      }
      
      // On session update (when trigger is 'update'), refresh user data from database
      if (trigger === 'update' && token.email) {
        try {
          const prisma = await getPrismaClient()
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, email: true, name: true, image: true, onboardingCompleted: true }
          })
          
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted
            token.name = dbUser.name
            token.picture = dbUser.image
          }
        } catch (error) {
          // Silent fail on refresh
        }
      }
      
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  debug: process.env.NODE_ENV === 'development',
})