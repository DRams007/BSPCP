import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Home,
  Menu,
  Search,
  MessageSquare,
  LogOut,
  User,
  Shield,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  // Get current user role from localStorage
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setCurrentUserRole(user.role || '');
    }
  }, []);

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
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item =>
    !item.requiresRole || currentUserRole === item.requiresRole
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-primary">BSPCP Admin</h2>
            <p className="text-sm text-muted-foreground">Administration Portal</p>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/admin/login';
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>

            <div className="text-xs text-muted-foreground">
              <p>BSPCP Admin Portal</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
