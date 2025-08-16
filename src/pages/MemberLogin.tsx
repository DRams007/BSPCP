import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface LoginForm {
  email: string;
  password: string;
}

// Demo member accounts
const demoMembers = [
  {
    email: 'dr.thabo@bspcp.org',
    password: 'member123',
    name: 'Dr. Thabo Molefe',
    specialization: 'Individual Therapy',
    status: 'Active'
  },
  {
    email: 'kefilwe.m@bspcp.org', 
    password: 'member123',
    name: 'Kefilwe Mabotja',
    specialization: 'Family Therapy',
    status: 'Active'
  },
  {
    email: 'boitumelo@bspcp.org',
    password: 'member123', 
    name: 'Boitumelo Kgosi',
    specialization: 'Trauma & Crisis',
    status: 'Active'
  }
];

const MemberLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginForm>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    // Check demo credentials
    const member = demoMembers.find(
      m => m.email === data.email && m.password === data.password
    );
    
    if (member) {
      // Store member session
      localStorage.setItem('memberAuthenticated', 'true');
      localStorage.setItem('currentMember', JSON.stringify(member));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${member.name}!`,
      });
      
      navigate('/member-dashboard');
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please check your email and password. Use demo credentials below for testing.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Member Login</CardTitle>
              <CardDescription>
                Access your counsellor dashboard to manage your profile and CPD records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
              
              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-center">Demo Member Accounts</h4>
                <div className="space-y-3 text-xs">
                  {demoMembers.map((member, index) => (
                    <div key={index} className="bg-background p-3 rounded border">
                      <div className="font-medium text-primary mb-1">{member.name}</div>
                      <div className="text-muted-foreground mb-1">{member.specialization}</div>
                      <div className="font-mono">
                        <div>Email: {member.email}</div>
                        <div>Password: {member.password}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center space-y-2">
                <Link 
                  to="/member-signup" 
                  className="text-primary hover:underline text-sm"
                >
                  Don't have an account? Sign up here
                </Link>
                <br />
                <Link 
                  to="/forgot-password" 
                  className="text-muted-foreground hover:underline text-sm"
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemberLogin;