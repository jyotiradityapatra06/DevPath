import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, ONBOARDING_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/lib/constants"
import { fetchBackend, proxyBackendResponse } from "@/lib/api/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return Response.json({ authenticated: false, user: null })

  const response = await fetchBackend("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (response.status === 401) {
    cookieStore.delete(AUTH_COOKIE_NAME)
    cookieStore.delete(ONBOARDING_COOKIE_NAME)
    return Response.json({ authenticated: false, user: null })
  }
  if (!response.ok) return proxyBackendResponse(response)

  const user = await response.json()
  cookieStore.set(ONBOARDING_COOKIE_NAME, String(user.onboarding_completed), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return Response.json({ authenticated: true, user })
}
