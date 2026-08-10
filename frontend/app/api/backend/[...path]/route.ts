import { cookies } from "next/headers"

import { AUTH_COOKIE_NAME } from "@/features/auth/lib/constants"
import { fetchBackend, proxyBackendResponse } from "@/lib/api/server"

async function handler(request: Request, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const incomingUrl = new URL(request.url)
  const backendPath = `/${path.join("/")}${incomingUrl.search}`
  const contentType = request.headers.get("content-type")
  const hasBody = !["GET", "HEAD"].includes(request.method)
  const response = await fetchBackend(backendPath, {
    method: request.method,
    body: hasBody ? await request.arrayBuffer() : undefined,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return proxyBackendResponse(response)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
