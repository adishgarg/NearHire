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

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  const session = await auth()

  // If user is not logged in and tries to access protected page or API
  if (isProtectedPath && !session?.user) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is already logged in and tries to access login/signup
  if (isAuthPath && session?.user) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
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