const KEY = "mehr.guest.id";

export function getGuestId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id || !isGuestId(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function isGuestId(value: string) {
  return /^[a-zA-Z0-9-]{8,64}$/.test(value);
}
