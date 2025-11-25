import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Helper function to get Prisma client safely
async function getPrismaClient() {
  try {
    console.log('🔄 Initializing Prisma v5 client...')
    
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    await prisma.$connect()
    console.log('✅ Prisma client connected successfully')
    return prisma
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error)
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
            where: { email: credentials.email as string }
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
      console.log('🚀 =================================')
      console.log('🚀 SIGNIN CALLBACK TRIGGERED')
      console.log('🚀 User:', JSON.stringify(user, null, 2))
      console.log('🚀 Account:', JSON.stringify(account, null, 2))
      console.log('🚀 Window check:', typeof window)
      console.log('🚀 =================================')
      
      // Create/update user in database (server-side only)
      if (typeof window === 'undefined' && user.email) {
        console.log('✅ Server-side check passed, proceeding with database operation...')
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
          
          console.log('🎉 SUCCESS! User successfully saved to database:', { 
            id: savedUser.id, 
            email: savedUser.email,
            name: savedUser.name
          })
          
        } catch (error) {
          console.error('💥 ERROR in signIn user creation:', {
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
      } else {
        console.log('❌ Server-side check failed:', {
          windowType: typeof window,
          userEmail: user.email,
          hasEmail: !!user.email
        })
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
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎯 =================================')
      console.log('🎯 EVENTS.SIGNIN TRIGGERED')
      console.log('🎯 User:', user.email)
      console.log('🎯 IsNewUser:', isNewUser)
      console.log('🎯 Account Provider:', account?.provider)
      console.log('🎯 =================================')
      
      if (user.email) {
        let prisma
        try {
          console.log('🎯 Events: Initializing Prisma for user creation...')
          prisma = await getPrismaClient()
          const savedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: { 
              name: user.name || null, 
              image: user.image || null 
            },
            create: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              emailVerified: new Date(),
            },
          })
          console.log('🎯 SUCCESS! User created via events:', {
            id: savedUser.id,
            email: savedUser.email,
            name: savedUser.name
          })
        } catch (error) {
          console.error('🎯 Events error:', {
            error: error instanceof Error ? error.message : String(error),
            userEmail: user.email
          })
        } finally {
          if (prisma) {
            try {
              await prisma.$disconnect()
              console.log('🎯 Events: Prisma disconnected')
            } catch (disconnectError) {
              console.error('🎯 Events: Disconnect error:', disconnectError)
            }
          }
        }
      } else {
        console.log('🎯 Events: No user email found')
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
})