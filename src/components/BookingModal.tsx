import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';

interface Booking {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: string;
  sessionType: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  counsellor: {
    id: string;
    full_name: string;
    specializations: string[];
    session_types: string[];
  };
  clientInfo: {
    fullName: string;
    email: string;
    phone: string;
    category: string | null;
    needs: string;
    sessionType: string;
    urgency: string;
  };
  onBookingSuccess: () => void; // Add onBookingSuccess prop
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, counsellor, clientInfo, onBookingSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});

  // Fetch existing bookings for the selected date
  const fetchExistingBookings = async (date: string) => {
    if (!date || !counsellor.id) return;

    setFetchingBookings(true);
    try {
      const response = await fetch(`http://localhost:3001/api/counsellors/${counsellor.id}/bookings/date?date=${date}`);
      if (response.ok) {
        const data: Booking[] = await response.json();
        setExistingBookings(data);
        // Clear selected time if it's now booked
        const bookedTimes = data.map(booking => booking.time);
        if (selectedTime && bookedTimes.includes(selectedTime)) {
          setSelectedTime('');
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing bookings:', error);
    } finally {
      setFetchingBookings(false);
    }
  };

  // Effect to fetch bookings when date changes
  useEffect(() => {
    if (selectedDate && counsellor.id) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      fetchExistingBookings(formattedDate);
    } else {
      setExistingBookings([]);
    }
  }, [selectedDate]);

  // Reset selectedTime when time becomes unavailable
  useEffect(() => {
    const bookedTimes = existingBookings.map(booking => booking.time);
    if (selectedTime && bookedTimes.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [existingBookings, selectedTime]);

  // Get booked time slots
  const getBookedTimes = () => {
    return existingBookings.map(booking => booking.time);
  };

  const handleScheduleSession = async () => {
    const newErrors: { date?: string; time?: string } = {};
    if (!selectedDate) {
      newErrors.date = 'Please select a date.';
    }
    if (!selectedTime) {
      newErrors.time = 'Please select a time.';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        counsellorId: counsellor.id,
        clientName: clientInfo.fullName,
        phoneNumber: clientInfo.phone,
        email: clientInfo.email,
        category: clientInfo.category,
        needs: clientInfo.needs,
        sessionType: clientInfo.sessionType,
        supportUrgency: clientInfo.urgency,
        bookingDate: format(selectedDate!, 'yyyy-MM-dd'),
        bookingTime: selectedTime,
      };

      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to schedule session');
      }

      toast({
        title: 'Booking Successful!',
        description: `Your session with ${counsellor.full_name} on ${format(selectedDate!, 'PPP')} at ${selectedTime} has been scheduled.`,
        variant: 'default',
      });
      onBookingSuccess(); // Call onBookingSuccess after successful booking
      onClose();
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Booking Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) { // 9 AM to 5 PM
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Session with {counsellor.full_name}</DialogTitle>
          <DialogDescription>
            Select a date and time for your counselling session.
          </DialogDescription>
        </DialogHeader>
        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="rounded-md border"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <div className="col-span-3">
              <Select onValueChange={(value) => setSelectedTime(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots()
                    .filter((timeSlot) => {
                      const bookedTimes = getBookedTimes();
                      return !bookedTimes.includes(timeSlot);
                    })
                    .map((timeSlot) => (
                      <SelectItem
                        key={timeSlot}
                        value={timeSlot}
                      >
                        <span>{timeSlot}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Booked Times Display */}
          {selectedDate && existingBookings.length > 0 && (
            <div className="space-y-2">
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-md p-2">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800">
                    Booked times on {format(selectedDate, 'MMM dd')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {existingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-1 bg-white/50 rounded-sm p-1.5 border border-amber-200/30"
                    >
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-mono text-amber-800">{booking.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator when fetching bookings */}
          {selectedDate && fetchingBookings && (
            <div className="flex justify-center items-center py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleScheduleSession} disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
