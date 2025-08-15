import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactFormData {
  email: string;
  phone: string;
  website: string;
  practiceAddress: string;
  city: string;
  postalCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
}

const ContactEditForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ContactFormData>({
    defaultValues: {
      email: 'sarah.johnson@email.com',
      phone: '+267 71 234 567',
      website: 'www.sarahjohnsonpsychology.com',
      practiceAddress: '123 Main Street, Plot 12345',
      city: 'Gaborone',
      postalCode: 'Private Bag 001',
      emergencyContact: 'Dr. John Smith',
      emergencyPhone: '+267 71 987 654',
      showEmail: true,
      showPhone: true,
      showAddress: false
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    // TODO: Implement Supabase update
    console.log('Contact update:', data);
    setTimeout(() => {
      setIsLoading(false);
      alert('Contact information updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Privacy Settings</CardTitle>
          <CardDescription>
            Control which contact information is displayed publicly on your profile
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col items-center space-y-2 pt-6">
              <FormField
                control={form.control}
                name="showEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Show Publicly</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+267 71 234 567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col items-center space-y-2 pt-6">
              <FormField
                control={form.control}
                name="showPhone"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Show Publicly</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="www.yourpractice.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Practice Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="practiceAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Street address, plot number, building details"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col items-center space-y-2 pt-6">
                <FormField
                  control={form.control}
                  name="showAddress"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Show Publicly</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Private Bag 001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
              <CardDescription>
                This information is kept private and only used for administrative purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name of emergency contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+267 71 987 654" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Updating Contact Information...' : 'Update Contact Information'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactEditForm;