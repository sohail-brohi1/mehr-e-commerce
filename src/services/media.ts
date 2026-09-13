import { api } from "@/services/api";

export { resolveMediaUrl, rewriteMediaUrls } from "@/services/media-url";

export async function uploadMedia(file: File, folder = "products"): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const data = await api<{ path: string; url: string }>("/media", { method: "POST", body });
  return data.path;
}
