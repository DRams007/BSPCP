import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Filter,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

const Reports = () => {
  const [dateRange, setDateRange] = useState("30days");
  const [isLoading, setIsLoading] = useState(false);

  const handleExportReport = async (reportType: string) => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would trigger a download
      alert(`${reportType} report exported successfully!`);
    }, 2000);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const membershipData = [
    { month: "Jan", members: 120, applications: 25 },
    { month: "Feb", members: 135, applications: 30 },
    { month: "Mar", members: 142, applications: 28 },
    { month: "Apr", members: 158, applications: 35 },
    { month: "May", members: 165, applications: 32 },
    { month: "Jun", members: 178, applications: 40 },
  ];

  const websiteTrafficData = [
    { month: "Jan", visitors: 4200 },
    { month: "Feb", visitors: 4800 },
    { month: "Mar", visitors: 5200 },
    { month: "Apr", visitors: 4900 },
    { month: "May", visitors: 5600 },
    { month: "Jun", visitors: 6100 },
  ];

  const membershipTypeData = [
    { name: "Full Member", value: 145, color: "#0088FE" },
    { name: "Associate", value: 89, color: "#00C49F" },
    { name: "Student", value: 67, color: "#FFBB28" },
    { name: "International", value: 23, color: "#FF8042" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              View detailed reports and analytics for your organization
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => handleExportReport('Summary')}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Applications</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Visitors</CardTitle>
              <Globe className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6,100</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">2</span> upcoming events
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Membership Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Membership Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membershipData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="applications" fill="hsl(var(--secondary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Website Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Website Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={websiteTrafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Membership Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Membership Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={membershipTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {membershipTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Reports */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quick" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="quick">Quick Reports</TabsTrigger>
                  <TabsTrigger value="custom">Custom Reports</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quick" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => handleExportReport('Member Directory')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">Member Directory</div>
                        <div className="text-sm text-muted-foreground">
                          Complete list of all members with contact details
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => handleExportReport('Financial Summary')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">Financial Summary</div>
                        <div className="text-sm text-muted-foreground">
                          Membership fees and payment status report
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => handleExportReport('Event Analytics')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">Event Analytics</div>
                        <div className="text-sm text-muted-foreground">
                          Attendance and engagement metrics
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => handleExportReport('Content Performance')}
                      disabled={isLoading}
                    >
                      <div className="text-left">
                        <div className="font-medium">Content Performance</div>
                        <div className="text-sm text-muted-foreground">
                          Most viewed articles and resources
                        </div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input type="date" id="start-date" />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input type="date" id="end-date" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membership Report</SelectItem>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="engagement">Engagement Report</SelectItem>
                        <SelectItem value="activity">Activity Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Filter className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="scheduled" className="space-y-4">
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
                    <p className="text-muted-foreground mb-4">
                      Set up automated reports to be generated and sent regularly
                    </p>
                    <Button>Create Scheduled Report</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;