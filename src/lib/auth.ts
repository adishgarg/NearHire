import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

// Helper function to get Prisma client safely
async function getPrismaClient() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
    return prisma
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    throw error
  }
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
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
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
      console.log('🔄 SignIn callback started:', { 
        user: user.email, 
        provider: account?.provider,
        profile: profile?.name 
      })
      
      // Create/update user in database (server-side only)
      if (typeof window === 'undefined' && user.email) {
        let prisma
        try {
          console.log('🔄 Initializing Prisma client for user creation...')
          prisma = await getPrismaClient()
          
          console.log('🔄 Attempting to upsert user:', user.email)
          const savedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || null,
              image: user.image || null,
            },
            create: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              emailVerified: new Date(),
            },
          })
          
          console.log('✅ User successfully saved to database:', { 
            id: savedUser.id, 
            email: savedUser.email,
            name: savedUser.name
          })
          
        } catch (error) {
          console.error('❌ Error in signIn user creation:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            userEmail: user.email
          })
          // Don't fail login if database save fails
        } finally {
          if (prisma) {
            try {
              await prisma.$disconnect()
              console.log('🔄 Prisma client disconnected in signIn')
            } catch (disconnectError) {
              console.error('❌ Error disconnecting Prisma in signIn:', disconnectError)
            }
          }
        }
      }
      
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        
        // Get user data from database (server-side only)
        if (typeof window === 'undefined' && session.user.email) {
          let prisma
          try {
            console.log('🔄 Fetching user from database in session callback:', session.user.email)
            prisma = await getPrismaClient()
            
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email }
            })
            
            if (dbUser) {
              session.user.id = dbUser.id
              console.log('✅ Found user in database:', { 
                id: dbUser.id, 
                email: dbUser.email,
                name: dbUser.name
              })
            } else {
              console.log('⚠️ User not found in database:', session.user.email)
            }
            
          } catch (error) {
            console.error('❌ Error fetching user from database:', {
              error: error instanceof Error ? error.message : String(error),
              userEmail: session.user.email
            })
          } finally {
            if (prisma) {
              try {
                await prisma.$disconnect()
                console.log('🔄 Prisma client disconnected in session')
              } catch (disconnectError) {
                console.error('❌ Error disconnecting Prisma in session:', disconnectError)
              }
            }
          }
        }
      }
      
      console.log('Session callback result:', { 
        sessionUser: session.user?.email,
        userId: session.user?.id 
      })
      return session
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        console.log('JWT callback:', { 
          provider: account.provider, 
          user: user?.email 
        })
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      // Always redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  debug: process.env.NODE_ENV === 'development',
})