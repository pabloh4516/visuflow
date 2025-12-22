import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppGenerator from "./pages/AppGenerator";
import DashboardPage from "./pages/DashboardPage";
import DomainSettings from "./pages/DomainSettings";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import CloakingPage from "./pages/CloakingPage";
import CloakingNew from "./pages/CloakingNew";
import CloakingReport from "./pages/CloakingReport";
import CloakingEdit from "./pages/CloakingEdit";
import CloakingBotPreview from "./pages/CloakingBotPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cloaking"
                element={
                  <ProtectedRoute>
                    <CloakingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cloaking/new"
                element={
                  <ProtectedRoute>
                    <CloakingNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cloaking/:id"
                element={
                  <ProtectedRoute>
                    <CloakingReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cloaking/:id/edit"
                element={
                  <ProtectedRoute>
                    <CloakingEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cloaking/:id/bot-preview"
                element={
                  <ProtectedRoute>
                    <CloakingBotPreview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/domain"
                element={
                  <ProtectedRoute>
                    <DomainSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
