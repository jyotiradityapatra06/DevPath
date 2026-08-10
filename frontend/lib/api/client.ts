import axios, { AxiosError } from "axios"

export interface ApiErrorBody {
  detail?: string | Array<{ loc?: Array<string | number>; msg?: string }>
}

export const apiClient = axios.create({
  baseURL: "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  config.headers.set("X-DevPath-Client", "web")
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      await axios.post("/api/auth/logout").catch(() => undefined)
      window.location.replace("/login?reason=session-expired")
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "We couldn't reach DevPath. Check your connection and try again."
    }

    const detail = error.response?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      const messages = detail.flatMap((item) => item.msg ? [item.msg] : [])
      if (messages.length) return messages.join(" ")
    }
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}
