import { getTokens, setTokens, clearTokens, getCartToken } from "./storage";
import type { AuthResponse } from "@/types/api";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5080";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach bearer token
  cartToken?: boolean; // attach X-Cart-Token for guests
  signal?: AbortSignal;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return false;

  // Coalesce concurrent refreshes.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
        if (!res.ok) {
          clearTokens();
          return false;
        }
        const data = (await res.json()) as AuthResponse;
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return true;
      } catch {
        return false;
      } finally {
        // Reset after a tick so subsequent calls re-evaluate.
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

async function raw<T>(path: string, opts: RequestOptions, retry: boolean): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  if (opts.auth) {
    const tokens = getTokens();
    if (tokens?.accessToken) headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }
  if (opts.cartToken) {
    const ct = getCartToken();
    if (ct) headers["X-Cart-Token"] = ct;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  // Transparently refresh once on 401 for authed calls.
  if (res.status === 401 && opts.auth && retry) {
    const ok = await tryRefresh();
    if (ok) return raw<T>(path, opts, false);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
      else if (err?.title) message = err.title;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    raw<T>(path, { ...opts, method: "GET" }, true),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, "method"> = {}) =>
    raw<T>(path, { ...opts, method: "POST", body }, true),
  put: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, "method"> = {}) =>
    raw<T>(path, { ...opts, method: "PUT", body }, true),
  del: <T>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    raw<T>(path, { ...opts, method: "DELETE" }, true),
};

export { BASE_URL };
