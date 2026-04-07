import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import OnboardingPersona from "./pages/OnboardingPersona";
import OnboardingInterests from "./pages/OnboardingInterests";
import Feed from "./pages/Feed";
import CreatePicker from "./pages/CreatePicker";
import QuoteEditor from "./pages/QuoteEditor";
import QuotePublishSettings from "./pages/QuotePublishSettings";
import ContentEditor from "./pages/ContentEditor";
import ContentPublishSettings from "./pages/ContentPublishSettings";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import ProfileEdit from "./pages/ProfileEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<OnboardingWelcome />} />
            <Route path="/onboarding/persona" element={<OnboardingPersona />} />
            <Route path="/onboarding/interests" element={<OnboardingInterests />} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePicker /></ProtectedRoute>} />
            <Route path="/create/quote" element={<ProtectedRoute><QuoteEditor /></ProtectedRoute>} />
            <Route path="/create/quote/publish" element={<ProtectedRoute><QuotePublishSettings /></ProtectedRoute>} />
            <Route path="/create/:type" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
            <Route path="/create/:type/publish" element={<ProtectedRoute><ContentPublishSettings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/settings/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
