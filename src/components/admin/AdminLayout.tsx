import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Home,
  Menu,

  MessageSquare,
  LogOut,
  User,
  Shield,
  Lock,
  Bell,
  X,
} from "lucide-react";

import AdminNotifications from "@/components/admin/AdminNotifications";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Applications", href: "/admin/applications", icon: FileText },
    { name: "Content", href: "/admin/content", icon: Calendar },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    {
      name: "Change Password",
      href: "/admin/change-password",
      icon: Lock
    },
    {
      name: "Admin Management",
      href: "/admin/admin-management",
      icon: Shield,
      requiresRole: "super_admin"
    },
    {
      name: "Notification Settings",
      href: "/admin/notifications",
      icon: Bell
    },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item =>
    !item.requiresRole || hasRole(item.requiresRole as 'admin' | 'super_admin')
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">BSPCP Admin</h2>
            <p className="text-sm text-muted-foreground">Administration Portal</p>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>



      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 pt-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={cn(
                "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          <p>BSPCP Admin Portal</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col md:bg-card md:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-card border-b px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-primary">BSPCP Admin</h1>
        </div>
        <AdminNotifications />
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-foreground capitalize">
            {/* Simple logic to show current page title could go here, for now just spacer */}
            {navigation.find(n => isActive(n.href))?.name || 'Admin Portal'}
          </h1>
          <div className="flex items-center gap-4">
            <AdminNotifications />
          </div>
        </header>

        <main className="min-h-screen p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
