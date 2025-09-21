import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferencesData {
  id: string;
  bookingNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('member_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/notification-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      setPreferences(data);
      setError(null);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookingNotifications = async (enabled: boolean) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('member_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingNotifications: enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);

      toast({
        title: "Preferences Updated",
        description: `Booking notifications ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
      // Revert the switch on error
      setPreferences(prev => prev ? { ...prev, bookingNotifications: !prev.bookingNotifications } : null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading notification preferences...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {preferences?.bookingNotifications ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-500" />
          )}
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about client bookings and other activities
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Booking Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="booking-notifications" className="font-medium">
                Client Booking Notifications
              </Label>
              {preferences?.bookingNotifications && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Receive email notifications when clients book counselling sessions with you
            </p>
          </div>

          <Switch
            id="booking-notifications"
            checked={preferences?.bookingNotifications || false}
            onCheckedChange={handleToggleBookingNotifications}
            disabled={saving}
          />
        </div>

        {/* Information Alert */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> When enabled, you will receive an email notification
            every time a client books a counselling session with you. The notification includes
            client details, session information, and scheduled date/time. You can still view
            all your bookings in your member dashboard regardless of this setting.
          </AlertDescription>
        </Alert>

        {/* Current Status Display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {preferences?.bookingNotifications ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium">
              Status: Booking notifications are {preferences?.bookingNotifications ? 'enabled' : 'disabled'}
            </span>
          </div>
          {preferences?.updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(preferences.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
