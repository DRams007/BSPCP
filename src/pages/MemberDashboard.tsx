import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User, FileText, Upload, Settings, Eye } from 'lucide-react';
import ProfileEditForm from '@/components/member/ProfileEditForm';
import ContactEditForm from '@/components/member/ContactEditForm';
import CPDUploadForm from '@/components/member/CPDUploadForm';

const MemberDashboard = () => {
  const [member] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@email.com",
    membershipStatus: "Active",
    profileStatus: "Approved",
    cpdHours: 25,
    requiredCpdHours: 40,
    profileViews: 147
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {member.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, track your CPD progress, and update your information
          </p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="cpd">CPD Evidence</TabsTrigger>
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