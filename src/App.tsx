import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import OnboardingPersona from "./pages/OnboardingPersona";
import OnboardingInterests from "./pages/OnboardingInterests";
import Feed from "./pages/Feed";
import QuoteEditor from "./pages/QuoteEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/feed" element={<Feed />} />
          <Route path="/create" element={<QuoteEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
