const fallbackApiUrl = "http://127.0.0.1:8000"

export const serverConfig = {
  apiUrl: (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl)
    .replace(/\/$/, ""),
} as const
