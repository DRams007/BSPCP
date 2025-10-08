import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Calendar,
  AlertCircle,
  Settings,
  LogOut,
  Bell,
  Search
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    activeNews: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);

      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, navigate]);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    logout();
  };

  const recentActivities = [
    { id: 1, action: "New membership application", user: "Dr. Sarah Johnson", time: "2 hours ago", type: "application" },
    { id: 2, action: "News article published", user: "Admin", time: "4 hours ago", type: "content" },
    { id: 3, action: "Member profile updated", user: "Dr. Michael Brown", time: "1 day ago", type: "update" },
    { id: 4, action: "Event registration opened", user: "Admin", time: "2 days ago", type: "event" },
  ];

  const pendingTasks = [
    { id: 1, task: "Review 12 pending membership applications", priority: "high", count: 12 },
    { id: 2, task: "Approve 3 counselor directory submissions", priority: "medium", count: 3 },
    { id: 3, task: "Update upcoming event details", priority: "low", count: 1 },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-4 mb-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">Overview of your BSPCP administration</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Bell className="w-3 h-3" />
              3 notifications
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
              <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-xl md:text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Pending Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-xl md:text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Require review
              </p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Active News</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-xl md:text-2xl font-bold">{stats.activeNews}</div>
              <p className="text-xs text-muted-foreground">
                Published articles
              </p>
            </CardContent>
          </Card>

          <Card className="p-4 md:col-span-1 col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-xl md:text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.task}</p>
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {task.priority} priority
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-4 md:mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Button
                variant="outline"
                className="h-16 md:h-20 flex-col p-3 text-xs md:text-sm"
                onClick={() => navigate("/admin/members")}
              >
                <Users className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
                Manage Members
              </Button>
              <Button
                variant="outline"
                className="h-16 md:h-20 flex-col p-3 text-xs md:text-sm"
                onClick={() => navigate("/admin/applications")}
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
                Review Applications
              </Button>
              <Button
                variant="outline"
                className="h-16 md:h-20 flex-col p-3 text-xs md:text-sm"
                onClick={() => navigate("/admin/content")}
              >
                <Calendar className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
                Content Management
              </Button>
              <Button
                variant="outline"
                className="h-16 md:h-20 flex-col p-3 text-xs md:text-sm"
                onClick={() => navigate("/admin/settings")}
              >
                <Settings className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
