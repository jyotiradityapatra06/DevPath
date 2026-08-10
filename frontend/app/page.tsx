import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AUTH_COOKIE_NAME } from "@/features/auth/lib/constants"

export default async function HomePage() {
  const cookieStore = await cookies()
  redirect(cookieStore.has(AUTH_COOKIE_NAME) ? "/app" : "/login")
}
