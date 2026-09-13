function apiRoot() {
  return (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
}

/** HTTPS Vercel cannot load HTTP S3 / invalid-cert sslip hosts. Proxy those through the API. */
export function resolveMediaUrl(url: string) {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.toLowerCase();
  const insecureS3 =
    parsed.protocol === "http:" && (host.includes("sslip.io") || host.includes("s3"));
  const s3Host = host.startsWith("s3-") && host.includes("sslip.io");
  if (!insecureS3 && !s3Host) return url;

  const parts = parsed.pathname.replace(/^\/+/, "").split("/");
  const key = parts.slice(1).join("/");
  if (!key) return url;
  return `${apiRoot()}/api/media/${key}`;
}

export function rewriteMediaUrls<T>(value: T): T {
  if (typeof value === "string") return resolveMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map((item) => rewriteMediaUrls(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteMediaUrls(item)]),
    ) as T;
  }
  return value;
}
