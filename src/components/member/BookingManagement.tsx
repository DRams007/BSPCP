import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Calendar, Search, Filter, Phone, Mail, Eye, CalendarX, Clock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  notes?: string;
  duration: number; // in minutes
}

const sampleBookings: Booking[] = [
  {
    id: 'bkg001',
    clientName: 'Alice Smith',
    clientEmail: 'alice.smith@email.com',
    clientPhone: '+267 7234 5678',
    date: '2025-09-10',
    time: '10:00 AM',
    service: 'Individual Therapy',
    status: 'Confirmed',
    notes: 'First session, anxiety and stress management',
    duration: 60,
  },
  {
    id: 'bkg002',
    clientName: 'Bob Johnson',
    clientEmail: 'bob.johnson@email.com',
    clientPhone: '+267 7123 4567',
    date: '2025-09-10',
    time: '02:00 PM',
    service: 'Couples Counselling',
    status: 'Pending',
    notes: 'Relationship issues, communication problems',
    duration: 90,
  },
  {
    id: 'bkg003',
    clientName: 'Charlie Brown',
    clientEmail: 'charlie.brown@email.com',
    clientPhone: '+267 7345 6789',
    date: '2025-09-11',
    time: '11:30 AM',
    service: 'Child & Teen Support',
    status: 'Confirmed',
    notes: 'Teen anxiety, school-related stress',
    duration: 45,
  },
  {
    id: 'bkg004',
    clientName: 'Diana Prince',
    clientEmail: 'diana.prince@email.com',
    clientPhone: '+267 7456 7890',
    date: '2025-09-12',
    time: '09:00 AM',
    service: 'Trauma & Crisis Intervention',
    status: 'Cancelled',
    notes: 'Client requested cancellation',
    duration: 60,
  },
  {
    id: 'bkg005',
    clientName: 'Edward Wilson',
    clientEmail: 'edward.wilson@email.com',
    clientPhone: '+267 7567 8901',
    date: '2025-09-08',
    time: '03:00 PM',
    service: 'Family Therapy',
    status: 'Completed',
    notes: 'Family communication session completed successfully',
    duration: 75,
  },
];

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleStatusChange = (bookingId: string, newStatus: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed') => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
    
    toast({
      title: "Status Updated",
      description: `Booking status changed to ${newStatus}`,
    });
  };

  const getBookingStats = () => {
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    
    return { confirmed, pending, completed, cancelled };
  };

  const stats = getBookingStats();

  return (
    <div className="space-y-6">
      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <CalendarX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Bookings Management
          </CardTitle>
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

          {/* Bookings Table */}
          {filteredBookings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
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
                      <TableCell>{booking.duration} min</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(booking.status)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Client Information</h4>
                                    <p><strong>Name:</strong> {selectedBooking.clientName}</p>
                                    <p><strong>Email:</strong> {selectedBooking.clientEmail}</p>
                                    <p><strong>Phone:</strong> {selectedBooking.clientPhone}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Appointment Details</h4>
                                    <p><strong>Date:</strong> {selectedBooking.date}</p>
                                    <p><strong>Time:</strong> {selectedBooking.time}</p>
                                    <p><strong>Service:</strong> {selectedBooking.service}</p>
                                    <p><strong>Duration:</strong> {selectedBooking.duration} minutes</p>
                                    <p><strong>Status:</strong> {selectedBooking.status}</p>
                                  </div>
                                  
                                  {selectedBooking.notes && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Notes</h4>
                                      <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <Select 
                                      value={selectedBooking.status.toLowerCase()} 
                                      onValueChange={(value) => handleStatusChange(selectedBooking.id, value as any)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Select 
                            value={booking.status.toLowerCase()} 
                            onValueChange={(value) => handleStatusChange(booking.id, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bookings match your search criteria.' 
                  : 'No bookings available yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;