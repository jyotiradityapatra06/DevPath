import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, ONBOARDING_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/features/auth/lib/constants"
import { fetchBackend, proxyBackendResponse } from "@/lib/api/server"

interface RegisterPayload { name: string; email: string; password: string }
interface TokenResponse { access_token: string; token_type: string }

export async function POST(request: Request) {
  const input = (await request.json()) as RegisterPayload
  const signupResponse = await fetchBackend("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  })
  if (!signupResponse.ok) return proxyBackendResponse(signupResponse)
  await signupResponse.json()

  const loginResponse = await fetchBackend("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: input.email, password: input.password }),
    headers: { "Content-Type": "application/json" },
  })
  if (!loginResponse.ok) return proxyBackendResponse(loginResponse)
  const token = (await loginResponse.json()) as TokenResponse
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
  cookieStore.set(ONBOARDING_COOKIE_NAME, "false", {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return Response.json({ authenticated: true, user }, { status: 201 })
}
