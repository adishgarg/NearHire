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
        console.log("🐙 GitHub profile received:", profile.login, profile.email)

        let email = profile.email as string | null

        // Fetch primary email if not public
        if (!email && tokens?.access_token) {
          try {
            const res = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/vnd.github+json",
              },
            })

            const emails = await res.json()
            const primary = Array.isArray(emails)
              ? emails.find((e: any) => e.primary && e.verified)
              : null

            email = primary?.email || null
          } catch (err) {
            console.error("❌ Failed to fetch GitHub emails:", err)
          }
        }

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email,
          image: profile.avatar_url,
        }
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
      try {
        console.log('🚀 SignIn callback - User:', user.email, 'Provider:', account?.provider)
        
        if (!user.email) {
          console.error('❌ No email provided for user, rejecting sign in')
          return false
        }

        // For OAuth providers, create/update user in database
        if (account?.provider === 'google' || account?.provider === 'github') {
          try {
            const prisma = await getPrismaClient()
            
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
            // Don't allow login if we can't save to database
            return false
          }
        }
        
        return true
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string || session.user.name
        session.user.image = token.picture as string || session.user.image
      }
      return session
    },
    async jwt({ token, account, user }) {
      // On sign in (when user object is available)
      if (user) {
        // For OAuth, we need to get the database user ID
        if (account?.provider === 'google' || account?.provider === 'github') {
          try {
            const prisma = await getPrismaClient()
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email as string },
              select: { id: true, email: true, name: true, image: true }
            })
            
            if (dbUser) {
              token.id = dbUser.id
              token.email = dbUser.email
              token.name = dbUser.name
              token.picture = dbUser.image
              console.log('✅ JWT token created with DB user - Email:', dbUser.email, 'ID:', dbUser.id)
            } else {
              console.error('❌ User not found in database after OAuth sign in')
              throw new Error('User not found in database')
            }
            
          } catch (error) {
            console.error('❌ Error fetching user for JWT:', error)
            throw error
          }
        } else {
          // For credentials login, use the user ID directly
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.picture = user.image
          console.log('✅ JWT token created with credentials - Email:', user.email)
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