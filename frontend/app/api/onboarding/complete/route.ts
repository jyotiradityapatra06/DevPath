import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, ONBOARDING_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/lib/constants"
import { fetchBackend, proxyBackendResponse } from "@/lib/api/server"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return Response.json({ detail: "Authentication required" }, { status: 401 })
  const response = await fetchBackend("/auth/onboarding/complete", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return proxyBackendResponse(response)
  const user = await response.json()
  cookieStore.set(ONBOARDING_COOKIE_NAME, "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return Response.json(user)
}
