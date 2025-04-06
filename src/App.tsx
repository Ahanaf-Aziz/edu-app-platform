
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import EduBot from "./pages/EduBot";
import EduPeerX from "./pages/EduPeerX";
import TeachSmart from "./pages/TeachSmart";
import GeminiTools from "./pages/GeminiTools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle AnimatePresence with useLocation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/edubot" element={<EduBot />} />
        <Route path="/edupeerx" element={<EduPeerX />} />
        <Route path="/teachsmart" element={<TeachSmart />} />
        <Route path="/geminitools" element={<GeminiTools />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <AnimatedRoutes />
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
