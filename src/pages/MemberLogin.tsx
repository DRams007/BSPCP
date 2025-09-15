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
import { Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  identifier: string; // Can be either username or email
  password: string;
}

const MemberLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginForm>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('memberAuthenticated', 'true');
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentMember', JSON.stringify({
          memberId: result.memberId,
          username: result.username,
          fullName: result.fullName,
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.fullName}!`,
        });

        navigate('/member-dashboard');
      } else {
        if (result.error === 'Member account is not active') {
          toast({
            title: "Account Setup Required",
            description: "Your account has been approved but you need to set your password first.",
            variant: "destructive",
          });
        } else if (result.error === 'Authentication record not found') {
          toast({
            title: "Account Not Set Up",
            description: "Your account is approved but authentication is not configured. Please contact admin.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: result.error || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your username or email"
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
                      <FormItem className="relative">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field} 
                          />
                        </FormControl>
                        <span
                          className="absolute inset-y-0 right-0 top-7 flex cursor-pointer items-center pr-3 text-gray-400"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
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
              
              <div className="mt-6 text-center space-y-2">
                <Link
                  to="/membership#application-form"
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
