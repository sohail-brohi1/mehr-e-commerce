export const ADMIN_TABS = [
  "Overview",
  "Orders",
  "Catalogue",
  "Collections",
  "Customers",
  "Inbox",
  "Settings",
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];
