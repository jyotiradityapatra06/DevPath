import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME, ONBOARDING_COOKIE_NAME } from "@/features/auth/lib/constants"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  cookieStore.delete(ONBOARDING_COOKIE_NAME)
  return new Response(null, { status: 204 })
}
