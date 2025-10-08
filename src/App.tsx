
// import FloatingDonationWidget from "@/components/FloatingDonationWidget";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRouteGuard, { SuperAdminRouteGuard } from "@/components/auth/AdminRouteGuard";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const DbTest = lazy(() => import("./pages/DbTest"));
const About = lazy(() => import("./pages/About"));
const FindCounsellor = lazy(() => import("./pages/FindCounsellor"));
const Contact = lazy(() => import("./pages/Contact"));
const Membership = lazy(() => import("./pages/Membership"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const CodeOfEthics = lazy(() => import("./pages/CodeOfEthics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MemberLogin = lazy(() => import("./pages/MemberLogin"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
const PaymentUpload = lazy(() => import("./pages/PaymentUpload"));
// Service pages
const IndividualTherapy = lazy(() => import("./pages/services/IndividualTherapy"));
const CouplesCounselling = lazy(() => import("./pages/services/CouplesCounselling"));
const FamilyTherapy = lazy(() => import("./pages/services/FamilyTherapy"));
const ChildTeenSupport = lazy(() => import("./pages/services/ChildTeenSupport"));
const OnlineCounselling = lazy(() => import("./pages/services/OnlineCounselling"));
const TraumaCrisis = lazy(() => import("./pages/services/TraumaCrisis"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const ChangePassword = lazy(() => import("./pages/admin/ChangePassword"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Members = lazy(() => import("./pages/admin/Members"));
const Applications = lazy(() => import("./pages/admin/Applications"));
const Content = lazy(() => import("./pages/admin/Content"));
const Testimonials = lazy(() => import("./pages/admin/Testimonials"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const NotificationManagement = lazy(() => import("./pages/admin/NotificationManagement"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminForgotPassword = lazy(() => import("./pages/admin/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient();

const AdminRoutes = () => (
  <Routes>
    {/* Public admin routes (no auth required) */}
    <Route path="/login" element={<AdminLogin />} />
    <Route path="/forgot-password" element={<AdminForgotPassword />} />
    <Route path="/reset-password" element={<AdminResetPassword />} />

    {/* Protected admin routes (auth required) */}
    <Route
      path="/change-password"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <ChangePassword />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/dashboard"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <AdminDashboard />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/members"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Members />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/applications"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Applications />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/content"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Content />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/testimonials"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Testimonials />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/reports"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Reports />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/notifications"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <NotificationManagement />
        </AdminRouteGuard>
      }
    />
    <Route
      path="/settings"
      element={
        <AdminRouteGuard fallbackPath="/admin/login">
          <Settings />
        </AdminRouteGuard>
      }
    />

    {/* Super admin only routes */}
    <Route
      path="/admin-management"
      element={
        <SuperAdminRouteGuard fallbackPath="/admin/login">
          <AdminManagement />
        </SuperAdminRouteGuard>
      }
    />

    {/* Redirect to login for any unmatched admin route */}
    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isMemberDashboardPage = location.pathname.startsWith("/member-dashboard");

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/find-counsellor" element={<FindCounsellor />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/news-events" element={<NewsEvents />} />
          <Route path="/code-of-ethics" element={<CodeOfEthics />} />
          {/* Member routes */}
          <Route path="/member-login" element={<MemberLogin />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/payment-upload" element={<PaymentUpload />} />
          {/* Service routes */}
          <Route
            path="/services/individual-therapy"
            element={<IndividualTherapy />}
          />
          <Route
            path="/services/couples-counselling"
            element={<CouplesCounselling />}
          />
          <Route path="/services/family-therapy" element={<FamilyTherapy />} />
          <Route
            path="/services/child-teen-support"
            element={<ChildTeenSupport />}
          />
          <Route
            path="/services/online-counselling"
            element={<OnlineCounselling />}
          />
          <Route path="/services/trauma-crisis" element={<TraumaCrisis />} />

          {/* Admin routes - all wrapped with authentication */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/db-test" element={<DbTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {/* {!isAdminPage && !isMemberDashboardPage && <FloatingDonationWidget />} */}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
