
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import FindCounsellor from "./pages/FindCounsellor";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Membership from "./pages/Membership";
import NewsEvents from "./pages/NewsEvents";
import NotFound from "./pages/NotFound";
// Service pages
import IndividualTherapy from "./pages/services/IndividualTherapy";
import CouplesCounselling from "./pages/services/CouplesCounselling";
import FamilyTherapy from "./pages/services/FamilyTherapy";
import ChildTeenSupport from "./pages/services/ChildTeenSupport";
import OnlineCounselling from "./pages/services/OnlineCounselling";
import TraumaCrisis from "./pages/services/TraumaCrisis";
// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import Applications from "./pages/admin/Applications";
import Content from "./pages/admin/Content";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/find-counsellor" element={<FindCounsellor />} />
          <Route path="/services" element={<Services />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/news-events" element={<NewsEvents />} />
          {/* Service routes */}
          <Route path="/services/individual-therapy" element={<IndividualTherapy />} />
          <Route path="/services/couples-counselling" element={<CouplesCounselling />} />
          <Route path="/services/family-therapy" element={<FamilyTherapy />} />
          <Route path="/services/child-teen-support" element={<ChildTeenSupport />} />
          <Route path="/services/online-counselling" element={<OnlineCounselling />} />
          <Route path="/services/trauma-crisis" element={<TraumaCrisis />} />
          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<Members />} />
          <Route path="/admin/applications" element={<Applications />} />
          <Route path="/admin/content" element={<Content />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
