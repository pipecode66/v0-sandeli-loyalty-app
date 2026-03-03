"use client"

export const ACCESS_TOKEN_STORAGE_KEY = "sandeli_access_token"

function normalizeBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || "").trim()
  if (!raw) return ""
  const withoutTrailingSlash = raw.replace(/\/+$/, "")
  if (withoutTrailingSlash.endsWith("/api/public")) {
    return withoutTrailingSlash
  }
  return `${withoutTrailingSlash}/api/public`
}

export function buildPublicApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const base = normalizeBaseUrl()
  if (!base) {
    // Local fallback when NEXT_PUBLIC_ADMIN_API_BASE_URL is missing.
    return `/api/public${normalizedPath}`
  }
  return `${base}${normalizedPath}`
}

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export async function fetchPublicJson<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
) {
  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(buildPublicApiUrl(path), {
    ...options,
    headers,
  })

  let data: T | null = null
  try {
    data = (await response.json()) as T
  } catch {
    data = null
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}
