import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/profile",
  "/orders",
  "/messages",
  "/gigs/create",
  "/api/protected",
]

// Paths that should not be accessible when logged in
const authPaths = ["/auth/login", "/auth/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes (especially /api/auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))
  const isOnboardingPath = pathname.startsWith("/onboarding")

  const session = await auth()

  // If user is not logged in and tries to access protected page or API
  if (isProtectedPath && !session?.user) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in, check onboarding status from session
  if (session?.user) {
    const onboardingCompleted = (session.user as any).onboardingCompleted;

    // If onboarding is not completed and user is not on onboarding or auth pages
    if (onboardingCompleted === false && !isOnboardingPath && !isAuthPath) {
      const onboardingUrl = new URL("/onboarding", request.url)
      return NextResponse.redirect(onboardingUrl)
    }

    // If user is already logged in and tries to access login/signup
    if (isAuthPath) {
      // Redirect to onboarding if not completed, otherwise to home
      if (onboardingCompleted === false) {
        const onboardingUrl = new URL("/onboarding", request.url)
        return NextResponse.redirect(onboardingUrl)
      } else {
        const homeUrl = new URL("/", request.url)
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all routes except:
     * - static files
     * - next internals
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}