
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FloatingDonationWidget from "@/components/FloatingDonationWidget";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const FindCounsellor = lazy(() => import("./pages/FindCounsellor"));
const Resources = lazy(() => import("./pages/Resources"));
const Contact = lazy(() => import("./pages/Contact"));
const Membership = lazy(() => import("./pages/Membership"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const CodeOfEthics = lazy(() => import("./pages/CodeOfEthics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MemberLogin = lazy(() => import("./pages/MemberLogin"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));

// Service pages
const IndividualTherapy = lazy(() => import("./pages/services/IndividualTherapy"));
const CouplesCounselling = lazy(() => import("./pages/services/CouplesCounselling"));
const FamilyTherapy = lazy(() => import("./pages/services/FamilyTherapy"));
const ChildTeenSupport = lazy(() => import("./pages/services/ChildTeenSupport"));
const OnlineCounselling = lazy(() => import("./pages/services/OnlineCounselling"));
const TraumaCrisis = lazy(() => import("./pages/services/TraumaCrisis"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Members = lazy(() => import("./pages/admin/Members"));
const Applications = lazy(() => import("./pages/admin/Applications"));
const Content = lazy(() => import("./pages/admin/Content"));
const Testimonials = lazy(() => import("./pages/admin/Testimonials"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/admin/Settings"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/find-counsellor" element={<FindCounsellor />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/news-events" element={<NewsEvents />} />
            <Route path="/code-of-ethics" element={<CodeOfEthics />} />
            {/* Member routes */}
            <Route path="/member-login" element={<MemberLogin />} />
            <Route path="/member-dashboard" element={<MemberDashboard />} />
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
            <Route path="/admin/testimonials" element={<Testimonials />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingDonationWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
