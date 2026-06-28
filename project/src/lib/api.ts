// Dev: Vite proxies /api and /uploads → http://localhost:5000 (vite.config.ts)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:5000/api");

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  avatar?: { public_id?: string; url?: string };
}

export const getAccessToken = () => localStorage.getItem("accessToken");

export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const clearAccessToken = () => {
  localStorage.removeItem("accessToken");
};

let refreshInFlight: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const token = data?.data?.accessToken;
      if (response.ok && token) {
        setAccessToken(token);
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function formatApiError(data: unknown, status: number): string {
  const message =
    (data && typeof data === "object" && "message" in data && data.message) ||
    `Request failed with status ${status}`;

  const errors =
    data &&
    typeof data === "object" &&
    "errors" in data &&
    Array.isArray(data.errors)
      ? data.errors
      : [];

  if (errors.length > 0) {
    const details = errors
      .map((e: { field?: string; message?: string }) =>
        e.field ? `${e.field}: ${e.message}` : e.message
      )
      .filter(Boolean)
      .join("; ");
    return `${message} (${details})`;
  }

  return String(message);
}

/** Resolve product image URLs from backend (relative /uploads paths work via Vite proxy). */
export function resolveAssetUrl(url: string | undefined): string {
  if (!url) {
    return "https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

async function request<T>(endpoint: string, init?: RequestInit, retried = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Backend is offline. In a terminal run: cd backend → npm run dev:clean → wait for port 5000, then refresh."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  const isEnvelope =
    data &&
    typeof data === "object" &&
    "success" in data &&
    "data" in data;

  const isAuthEndpoint =
    endpoint.startsWith("/auth/login") ||
    endpoint.startsWith("/auth/signup") ||
    endpoint.startsWith("/auth/refresh-token");

  if (
    response.status === 401 &&
    !retried &&
    !isAuthEndpoint &&
    token
  ) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(endpoint, init, true);
    }
    clearAccessToken();
    localStorage.removeItem("currentUser");
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok || (isEnvelope && data.success === false)) {
    throw new Error(formatApiError(data, response.status));
  }

  if (isEnvelope) {
    return data.data as T;
  }

  return (data ?? {}) as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
  refreshToken: tryRefreshToken,
};

export { API_BASE_URL };
