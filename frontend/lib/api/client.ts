import axios, { AxiosError } from "axios"

export interface ApiErrorBody {
  detail?: string
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
    return error.response?.data?.detail ?? fallback
  }

  return fallback
}
