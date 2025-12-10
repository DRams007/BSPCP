import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, FileText, DollarSign, Calendar, Filter, BarChart3, GraduationCap, Activity, Server } from "lucide-react";
import {
  fetchReportData,
  transformToMemberList,
  transformToFinanceReport,
  transformToRenewalsReport,
  transformToDemographics,
  transformToProfessionalStats,
  transformToCPDStats,
  transformToBookingStats,
  transformToMembershipGrowth,
  FinanceRecord,
  RenewalRecord,
  Booking,
  AuditLog,
  PaymentAuditLog,
  RenewalAuditLog,
} from "@/services/reportService";
import ReportTable from "@/components/admin/reports/ReportTable";
import ReportFilter from "@/components/admin/reports/ReportFilter";
import { SimpleBarChart, SimplePieChart, SimpleLineChart, StatCard } from "@/components/admin/reports/AnalyticsCharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data States
  const [memberList, setMemberList] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<FinanceRecord[]>([]);
  const [renewalData, setRenewalData] = useState<RenewalRecord[]>([]);

  // Analytics States
  const [demographics, setDemographics] = useState<any>({ age: [], location: [] });
  const [membershipGrowth, setMembershipGrowth] = useState<any[]>([]);
  const [professional, setProfessional] = useState<any>({ specializations: [], languages: [], experience: [] });
  const [cpdStats, setCpdStats] = useState<any>({ compliance: [], topAchievers: [] });
  const [bookingStats, setBookingStats] = useState<any>({ volume: [], types: [] });
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [systemLogs, setSystemLogs] = useState<AuditLog[]>([]);
  const [paymentAuditLogs, setPaymentAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [renewalAuditLogs, setRenewalAuditLogs] = useState<RenewalAuditLog[]>([]);

  // Error states for debugging
  const [dataErrors, setDataErrors] = useState<{ [key: string]: string }>({});

  // Report Writer State
  const [rwReportType, setRwReportType] = useState<string>("members");
  const [rwColumns, setRwColumns] = useState<string[]>(["fullName", "email", "status", "membershipType"]);
  const [rwFilters, setRwFilters] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    setDataErrors({}); // Clear previous errors

    try {
      const { members, fees, bookings, logs, payments, paymentAuditLogs, renewalAuditLogs } = await fetchReportData();
      setLastUpdated(new Date());

      // Process successfully loaded data
      setMemberList(transformToMemberList(members));
      setFinanceData(transformToFinanceReport(payments || []));
      setRenewalData(transformToRenewalsReport(members));

      setDemographics(transformToDemographics(members));
      setProfessional(transformToProfessionalStats(members));
      setCpdStats(transformToCPDStats(members));
      setMembershipGrowth(transformToMembershipGrowth(members));

      // Handle bookings data specifically with error tracking
      try {
        console.log('Processing bookings data:', bookings ? `Found ${bookings.length} bookings` : 'No bookings data');
        setBookingStats(transformToBookingStats(bookings || []));
        setBookingsList(bookings || []);
        if (bookings && bookings.length > 0) {
          console.log('First booking sample:', bookings[0]);
        }
      } catch (bookingError) {
        console.error('Error processing bookings data:', bookingError);
        setDataErrors(prev => ({ ...prev, bookings: 'Error processing bookings data' }));
      }

      setSystemLogs(logs);
      setPaymentAuditLogs(paymentAuditLogs || []);
      setRenewalAuditLogs(renewalAuditLogs || []);
    } catch (error) {
      console.error("Failed to load report data", error);

      // Identify which component failed and set specific error messages
      if (error.message && error.message.includes('bookings')) {
        setDataErrors(prev => ({ ...prev, bookings: 'Failed to load bookings data' }));
      } else {
        setDataErrors(prev => ({ ...prev, general: 'Failed to load report data. Please check authentication and try again.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Column Definitions
  const memberListColumns = [
    { key: "id", label: "Member ID", sortable: true },
    { key: "fullName", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    {
      key: "joiningDate",
      label: "Joining Date",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "yyyy-MM-dd") : "-"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: string) => (
        <Badge variant={val === "Active" ? "default" : "secondary"}>{val}</Badge>
      ),
    },
  ];

  const financeColumns = [
    { key: "memberId", label: "Member ID", sortable: true },
    { key: "fullName", label: "Full Name", sortable: true },
    {
      key: "paymentDate",
      label: "Payment Date",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "yyyy-MM-dd") : "-"),
    },
    { key: "paymentType", label: "Payment Type", sortable: true },
    {
      key: "amount",
      label: "Amount Paid",
      sortable: true,
      render: (val: number) => `BWP ${val.toFixed(2)}`,
    },
  ];

  const renewalColumns = [
    { key: "fullName", label: "Member Name", sortable: true },
    {
      key: "renewalDate",
      label: "Renewal Date",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "yyyy-MM-dd") : "-"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: string) => {
        let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
        if (val === "Renewed") variant = "default";
        if (val === "Overdue") variant = "destructive";
        if (val === "Due Soon") variant = "secondary";
        return <Badge variant={variant}>{val}</Badge>;
      },
    },
    {
      key: "daysOverdue",
      label: "Days Overdue",
      sortable: true,
      render: (val: number) => (val ? <span className="text-red-500 font-bold">{val}</span> : "-"),
    },
  ];

  const bookingColumns = [
    {
      key: "booking_date",
      label: "Date",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "yyyy-MM-dd") : "-")
    },
    { key: "client_name", label: "Client", sortable: true },
    { key: "counsellor_name", label: "Counsellor", sortable: true },
    { key: "session_type", label: "Type", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const logColumns = [
    {
      key: "created_at",
      label: "Timestamp",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "PPpp") : "-")
    },
    { key: "admin_name", label: "Admin", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "details", label: "Details", sortable: false },
  ];

  const paymentAuditLogColumns = [
    {
      key: "created_at",
      label: "Timestamp",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "PPpp") : "-")
    },
    { key: "member_name", label: "Member", sortable: true },
    { key: "admin_name", label: "Admin", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "details", label: "Details", sortable: false },
  ];

  const renewalAuditLogColumns = [
    {
      key: "created_at",
      label: "Timestamp",
      sortable: true,
      render: (val: string) => (val ? format(new Date(val), "PPpp") : "-")
    },
    { key: "member_name", label: "Member", sortable: true },
    { key: "admin_name", label: "Admin", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "details", label: "Details", sortable: false },
  ];

  const cpdColumns = [
    { key: "name", label: "Member Name", sortable: true },
    { key: "points", label: "Total Points", sortable: true },
  ];

  // Report Writer Configurations
  const reportWriterConfigs: Record<string, { columns: any[], data: any[] }> = {
    members: {
      columns: [
        { key: "id", label: "Member ID" },
        { key: "fullName", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "joiningDate", label: "Joining Date" },
        { key: "status", label: "Status" },
        { key: "membershipType", label: "Membership Type" },
      ],
      data: memberList,
    },
    finance: {
      columns: [
        { key: "memberId", label: "Member ID" },
        { key: "fullName", label: "Full Name" },
        { key: "paymentDate", label: "Payment Date" },
        { key: "paymentType", label: "Payment Type" },
        { key: "amount", label: "Amount" },
        { key: "paymentMethod", label: "Method" },
        { key: "status", label: "Status" },
      ],
      data: financeData,
    },
    renewals: {
      columns: [
        { key: "memberId", label: "Member ID" },
        { key: "fullName", label: "Full Name" },
        { key: "renewalDate", label: "Renewal Date" },
        { key: "status", label: "Status" },
        { key: "daysOverdue", label: "Days Overdue" },
      ],
      data: renewalData,
    },
    bookings: {
      columns: [
        { key: "id", label: "Booking ID" },
        { key: "client_name", label: "Client Name" },
        { key: "counsellor_name", label: "Counsellor" },
        { key: "booking_date", label: "Date" },
        { key: "session_type", label: "Session Type" },
        { key: "status", label: "Status" },
      ],
      data: bookingsList,
    },
    cpd: {
      columns: [
        { key: "id", label: "Member ID" },
        { key: "name", label: "Member Name" },
        { key: "points", label: "CPD Points" },
      ],
      data: cpdStats.topAchievers,
    },
    system: {
      columns: [
        { key: "id", label: "Log ID" },
        { key: "admin_name", label: "Admin" },
        { key: "action", label: "Action" },
        { key: "created_at", label: "Timestamp" },
        { key: "details", label: "Details" },
      ],
      data: systemLogs,
    },
    paymentAuditLogs: {
      columns: [
        { key: "id", label: "Log ID" },
        { key: "member_name", label: "Member" },
        { key: "admin_name", label: "Admin" },
        { key: "action", label: "Action" },
        { key: "created_at", label: "Timestamp" },
        { key: "details", label: "Details" },
      ],
      data: paymentAuditLogs,
    },
    renewalAuditLogs: {
      columns: [
        { key: "id", label: "Log ID" },
        { key: "member_name", label: "Member" },
        { key: "admin_name", label: "Admin" },
        { key: "action", label: "Action" },
        { key: "created_at", label: "Timestamp" },
        { key: "details", label: "Details" },
      ],
      data: renewalAuditLogs,
    },
  };

  const currentReportConfig = reportWriterConfigs[rwReportType] || reportWriterConfigs.members;
  const reportWriterAvailableColumns = currentReportConfig.columns;

  const filteredReportWriterData = currentReportConfig.data.filter((row) => {
    return Object.entries(rwFilters).every(([key, filterVal]) => {
      if (!filterVal) return true;
      const rowVal = String(row[key] || "").toLowerCase();
      return rowVal.includes(filterVal.toLowerCase());
    });
  });

  // Summaries
  const totalRevenue = financeData.reduce((sum, item) => sum + item.amount, 0);
  const currentMonthRevenue = financeData
    .filter((item) => new Date(item.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, item) => sum + item.amount, 0);
  const overdueCount = renewalData.filter((r) => r.status === "Overdue").length;
  const dueSoonCount = renewalData.filter((r) => r.status === "Due Soon").length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              {lastUpdated
                ? `Last updated: ${format(lastUpdated, "PPpp")}`
                : "Loading data..."}
            </p>
          </div>
          <Button onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Error display */}
        {Object.keys(dataErrors).length > 0 && (
          <div className="space-y-4">
            {Object.entries(dataErrors).map(([key, error]) => (
              <Alert key={key} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong className="capitalize">{key}</strong>: {error}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="members">
              <FileText className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="finance">
              <DollarSign className="w-4 h-4 mr-2" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="renewals">
              <Calendar className="w-4 h-4 mr-2" />
              Renewals
            </TabsTrigger>
            <TabsTrigger value="cpd">
              <GraduationCap className="w-4 h-4 mr-2" />
              CPD
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Activity className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="system">
              <Server className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="writer">
              <Filter className="w-4 h-4 mr-2" />
              Writer
            </TabsTrigger>
          </TabsList>

          {/* 1. Member List */}
          <TabsContent value="members" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Member List</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportTable title="Member_List" data={memberList} columns={memberListColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Analytics */}
          <TabsContent value="analytics" className="space-y-6 mt-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Members"
                value={memberList.length}
                description="All registered members"
              />
              <StatCard
                title="Active Members"
                value={memberList.filter(m => m.originalStatus === 'active').length}
                description="Currently active"
              />
              <StatCard
                title="Total Revenue"
                value={`BWP ${totalRevenue.toFixed(2)}`}
                description="All-time revenue"
              />
              <StatCard
                title="Pending Renewals"
                value={overdueCount + dueSoonCount}
                description={`${overdueCount} overdue, ${dueSoonCount} due soon`}
              />
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Recent Bookings"
                value={bookingsList.length}
                description="Total booking records"
              />
              <StatCard
                title="CPD Compliance"
                value={`${cpdStats.compliance[0]?.value || 0}/${memberList.length}`}
                description="Members meeting CPD requirements"
              />
              <StatCard
                title="Current Month Revenue"
                value={`BWP ${currentMonthRevenue.toFixed(2)}`}
                description="Revenue this month"
              />
            </div>

            {/* Growth & Demographics Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Growth & Demographics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SimpleLineChart
                  title="Membership Growth Trend"
                  data={membershipGrowth}
                  dataKey="newMembers"
                  xAxisKey="month"
                  nameKey="month"
                />
                <SimplePieChart title="Nationality Distribution" data={demographics.location} dataKey="value" nameKey="name" />
              </div>
            </div>

            {/* Professional Insights Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SimpleBarChart title="Top Specializations" data={professional.specializations} dataKey="value" nameKey="name" />
                <SimpleBarChart title="Languages Spoken" data={professional.languages} dataKey="value" nameKey="name" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <SimpleBarChart title="Experience Levels" data={professional.experience} dataKey="value" nameKey="name" />
                <SimplePieChart
                  title="Member Status Distribution"
                  data={[
                    { name: 'Active', value: memberList.filter(m => m.originalStatus === 'active').length },
                    { name: 'Pending', value: memberList.filter(m => m.originalStatus === 'pending').length },
                    { name: 'Suspended', value: memberList.filter(m => m.originalStatus === 'suspended').length },
                    { name: 'Expired', value: memberList.filter(m => m.originalStatus === 'expired').length },
                  ].filter(item => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>

            {/* Activity Trends Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SimpleLineChart
                  title="Booking Volume (Last 30 Days)"
                  data={bookingStats.volume}
                  dataKey="count"
                  xAxisKey="date"
                  nameKey={""}
                />
                <SimplePieChart
                  title="CPD Compliance Status"
                  data={cpdStats.compliance}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>
          </TabsContent>

          {/* 3. Finance */}
          <TabsContent value="finance" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Total Revenue" value={`BWP ${totalRevenue.toFixed(2)}`} />
              <StatCard title="Revenue (This Month)" value={`BWP ${currentMonthRevenue.toFixed(2)}`} />
            </div>
            <Card>
              <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Finance_Report" data={financeData} columns={financeColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Renewals */}
          <TabsContent value="renewals" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Overdue Renewals" value={overdueCount} description="Members with expired renewal dates" />
              <StatCard title="Due Soon (30 Days)" value={dueSoonCount} description="Members expiring within 30 days" />
            </div>
            <Card>
              <CardHeader><CardTitle>Renewal Status</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Renewals_Report" data={renewalData} columns={renewalColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. CPD */}
          <TabsContent value="cpd" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimplePieChart title="CPD Compliance" data={cpdStats.compliance} dataKey="value" nameKey="name" />
              <Card>
                <CardHeader><CardTitle>Top CPD Achievers</CardTitle></CardHeader>
                <CardContent>
                  <ReportTable title="CPD_Achievers" data={cpdStats.topAchievers} columns={cpdColumns} searchable={false} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 6. Bookings */}
          <TabsContent value="bookings" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleLineChart title="Booking Volume (Last 30 Days)" data={bookingStats.volume} dataKey="count" xAxisKey="date" nameKey={""} />
              <SimplePieChart title="Session Types" data={bookingStats.types} dataKey="value" nameKey="name" />
            </div>
            <Card>
              <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Bookings_Report" data={bookingsList} columns={bookingColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. System */}
          <TabsContent value="system" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Admin Activity Log</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Admin_Activity_Logs" data={systemLogs} columns={logColumns} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Payment Audit Log</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Payment_Audit_Logs" data={paymentAuditLogs} columns={paymentAuditLogColumns} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Renewal Audit Log</CardTitle></CardHeader>
              <CardContent>
                <ReportTable title="Renewal_Audit_Logs" data={renewalAuditLogs} columns={renewalAuditLogColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. Report Writer */}
          <TabsContent value="writer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Writer</CardTitle>
                <div className="flex items-center gap-4 mt-4">
                  <label className="text-sm font-medium">Report Type:</label>
                  <Select
                    value={rwReportType}
                    onValueChange={(value) => {
                      setRwReportType(value);
                      const defaultColumns = reportWriterConfigs[value]?.columns.slice(0, 4).map(c => c.key) || [];
                      setRwColumns(defaultColumns);
                      setRwFilters({});
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="renewals">Renewals</SelectItem>
                      <SelectItem value="bookings">Bookings</SelectItem>
                      <SelectItem value="cpd">CPD</SelectItem>
                      <SelectItem value="system">Admin Activity Logs</SelectItem>
                      <SelectItem value="paymentAuditLogs">Payment Audit Logs</SelectItem>
                      <SelectItem value="renewalAuditLogs">Renewal Audit Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ReportFilter
                  availableColumns={reportWriterAvailableColumns}
                  selectedColumns={rwColumns}
                  onColumnToggle={(key) => {
                    setRwColumns((prev) => prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]);
                  }}
                  filters={rwFilters}
                  onFilterChange={(key, val) => setRwFilters((prev) => ({ ...prev, [key]: val }))}
                  onClearFilters={() => setRwFilters({})}
                />
                <ReportTable
                  title="Custom_Report"
                  data={filteredReportWriterData}
                  columns={reportWriterAvailableColumns.filter((col) => rwColumns.includes(col.key))}
                  searchable={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Reports;
