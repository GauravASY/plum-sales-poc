import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LookupPage } from "@/pages/Lookup";
import { ProfilePage } from "@/pages/Profile";
import { BrowsePage } from "@/pages/Browse";
import { NotFoundPage } from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-plum-600 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        <main id="main" tabIndex={-1} className="min-h-full">
          <Routes>
            <Route path="/" element={<LookupPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/u/:id" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
