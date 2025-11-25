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
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign in - this handles both new users and existing users
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  // Make URL dynamic based on environment
  ...(process.env.NODE_ENV === 'production' && {
    redirectProxyUrl: process.env.NEXTAUTH_URL || 'https://near-hire.vercel.app'
  })
})