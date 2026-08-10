import { serverConfig } from "@/lib/config"

export async function fetchBackend(path: string, init?: RequestInit) {
  return fetch(`${serverConfig.apiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })
}

export async function proxyBackendResponse(response: Response) {
  const contentType = response.headers.get("content-type")
  const body = response.status === 204 ? null : await response.arrayBuffer()

  return new Response(body, {
    status: response.status,
    headers: contentType ? { "Content-Type": contentType } : undefined,
  })
}
