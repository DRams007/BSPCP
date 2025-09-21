import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Button
} from "@/components/ui/button";
import {
  Badge
} from "@/components/ui/badge";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle,
  UserX,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface NotificationRecipient {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettings {
  notificationsEnabled: boolean;
}

const NotificationManagement = () => {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({ notificationsEnabled: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newEmail, setNewEmail] = useState('');
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const adminUser = localStorage.getItem('admin_user');
    if (!adminUser) {
      navigate('/admin/login');
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notification-recipients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients);
        setSettings(data.settings);
      } else {
        setError('Failed to load notification recipients');
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notification-recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Recipient Added",
          description: `${newEmail} has been added to the notification list`,
        });

        setIsAddDialogOpen(false);
        setNewEmail('');
        loadData(); // Refresh list
      } else {
        toast({
          title: "Addition Failed",
          description: data.error || "Failed to add recipient",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Add recipient error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRecipient = async (recipientId: string, email: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${email} from the notification list?`
    );

    if (!confirmed) return;

    setDeletingId(recipientId);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notification-recipients/${recipientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Recipient Removed",
          description: `${email} has been removed from the notification list`,
        });
        loadData(); // Refresh list
      } else {
        const data = await response.json();
        toast({
          title: "Deletion Failed",
          description: data.error || "Failed to remove recipient",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete recipient error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSettings = async (enabled: boolean) => {
    setUpdatingSettings(true);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Settings Updated",
          description: `Application notifications ${enabled ? 'enabled' : 'disabled'}`,
        });
        setSettings(data.settings);
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update settings error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading notification recipients...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Notification Management</h1>
            <p className="text-muted-foreground">
              Manage who receives new application notifications
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipient
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Notification Recipient</DialogTitle>
                <DialogDescription>
                  Add an email address to receive new application notifications
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddRecipient} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@bspcp.org"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewEmail('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adding}>
                    {adding ? 'Adding...' : 'Add Recipient'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings.notificationsEnabled ? (
                <Bell className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-red-500" />
              )}
              Global Settings
            </CardTitle>
            <CardDescription>
              Enable or disable application notifications system-wide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Application Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, new membership applications will be emailed to all active recipients
                </p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={handleToggleSettings}
                disabled={updatingSettings}
              />
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                {settings.notificationsEnabled ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">
                  Status: {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {settings.notificationsEnabled
                  ? 'Application notifications are active and emails will be sent'
                  : 'Application notifications are disabled - no emails will be sent'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recipients Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notification Recipients
            </CardTitle>
            <CardDescription>
              Email addresses that will receive new application notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recipients.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recipients Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add email addresses to receive notifications when new membership applications are submitted.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Recipient
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{recipient.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(recipient.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={recipient.isActive ? "default" : "secondary"}>
                        {recipient.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRecipient(recipient.id, recipient.email)}
                        disabled={deletingId === recipient.id}
                      >
                        {deletingId === recipient.id ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                            Removing...
                          </>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> When notifications are enabled and there are active recipients,
            new membership applications will be emailed to all active recipients. You can enable/disable
            individual recipients or turn off notifications completely using the global toggle above.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default NotificationManagement;
