import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME } from "@/features/auth/lib/constants"

export async function GET() {
  const cookieStore = await cookies()
  return Response.json({ authenticated: cookieStore.has(AUTH_COOKIE_NAME) })
}
