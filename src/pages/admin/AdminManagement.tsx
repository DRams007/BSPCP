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
  Users,
  Plus,
  Edit,
  Shield,
  AlertCircle,
  CheckCircle,
  UserX,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface CreateAdminForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateAdminForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [passwordResetting, setPasswordResetting] = useState<string | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setCurrentUserRole(user.role);
      setCurrentUserId(user.id);
    }
  };

  const loadAdmins = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.log('🔐 AdminManagement: No token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      console.log('🔍 AdminManagement: Loading admin users...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AdminManagement: Loaded admin users:', data.admins?.length || 0, 'total');
        console.log('📊 AdminManagement: Admin data sample:', data.admins?.slice(0, 2).map(admin => ({
          id: admin.id,
          username: admin.username,
          is_active: admin.is_active,
          isActive: admin.isActive
        })));
        setAdmins(data.admins || []);
      } else {
        console.error('❌ AdminManagement: Failed to load admins, status:', response.status);
        setError('Failed to load admin users');
      }
    } catch (error) {
      console.error('❌ AdminManagement: Load admins error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAdminForm) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      firstName: '',
      lastName: '',
      phone: ''
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Username, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Admin Created Successfully",
          description: `${data.admin.firstName || data.admin.username} has been added as admin`,
        });

        setIsCreateDialogOpen(false);
        resetForm();
        loadAdmins(); // Refresh list
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create admin error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRoleUpdate = async (adminId: string, newRole: string) => {
    if (currentUserRole !== 'super_admin') {
      toast({
        title: "Unauthorized",
        description: "Only super admins can change roles",
        variant: "destructive",
      });
      return;
    }

    if (adminId === currentUserId) {
      toast({
        title: "Cannot Modify Self",
        description: "You cannot change your own role",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins/${adminId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast({
          title: "Role Updated",
          description: "Admin role has been updated successfully",
        });
        loadAdmins();
      } else {
        const data = await response.json();
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Role update error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (adminId: string, newActiveStatus: boolean) => {
    if (currentUserRole !== 'super_admin') {
      toast({
        title: "Unauthorized",
        description: "Only super admins can change admin status",
        variant: "destructive",
      });
      return;
    }

    if (adminId === currentUserId) {
      toast({
        title: "Cannot Modify Self",
        description: "You cannot deactivate your own account",
        variant: "destructive",
      });
      return;
    }

    setStatusUpdating(adminId);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newActiveStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        const action = newActiveStatus ? 'activated' : 'deactivated';
        toast({
          title: "Status Updated",
          description: `Admin account has been ${action} successfully`,
        });

        // Immediately update the admin in local state for instant UI feedback
        setAdmins(prevAdmins => {
          const updatedAdmins = prevAdmins.map(admin =>
            admin.id === adminId
              ? { ...admin, isActive: newActiveStatus }
              : admin
          );
          return updatedAdmins;
        });

        // Refresh from server to ensure consistency (in background)
        loadAdmins();
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update admin status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getInitials = (firstName: string, lastName: string, username: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  const handleForcePasswordReset = async (adminId: string, username: string) => {
    if (currentUserRole !== 'super_admin') {
      toast({
        title: "Unauthorized",
        description: "Only super admins can reset passwords",
        variant: "destructive",
      });
      return;
    }

    if (adminId === currentUserId) {
      toast({
        title: "Cannot Modify Self",
        description: "You cannot reset your own password",
        variant: "destructive",
      });
      return;
    }

    setPasswordResetting(adminId);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins/${adminId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Password Reset Initiated",
          description: `Password reset email has been sent to ${username}`,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Reset Failed",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setPasswordResetting(null);
    }
  };

  const handleDeleteAdmin = async (adminId: string, username: string) => {
    if (currentUserRole !== 'super_admin') {
      toast({
        title: "Unauthorized",
        description: "Only super admins can delete admins",
        variant: "destructive",
      });
      return;
    }

    if (adminId === currentUserId) {
      toast({
        title: "Cannot Delete Self",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete admin "${username}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingAdmin(adminId);
    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Admin Deleted",
          description: `Admin account "${username}" has been deleted`,
        });
        loadAdmins(); // Refresh list
      } else {
        const data = await response.json();
        toast({
          title: "Deletion Failed",
          description: data.error || "Failed to delete admin",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete admin error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setDeletingAdmin(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading admin users...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (currentUserRole !== 'super_admin') {
    return (
      <AdminLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need super admin privileges to access this page.
            </AlertDescription>
          </Alert>
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
            <h1 className="text-2xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">
              Manage admin users and their permissions
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the system
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName')(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName')(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username')(e.target.value)}
                    placeholder="Enter unique username"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email')(e.target.value)}
                    placeholder="admin@bsncp.org"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password')(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword')(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role')(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone')(e.target.value)}
                    placeholder="+44 20 7946 0623"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Admin'}
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

        {/* Admin Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <Card key={admin.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {getInitials(admin.firstName, admin.lastName, admin.username)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {admin.firstName && admin.lastName
                          ? `${admin.firstName} ${admin.lastName}`
                          : admin.username}
                      </CardTitle>
                      <CardDescription>
                        @{admin.username}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge variant={getRoleBadgeVariant(admin.role)} className="shrink-0">
                    <Shield className="w-3 h-3 mr-1" />
                    {admin.role.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span className="truncate">{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center space-x-2">
                      <span>📱</span>
                      <span>{admin.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-2">
                    {admin.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">Inactive</span>
                      </>
                    )}
                    {admin.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant={admin.isActive ? "outline" : "default"}
                        onClick={() => {
                          const newStatus = !admin.isActive;
                          console.log('🔄 AdminManagement: Toggling status from', admin.isActive, 'to', newStatus);
                          handleStatusToggle(admin.id, newStatus);
                        }}
                        disabled={statusUpdating === admin.id}
                        className="h-6 px-2 text-xs"
                      >
                        {statusUpdating === admin.id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <UserCheck className="w-3 h-3 mr-1" />
                        )}
                        {admin.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </div>

                {admin.lastLogin && (
                  <div className="text-xs text-muted-foreground">
                    Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                  </div>
                )}

                {/* Action Buttons */}
                {admin.id !== currentUserId && currentUserRole === 'super_admin' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleForcePasswordReset(admin.id, admin.username)}
                      className="h-7 px-2 text-xs"
                      disabled={passwordResetting === admin.id}
                    >
                      {passwordResetting === admin.id ? (
                        <>
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                      className="h-7 px-2 text-xs"
                      disabled={deletingAdmin === admin.id}
                    >
                      {deletingAdmin === admin.id ? (
                        <>
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                )}

                {/* Role Selection */}
                {admin.id !== currentUserId && (
                  <div className="pt-2">
                    <Label className="text-xs text-muted-foreground">Change Role:</Label>
                    <Select
                      value={admin.role}
                      onValueChange={(value) => handleRoleUpdate(admin.id, value)}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {admins.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Admin Users Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by creating your first admin user. You'll need their login credentials and role information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;
