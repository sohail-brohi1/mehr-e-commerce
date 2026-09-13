import { getGuestId } from "@/services/guest";
import { rewriteMediaUrls } from "@/services/media-url";

const TOKEN_KEY = "mehr.token";

function apiRoot() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "";
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!(opts.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const guestId = getGuestId();
  if (guestId) headers.set("X-Guest-Id", guestId);

  const res = await fetch(`${apiRoot()}/api${path}`, { ...opts, headers });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed";
    throw new Error(message);
  }
  return rewriteMediaUrls(data) as T;
}
