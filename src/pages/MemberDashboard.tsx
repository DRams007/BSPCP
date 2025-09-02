import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User, FileText, Upload, Settings, Eye, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProfileEditForm from '@/components/member/ProfileEditForm';
import ContactEditForm from '@/components/member/ContactEditForm';
import CPDUploadForm from '@/components/member/CPDUploadForm';
import BookingManagement from '@/components/member/BookingManagement';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

// Demo member data with realistic stats
const getMemberData = (loggedInMember: any) => {
  const baseData = {
    membershipStatus: "Active",
    profileStatus: "Approved",
    requiredCpdHours: 40,
  };

  switch (loggedInMember.email) {
    case 'dr.thabo@bspcp.org':
      return {
        ...baseData,
        ...loggedInMember,
        cpdHours: 32,
        profileViews: 189,
      };
    case 'kefilwe.m@bspcp.org':
      return {
        ...baseData,
        ...loggedInMember,
        cpdHours: 28,
        profileViews: 156,
      };
    case 'boitumelo@bspcp.org':
      return {
        ...baseData,
        ...loggedInMember,
        cpdHours: 35,
        profileViews: 203,
      };
    default:
      return {
        ...baseData,
        ...loggedInMember,
        cpdHours: 25,
        profileViews: 147,
      };
  }
};

const sampleBookings = [
  {
    id: 'bkg001',
    clientName: 'Alice Smith',
    date: '2025-09-10',
    time: '10:00 AM',
    service: 'Individual Therapy',
    status: 'Confirmed',
  },
  {
    id: 'bkg002',
    clientName: 'Bob Johnson',
    date: '2025-09-10',
    time: '02:00 PM',
    service: 'Couples Counselling',
    status: 'Pending',
  },
  {
    id: 'bkg003',
    clientName: 'Charlie Brown',
    date: '2025-09-11',
    time: '11:30 AM',
    service: 'Child & Teen Support',
    status: 'Confirmed',
  },
  {
    id: 'bkg004',
    clientName: 'Diana Prince',
    date: '2025-09-12',
    time: '09:00 AM',
    service: 'Trauma & Crisis Intervention',
    status: 'Cancelled',
  },
];

const MemberDashboard = () => {
  const [member, setMember] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('memberAuthenticated');
    const currentMemberData = localStorage.getItem('currentMember');
    
    if (!isAuthenticated || !currentMemberData) {
      toast({
        title: "Access Denied",
        description: "Please log in to access the member dashboard.",
        variant: "destructive",
      });
      navigate('/member-login');
      return;
    }

    const loggedInMember = JSON.parse(currentMemberData);
    setMember(getMemberData(loggedInMember));
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('memberAuthenticated');
    localStorage.removeItem('currentMember');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/member-login');
  };

  if (!member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {member.name}
            </h1>
            <p className="text-muted-foreground">
              Manage your profile, track your CPD progress, and update your information
            </p>
            <Badge variant="outline" className="mt-2">
              {member.specialization}
            </Badge>
          </div>
          <Button variant="outline" onClick={handleLogout} className="mt-1">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="default" className="mt-1">
                    {member.membershipStatus}
                  </Badge>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile</p>
                  <Badge variant="secondary" className="mt-1">
                    {member.profileStatus}
                  </Badge>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPD Hours</p>
                  <p className="text-2xl font-bold">
                    {member.cpdHours}/{member.requiredCpdHours}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">{member.profileViews}</p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="cpd">CPD Evidence</TabsTrigger>
            <TabsTrigger value="bookings">Clients Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile Information</CardTitle>
                <CardDescription>
                  Update your professional profile details that appear on the public directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Manage your contact details and practice information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactEditForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cpd">
            <Card>
              <CardHeader>
                <CardTitle>CPD Evidence</CardTitle>
                <CardDescription>
                  Upload and manage your Continuing Professional Development evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CPDUploadForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Privacy Settings
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Deactivate Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDashboard;
