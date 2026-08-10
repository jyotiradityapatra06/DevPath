import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME } from "@/features/auth/lib/constants"

const protectedPrefix = "/app"
const authRoutes = new Set(["/login", "/register"])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME)

  if (pathname.startsWith(protectedPrefix) && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (authRoutes.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ["/app/:path*", "/login", "/register"] }
