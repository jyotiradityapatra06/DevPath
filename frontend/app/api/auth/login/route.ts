import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, ONBOARDING_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/lib/constants"
import { fetchBackend, proxyBackendResponse } from "@/lib/api/server"

interface TokenResponse { access_token: string; token_type: string }

export async function POST(request: Request) {
  const payload = await request.text()
  const response = await fetchBackend("/auth/login", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) return proxyBackendResponse(response)
  const token = (await response.json()) as TokenResponse
  const userResponse = await fetchBackend("/auth/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!userResponse.ok) return proxyBackendResponse(userResponse)
  const user = await userResponse.json()
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  cookieStore.set(ONBOARDING_COOKIE_NAME, String(user.onboarding_completed), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return Response.json({ authenticated: true, user })
}
