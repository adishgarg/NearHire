import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

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
    async signIn({ user, account, profile, email }) {
      console.log('SignIn callback:', { 
        user: user.email, 
        provider: account?.provider,
        profile: profile?.name 
      })
      
      // Create/update user in database (only during runtime)
      if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
        try {
          if (user.email) {
            const { PrismaClient } = await import('@prisma/client')
            const prisma = new PrismaClient()
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name,
                image: user.image,
              },
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            })
            await prisma.$disconnect()
          }
        } catch (error) {
          console.error('Error saving user to database:', error)
          // Don't fail login if database save fails
        }
      }
      
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        
        // Get user data from database (only during runtime)
        if (typeof window === 'undefined') {
          try {
            if (session.user.email) {
              const { PrismaClient } = await import('@prisma/client')
              const prisma = new PrismaClient()
              const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email }
              })
              if (dbUser) {
                session.user.id = dbUser.id
              }
              await prisma.$disconnect()
            }
          } catch (error) {
            console.error('Error fetching user from database:', error)
          }
        }
      }
      
      console.log('Session callback:', { 
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