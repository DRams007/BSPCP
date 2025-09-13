import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProfileEditForm from '@/components/member/ProfileEditForm';
import ContactEditForm from '@/components/member/ContactEditForm';
import CPDUploadForm from '@/components/member/CPDUploadForm';
import BookingManagement from '@/components/member/BookingManagement';
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state
import { IMemberProfile, IMemberContact } from '@/types/member';

interface Member extends IMemberProfile, IMemberContact {
  // Any additional fields specific to the dashboard that are not in profile or contact
  // For now, it seems all fields are covered by IMemberProfile and IMemberContact
}

const MemberDashboard = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); // Remove the token
    localStorage.removeItem('memberAuthenticated');
    localStorage.removeItem('currentMember');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/member-login');
  }, [navigate, toast]);

  const fetchMemberProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch('http://localhost:3001/api/member/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid, force logout
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Member = await response.json();
      setMember(data);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to fetch member profile: ${error.message}`);
      console.error("Error fetching member profile:", error);
      toast({
        title: "Error",
        description: `Failed to load profile: ${error.message}`,
        variant: "destructive",
      });
      // Optionally, redirect to login if there's a persistent error
      // navigate('/member-login');
    } finally {
      setLoading(false);
    }
  }, [handleLogout, toast]); // Add handleLogout and toast to dependencies

  useEffect(() => {
    fetchMemberProfile();
  }, [fetchMemberProfile]); // Depend on the memoized fetchMemberProfile

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <p>No member data available. Please log in.</p>
        <Button onClick={() => navigate('/member-login')} className="ml-2">Go to Login</Button>
      </div>
    );
  }

  // These variables can be removed as the statistics cards have been taken out

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {member.full_name}
                </h1>
                <p className="text-muted-foreground">
                Manage your profile, track your CPD progress, and update your information
                </p>
                <Badge variant="outline" className="mt-2">
                {member.specializations && member.specializations.length > 0 ? member.specializations.join(', ') : 'No Specialization'}
                </Badge>
                {member.bspcp_membership_number && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Membership Number: {member.bspcp_membership_number}
                  </p>
                )}
            </div>
          <Button variant="outline" onClick={handleLogout} className="mt-1">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>



        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                <ProfileEditForm
                  member={{
                    id: member.id,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    full_name: member.full_name,
                    bspcp_membership_number: member.bspcp_membership_number,
                    id_number: member.id_number,
                    date_of_birth: member.date_of_birth,
                    gender: member.gender,
                    nationality: member.nationality,
                    application_status: member.application_status,
                    member_status: member.member_status,
                    review_comment: member.review_comment,
                    occupation: member.occupation,
                    organization_name: member.organization_name,
                    highest_qualification: member.highest_qualification,
                    other_qualifications: member.other_qualifications,
                    scholarly_publications: member.scholarly_publications,
                    specializations: member.specializations,
                    employment_status: member.employment_status,
                    years_experience: member.years_experience,
                    bio: member.bio,
                    title: member.title,
                    languages: member.languages,
                    session_types: member.session_types,
                    fee_range: member.fee_range,
                    availability: member.availability,
                    profile_photo_url: member.profile_photo_url,
                  }}
                  onProfileUpdate={() => {
                    // Small delay to ensure server update is complete
                    setTimeout(fetchMemberProfile, 100);
                  }}
                />
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
                <ContactEditForm
                  member={{
                    id: member.id,
                    phone: member.phone,
                    email: member.email,
                    website: member.website,
                    physical_address: member.physical_address,
                    city: member.city,
                    postal_address: member.postal_address,
                    emergency_contact: member.emergency_contact,
                    emergency_phone: member.emergency_phone,
                    show_email: member.show_email,
                    show_phone: member.show_phone,
                    show_address: member.show_address,
                  }}
                  onContactUpdate={fetchMemberProfile}
                />
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/reset-password')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  {/* <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Privacy Settings", description: "Privacy settings functionality is not yet implemented." })}>
                    <User className="mr-2 h-4 w-4" />
                    Privacy Settings
                  </Button> */}
                  {/* <Button variant="destructive" className="w-full justify-start" onClick={() => toast({ title: "Deactivate Account", description: "Deactivate account functionality is not yet implemented." })}>
                    Deactivate Account
                  </Button> */}
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
