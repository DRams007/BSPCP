import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Award, BookOpen, Network, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfessionalMembershipForm from '@/components/membership/ProfessionalMembershipForm';
import StudentMembershipForm from '@/components/membership/StudentMembershipForm';

// Type for membership selection
type MembershipType = 'professional' | 'student' | 'none';

const Membership = () => {
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType>('none');

  const benefits = [
    {
      icon: Award,
      title: 'Professional Recognition',
      description: 'BSPCP certification and credibility in the field'
    },
    {
      icon: Users,
      title: 'Directory Listing',
      description: 'Public profile in our counsellor search directory'
    },
    {
      icon: BookOpen,
      title: 'Continuing Education',
      description: 'Access to workshops, conferences, and CPD programs'
    },
    {
      icon: Network,
      title: 'Professional Network',
      description: 'Connect with peers and build professional relationships'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join BSPCP Membership
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Advance your professional career with Botswana's premier counselling and psychotherapy association
            </p>
            <div className="max-w-2xl mx-auto mt-12">
              <Card className="bg-primary-foreground text-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    Open to professionally trained counsellors and psychotherapists with a minimum qualification of a <span className="font-semibold">Bachelor's Degree</span>. Student counsellors in accredited training programs are also welcome to join.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Membership Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Existing Members Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Already a Member?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Access your member dashboard to manage your profile, track CPD hours, and update your information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Member Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Log in to access your dashboard, manage your profile, and track your continuing professional development.
                  </p>
                  <Link to="/member-login">
                    <Button className="w-full">
                      Access Member Portal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Member Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li>• Update your public profile</li>
                    <li>• Upload CPD evidence</li>
                    <li>• Manage contact information</li>
                    <li>• Access member resources</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Type Selection */}
      {selectedMembershipType === 'none' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Membership Application</h2>
                <p className="text-muted-foreground">
                  Choose your membership type to begin your application
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <Card
                  className="cursor-pointer transition-all hover:shadow-lg border-primary/20"
                  onClick={() => setSelectedMembershipType('professional')}
                >
                  <CardHeader className="text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <CardTitle className="text-xl">Professional Counsellor</CardTitle>
                    <CardDescription className="mt-2">
                      For qualified counsellors and psychotherapists with Bachelor's degree minimum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left space-y-2 text-sm text-muted-foreground">
                      <li>• Must have Bachelor's degree or higher</li>
                      <li>• Professional qualifications required</li>
                      <li>• Professional practice experience</li>
                      <li>• Full membership benefits</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer transition-all hover:shadow-lg border-blue-200"
                  onClick={() => setSelectedMembershipType('student')}
                >
                  <CardHeader className="text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <CardTitle className="text-xl">Student Counsellor/Trainee</CardTitle>
                    <CardDescription className="mt-2">
                      For counselling students in training programs with supervised practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left space-y-2 text-sm text-muted-foreground">
                      <li>• Currently enrolled in counselling program</li>
                      <li>• Supervision requirements apply</li>
                      <li>• Reduced membership fees</li>
                      <li>• Academic and student-focused benefits</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Professional Membership Form */}
      {selectedMembershipType === 'professional' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Professional Counsellor Application</h2>
                  <p className="text-muted-foreground">Complete your membership application</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMembershipType('none')}
                >
                  Change Membership Type
                </Button>
              </div>
              <ProfessionalMembershipForm />
            </div>
          </div>
        </section>
      )}

      {/* Student Membership Form */}
      {selectedMembershipType === 'student' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Student Counsellor Application</h2>
                  <p className="text-muted-foreground">Complete your membership application</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMembershipType('none')}
                >
                  Change Membership Type
                </Button>
              </div>
              <StudentMembershipForm />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Membership;
