import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search, Filter, Phone, Mail, Eye, CalendarX, Clock, CheckCircle, Bell, Users, TrendingUp,
         CalendarPlus, MapPin, Settings, BarChart3, UserCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  sessionType: 'online' | 'in-person';
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  notes?: string;
  duration: number; // in minutes
  recurring?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSessions: number;
  lastSession: string;
  notes: string;
}

const sampleBookings: Booking[] = [
  {
    id: 'bkg001',
    clientName: 'Alice Smith',
    clientEmail: 'alice.smith@email.com',
    clientPhone: '+267 7234 5678',
    date: '2025-09-11',
    time: '10:00 AM',
    service: 'Individual Therapy',
    sessionType: 'in-person',
    status: 'Confirmed',
    notes: 'First session, anxiety and stress management',
    duration: 60,
  },
  {
    id: 'bkg002',
    clientName: 'Bob Johnson',
    clientEmail: 'bob.johnson@email.com',
    clientPhone: '+267 7123 4567',
    date: '2025-09-11',
    time: '02:00 PM',
    service: 'Couples Counselling',
    sessionType: 'online',
    status: 'Pending',
    notes: 'Relationship issues, communication problems',
    duration: 90,
  },
  {
    id: 'bkg003',
    clientName: 'Charlie Brown',
    clientEmail: 'charlie.brown@email.com',
    clientPhone: '+267 7345 6789',
    date: '2025-09-12',
    time: '11:30 AM',
    service: 'Child & Teen Support',
    sessionType: 'in-person',
    status: 'Confirmed',
    notes: 'Teen anxiety, school-related stress',
    duration: 45,
  },
  {
    id: 'bkg004',
    clientName: 'Diana Prince',
    clientEmail: 'diana.prince@email.com',
    clientPhone: '+267 7456 7890',
    date: '2025-09-13',
    time: '09:00 AM',
    service: 'Trauma & Crisis Intervention',
    sessionType: 'online',
    status: 'Confirmed',
    notes: 'Client requested cancellation',
    duration: 60,
  },
];

const sampleClients: Client[] = [
  {
    id: 'cli001',
    name: 'Alice Smith',
    email: 'alice.smith@email.com',
    phone: '+267 7234 5678',
    totalSessions: 5,
    lastSession: '2025-09-10',
    notes: 'Making good progress with anxiety management. More confident.',
  },
  {
    id: 'cli002',
    name: 'Bob Johnson',
    email: 'bob.johnson@email.com',
    phone: '+267 7123 4567',
    totalSessions: 3,
    lastSession: '2025-09-05',
    notes: 'Couples therapy shows promise but needs more work on communication.',
  },
  {
    id: 'cli003',
    name: 'Charlie Brown',
    email: 'charlie.brown@email.com',
    phone: '+267 7345 6789',
    totalSessions: 2,
    lastSession: '2025-09-08',
    notes: 'Teen experiencing high anxiety related to academic pressure.',
  },
];

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const { toast } = useToast();

  // Calculate today's bookings
  const todayBookings = bookings.filter(booking =>
    booking.date === new Date().toISOString().split('T')[0] && booking.status === 'Confirmed'
  );

  // Calculate upcoming sessions (next 7 days)
  const getUpcomingBookings = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= today && bookingDate <= nextWeek && booking.status === 'Confirmed';
    });
  };

  const upcomingBookings = getUpcomingBookings();

  const handleBookingAction = (bookingId: string, action: 'confirm' | 'cancel' | 'complete') => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        let newStatus: Booking['status'];
        switch (action) {
          case 'confirm':
            newStatus = 'Confirmed';
            break;
          case 'cancel':
            newStatus = 'Cancelled';
            break;
          case 'complete':
            newStatus = 'Completed';
            break;
          default:
            return booking;
        }
        return { ...booking, status: newStatus };
      }
      return booking;
    }));

    toast({
      title: "Booking Updated",
      description: `Booking has been ${action === 'cancel' ? 'cancelled' : action === 'confirm' ? 'confirmed' : 'marked as complete'}`,
    });
  };

  const handleRescheduleBooking = (bookingId: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for rescheduling.",
        variant: "destructive",
      });
      return;
    }

    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          date: rescheduleDate,
          time: rescheduleTime
        };
      }
      return booking;
    }));

    toast({
      title: "Booking Rescheduled",
      description: `Booking has been rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
    });

    setIsRescheduleDialogOpen(false);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: 'Cancelled' as Booking['status'],
          notes: reason ? `${booking.notes || ''}\nCancellation reason: ${reason}`.trim() : booking.notes
        };
      }
      return booking;
    }));

    toast({
      title: "Booking Cancelled",
      description: reason ? `Booking cancelled: ${reason}` : "Booking has been cancelled",
    });

    setCancelReason('');
  };

  const handleSaveClientNotes = () => {
    if (selectedClient) {
      setClients(prev => prev.map(client =>
        client.id === selectedClient.id
          ? { ...client, notes: editNotes }
          : client
      ));
      setEditNotes('');
      setIsEditDialogOpen(false);
      toast({
        title: "Notes Updated",
        description: "Client notes have been saved successfully.",
      });
    }
  };

  const getBookingStats = () => {
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const totalSessions = bookings.length;

    return { confirmed, pending, completed, cancelled, totalSessions };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'Pending': return <Clock className="h-3 w-3" />;
      case 'Cancelled': return <CalendarX className="h-3 w-3" />;
      case 'Completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const stats = getBookingStats();

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      {/* Main Navigation Tabs */}
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="bookings">All Bookings</TabsTrigger>
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      {/* Dashboard Tab */}
      <TabsContent value="dashboard" className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back to your Booking Dashboard</h2>
          <p className="text-gray-600">You have {stats.pending} pending bookings. Today's schedule includes {todayBookings.length} sessions.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed Bookings</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">94%</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule & Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Your appointments for {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayBookings.length > 0 ? (
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Upcoming Sessions (Next 7 Days)
              </CardTitle>
              <CardDescription>
                Sessions scheduled in the coming weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="mb-2">
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{booking.sessionType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No upcoming sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Stay updated with the latest booking activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">2 New Booking Requests</p>
                  <p className="text-sm text-yellow-700">You have pending requests that need your attention.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Session Complete</p>
                  <p className="text-sm text-blue-700">Alice Smith's Individual Therapy session was marked as completed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Reminder Set</p>
                  <p className="text-sm text-green-700">Reminder sent to all clients for upcoming sessions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Calendar Tab */}
      <TabsContent value="calendar" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Management
            </CardTitle>
            <CardDescription>
              View and manage your appointments in calendar format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Calendar view would be integrated here with full drag-and-drop functionality
              </p>
              <p className="text-sm text-muted-foreground">
                This would include weekly/monthly views, color coding for different statuses,
                and drag-and-drop rescheduling capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* All Bookings Tab */}
      <TabsContent value="bookings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Client Bookings
            </CardTitle>
            <CardDescription>
              View and manage all your client appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by client name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Booking Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">1</p>
                    </div>
                    <CalendarX className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.clientName}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.clientEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {booking.clientPhone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.date}</p>
                          <p className="text-sm text-muted-foreground">{booking.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <MapPin className="h-3 w-3" />
                          {booking.sessionType}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.duration} min</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {booking.status === 'Pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                title="Confirm booking"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    title="Cancel booking"
                                  >
                                    <CalendarX className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancel Booking</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to cancel this booking? Please provide a reason.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Client:</strong> {booking.clientName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Service:</strong> {booking.service}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Date:</strong> {booking.date} at {booking.time}
                                      </p>
                                    </div>
                                    <Textarea
                                      placeholder="Provide a reason for cancellation (optional)..."
                                      value={cancelReason}
                                      onChange={(e) => setCancelReason(e.target.value)}
                                      rows={3}
                                    />
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setCancelReason('')}>
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleCancelBooking(booking.id, cancelReason)}
                                      >
                                        Confirm Cancellation
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          {booking.status === 'Confirmed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBookingAction(booking.id, 'complete')}
                                title="Mark as completed"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setSelectedBooking(booking)}
                                    title="Reschedule booking"
                                  >
                                    <CalendarPlus className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reschedule Booking</DialogTitle>
                                    <DialogDescription>
                                      Select a new date and time for this booking.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">New Date</label>
                                        <Input
                                          type="date"
                                          value={rescheduleDate}
                                          onChange={(e) => setRescheduleDate(e.target.value)}
                                          min={new Date().toISOString().split('T')[0]}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">New Time</label>
                                        <Select onValueChange={setRescheduleTime}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select time" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                                            <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                            <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                            <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                                            <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                                            <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                                            <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                                            <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                                            <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                                            <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setIsRescheduleDialogOpen(false);
                                        setRescheduleDate('');
                                        setRescheduleTime('');
                                      }}>
                                        Cancel
                                      </Button>
                                      <Button onClick={() => handleRescheduleBooking(booking.id)}>
                                        Reschedule
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    title="Cancel booking"
                                  >
                                    <CalendarX className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancel Booking</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to cancel this confirmed booking? Please provide a reason.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Client:</strong> {booking.clientName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Service:</strong> {booking.service}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Current:</strong> {booking.date} at {booking.time}
                                      </p>
                                    </div>
                                    <Textarea
                                      placeholder="Provide a reason for cancellation..."
                                      value={cancelReason}
                                      onChange={(e) => setCancelReason(e.target.value)}
                                      rows={3}
                                    />
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setCancelReason('')}>
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleCancelBooking(booking.id, cancelReason)}
                                      >
                                        Confirm Cancellation
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" title="View details">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Client Information</h4>
                                  <p><strong>Name:</strong> {booking.clientName}</p>
                                  <p><strong>Email:</strong> {booking.clientEmail}</p>
                                  <p><strong>Phone:</strong> {booking.clientPhone}</p>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Appointment Details</h4>
                                  <p><strong>Date:</strong> {booking.date}</p>
                                  <p><strong>Time:</strong> {booking.time}</p>
                                  <p><strong>Service:</strong> {booking.service}</p>
                                  <p><strong>Session Type:</strong> {booking.sessionType}</p>
                                  <p><strong>Duration:</strong> {booking.duration} minutes</p>
                                  <p><strong>Status:</strong> {booking.status}</p>
                                </div>

                                {booking.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Notes</h4>
                                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Clients Tab */}
      <TabsContent value="clients" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>
              View and manage your client relationships and session history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span>Total Sessions:</span>
                        <Badge variant="outline">{client.totalSessions}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span>Last Session:</span>
                        <span className="text-muted-foreground">{client.lastSession}</span>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Notes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Client Notes - {client.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Session History</h4>
                                <p className="text-sm text-muted-foreground">
                                  {client.totalSessions} total sessions completed
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Last session: {client.lastSession}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Private Notes</h4>
                                <p className="text-sm text-muted-foreground">{client.notes}</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" onClick={() => {
                                    setSelectedClient(client);
                                    setEditNotes(client.notes);
                                    setIsEditDialogOpen(true);
                                  }}>
                                    Edit Notes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Client Notes</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      value={editNotes}
                                      onChange={(e) => setEditNotes(e.target.value)}
                                      placeholder="Enter private notes about this client..."
                                      rows={4}
                                    />
                                    <DialogFooter>
                                      <Button onClick={handleSaveClientNotes}>
                                        Save Notes
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Availability Tab */}
      <TabsContent value="availability" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Availability & Scheduling
            </CardTitle>
            <CardDescription>
              Set your working hours and manage recurring availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Availability settings would be configured here
              </p>
              <p className="text-sm text-muted-foreground">
                This would include setting working days, time slots, recurring availability,
                blocked dates, and exception management for holidays and special requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reports Tab */}
      <TabsContent value="reports" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reports & Analytics
            </CardTitle>
            <CardDescription>
              Track your business performance and client engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Analytics and reporting features would be displayed here
              </p>
              <p className="text-sm text-muted-foreground">
                This would include session trends, earnings reports, cancellation rates,
                client satisfaction metrics, and exportable reports in PDF/Excel formats.
              </p>
            </div>

            {/* Basic Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalSessions}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Session Completion Rate</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round((stats.completed / stats.totalSessions) * 100)}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                      <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default BookingManagement;
