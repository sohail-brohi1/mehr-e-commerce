import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ScrollTop } from "@/components/shared/ScrollTop";
import { AppRoutes } from "@/app/routes";

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollTop />
      <AppRoutes />
      <Toaster />
    </ErrorBoundary>
  );
}
