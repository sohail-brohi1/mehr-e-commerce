import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { PayToSettings } from "@/services/payments";
import type { Order } from "@/store/shop";

export type StudioOverview = {
  orders: number;
  todayOrders: number;
  todayRevenue: number;
  revenue: number;
  awaiting: number;
  unpaid: number;
  livePieces: number;
  lowStock: number;
  unreadMessages: number;
  subscribers: number;
  customers: number;
  recent: Order[];
  lowStockPieces: { id: string; name: string; stock: number; slug: string }[];
};

export type StudioCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  isAdmin: boolean;
  orders: number;
  spend: number;
  createdAt: string;
};

export type InboxMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type Subscriber = { id: string; email: string; createdAt: string };

export function useStudioOverview(enabled: boolean) {
  return useQuery({
    queryKey: ["studio", "overview"],
    enabled,
    queryFn: () => api<StudioOverview>("/studio/overview"),
  });
}

export function useStudioCustomers(enabled: boolean) {
  return useQuery({
    queryKey: ["studio", "customers"],
    enabled,
    queryFn: () => api<StudioCustomer[]>("/studio/customers"),
  });
}

export function useStudioInbox(enabled: boolean) {
  return useQuery({
    queryKey: ["studio", "inbox"],
    enabled,
    queryFn: () => api<InboxMessage[]>("/studio/inbox"),
  });
}

export function useStudioSubscribers(enabled: boolean) {
  return useQuery({
    queryKey: ["studio", "subscribers"],
    enabled,
    queryFn: () => api<Subscriber[]>("/studio/subscribers"),
  });
}

export function useStudioSettings(enabled: boolean) {
  return useQuery({
    queryKey: ["studio", "settings"],
    enabled,
    queryFn: () => api<{ payTo: PayToSettings }>("/studio/settings"),
  });
}

export function usePayTo() {
  return useQuery({
    queryKey: ["pay-to"],
    queryFn: () => api<PayToSettings>("/pay-to"),
    staleTime: 60_000,
  });
}
