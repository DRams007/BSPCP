import { useState, useEffect, useCallback } from 'react';
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
         CalendarPlus, MapPin, Settings, BarChart3, UserCheck, AlertTriangle, Loader2, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookingModal from '@/components/BookingModal'; // Import BookingModal

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if date is invalid
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Return original string in case of error
  }
};

// Helper function to format time
const formatTime = (timeString: string) => {
  if (!timeString) return '';
  try {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${String(formattedHour).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')} ${ampm}`;
  } catch (error) {
    console.error("Error formatting time:", timeString, error);
    return timeString;
  }
};


interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  sessionType: 'online' | 'in-person';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'; // Updated to match backend
  needs?: string; // Corresponds to notes in the frontend
  supportUrgency?: string;
  createdAt: string;
  notes?: string; // added based on DB schema (needs is used for notes)
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

interface Counsellor {
  id: string;
  full_name: string;
  specializations: string[];
  session_types: string[];
}

const BookingManagement = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false); // New state for new booking dialog
  const [currentCounsellor, setCurrentCounsellor] = useState<Counsellor | null>(null); // State to store current counsellor's profile
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookingStats, setBookingStats] = useState({ confirmed: 0, pending: 0, completed: 0, cancelled: 0, rescheduled: 0, totalSessions: 0 });
  const [todayBookingsState, setTodayBookingsState] = useState<Booking[]>([]); // New state for today's bookings
  const { toast } = useToast();

  const fetchCounsellorProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Counsellor = await response.json();
      setCurrentCounsellor(data);
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching counsellor profile:", error);
      toast({
        title: "Error",
        description: `Failed to load counsellor profile: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Booking[] = await response.json();
      setAllBookings(data);

      // Derive clients from bookings
      const uniqueClients = Array.from(new Set(data.map(booking => booking.clientName)))
        .map(clientName => {
          const clientBookings = data.filter(b => b.clientName === clientName);
          const totalSessions = clientBookings.filter(b => b.status === 'completed').length;
          const lastSession = clientBookings
            .filter(b => b.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || 'N/A';
          const clientEmail = clientBookings[0]?.clientEmail || '';
          const clientPhone = clientBookings[0]?.clientPhone || '';

          return {
            id: clientBookings[0]?.id || `client-${clientName.replace(/\s/g, '-')}`, // Use booking ID or generate a unique one
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            totalSessions,
            lastSession,
            notes: '', // Notes will be managed separately or fetched if available
          };
        });
      setClients(uniqueClients);

    } catch (err) {
      const error = err as Error;
      setError(`Failed to fetch bookings: ${error.message}`);
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: `Failed to load bookings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchTodayBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/bookings/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Booking[] = await response.json();
      setTodayBookingsState(data);
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching today's bookings:", error);
      toast({
        title: "Error",
        description: `Failed to load today's bookings: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCounsellorProfile();
    fetchBookings();
    fetchTodayBookings(); // Fetch today's bookings
  }, [fetchCounsellorProfile, fetchBookings, fetchTodayBookings]);

  useEffect(() => {
    const getBookingStats = () => {
      const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
      const pending = allBookings.filter(b => b.status === 'pending').length;
      const completed = allBookings.filter(b => b.status === 'completed').length;
      const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
      const rescheduled = allBookings.filter(b => b.status === 'rescheduled').length;
      const totalSessions = allBookings.length;
  
      setBookingStats({ confirmed, pending, completed, cancelled, rescheduled, totalSessions });
    };

    getBookingStats();
  }, [allBookings]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setBookings(allBookings);
    } else {
      setBookings(allBookings.filter(booking => booking.status === statusFilter));
    }
  }, [statusFilter, allBookings]);

  // Calculate upcoming sessions (next 7 days)
  const getUpcomingBookings = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= today && bookingDate <= nextWeek && booking.status === 'confirmed';
    });
  };

  const upcomingBookings = getUpcomingBookings();

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Booking Updated",
        description: `Booking has been ${action}`,
      });
      fetchBookings(); // Re-fetch bookings to update the UI
      setActiveTab('bookings');
    } catch (err) {
      const error = err as Error;
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: `Failed to update booking: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleRescheduleBooking = async (bookingId: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for rescheduling.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingDate: rescheduleDate, bookingTime: rescheduleTime }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Booking Rescheduled",
        description: `Booking has been rescheduled to ${formatDate(rescheduleDate)} at ${formatTime(rescheduleTime)}`,
      });
      fetchBookings(); // Re-fetch bookings to update the UI
      setIsRescheduleDialogOpen(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setActiveTab('bookings');
    } catch (err) {
      const error = err as Error;
      console.error('Error rescheduling booking:', error);
      toast({
        title: "Error",
        description: `Failed to reschedule booking: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled', notes: reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Booking Cancelled",
        description: reason ? `Booking cancelled: ${reason}` : "Booking has been cancelled",
      });
      fetchBookings(); // Re-fetch bookings to update the UI
      setCancelReason('');
      setActiveTab('bookings');
    } catch (err) {
      const error = err as Error;
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: `Failed to cancel booking: ${error.message}`,
        variant: "destructive",
      });
    }
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

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      case 'rescheduled': return 'secondary'; // Using secondary for rescheduled
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'cancelled': return <CalendarX className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'rescheduled': return <CalendarPlus className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {/* Main Navigation Tabs */}
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="bookings">All Bookings</TabsTrigger>
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      {/* Dashboard Tab */}
      <TabsContent value="dashboard" className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back to your Booking Dashboard</h2>
          <p className="text-gray-600">You have {bookingStats.pending} pending bookings. Today's schedule includes {todayBookingsState.length} sessions.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed Bookings</p>
                  <p className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{bookingStats.totalSessions}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Rescheduled</p>
                  <p className="text-2xl font-bold text-purple-600">{bookingStats.rescheduled}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <CalendarPlus className="h-8 w-8 text-purple-600 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <CalendarX className="h-8 w-8 text-red-600 opacity-75" />
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
                Your appointments for {formatDate(new Date().toISOString())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayBookingsState.length > 0 ? (
                <div className="space-y-3">
                  {todayBookingsState.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">{formatTime(booking.time)}</p>
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
                        <p className="text-sm text-muted-foreground">{formatDate(booking.date)} at {formatTime(booking.time)}</p>
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
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
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
                      <p className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</p>
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
                      <p className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</p>
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
                      <p className="text-2xl font-bold text-blue-600">{bookingStats.completed}</p>
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
                      <p className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</p>
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
                          <p className="font-medium">{formatDate(booking.date)}</p>
                          <p className="text-sm text-muted-foreground">{formatTime(booking.time)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <MapPin className="h-3 w-3" />
                          {booking.sessionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
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
                                        <strong>Date:</strong> {formatDate(booking.date)} at {formatTime(booking.time)}
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

                          {(booking.status === 'confirmed' || booking.status === 'rescheduled') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBookingAction(
                                  booking.id,
                                  booking.status === 'rescheduled' ? 'confirmed' : 'completed'
                                )}
                                title={booking.status === 'rescheduled' ? 'Confirm booking' : 'Mark as completed'}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsRescheduleDialogOpen(true);
                                    }}
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
                                        <strong>Current:</strong> {formatDate(booking.date)} at {formatTime(booking.time)}
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

                          {booking.status === 'completed' && (
                            <Dialog open={isNewBookingDialogOpen} onOpenChange={setIsNewBookingDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Schedule new session"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Repeat className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              {selectedBooking && currentCounsellor && (
                                <BookingModal
                                  isOpen={isNewBookingDialogOpen}
                                  onClose={() => setIsNewBookingDialogOpen(false)}
                                  counsellor={{
                                    id: currentCounsellor.id,
                                    full_name: currentCounsellor.full_name,
                                    specializations: currentCounsellor.specializations || [],
                                    session_types: currentCounsellor.session_types || [],
                                  }}
                                  clientInfo={{
                                    fullName: selectedBooking.clientName,
                                    email: selectedBooking.clientEmail,
                                    phone: selectedBooking.clientPhone,
                                    category: selectedBooking.service,
                                    needs: selectedBooking.needs || '',
                                    sessionType: selectedBooking.sessionType,
                                    urgency: selectedBooking.supportUrgency || '',
                                  }}
                                  onBookingSuccess={() => {
                                    fetchBookings();
                                    setIsNewBookingDialogOpen(false);
                                  }}
                                />
                              )}
                            </Dialog>
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
                                  <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                                  <p><strong>Time:</strong> {formatTime(booking.time)}</p>
                                  <p><strong>Service:</strong> {booking.service}</p>
                                  <p><strong>Session Type:</strong> {booking.sessionType}</p>
                                  <p><strong>Status:</strong> {booking.status}</p>
                                </div>

                                {booking.needs && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Notes</h4>
                                    <p className="text-sm text-muted-foreground">{booking.needs}</p>
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
                        <span className="text-muted-foreground">{formatDate(client.lastSession)}</span>
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
                                  Last session: {formatDate(client.lastSession)}
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
                      <p className="text-2xl font-bold text-green-600">{bookingStats.totalSessions}</p>
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
                      <p className="text-2xl font-bold text-blue-600">{bookingStats.totalSessions > 0 ? Math.round((bookingStats.completed / bookingStats.totalSessions) * 100) : 0}%</p>
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
