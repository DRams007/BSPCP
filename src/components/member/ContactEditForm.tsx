import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react'; // Import useEffect
import { IMemberContact } from '@/types/member';
import { useToast } from '@/hooks/use-toast';

interface ContactEditFormProps {
  member: IMemberContact;
  onContactUpdate: () => void;
}

const ContactEditForm = ({ member, onContactUpdate }: ContactEditFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<IMemberContact>({
    defaultValues: {
      id: member.id,
      email: member.email || '',
      phone: member.phone || '',
      website: member.website || '',
      physical_address: member.physical_address || '',
      city: member.city || '',
      postal_address: member.postal_address || '',
      emergency_contact: member.emergency_contact || '',
      emergency_phone: member.emergency_phone || '',
      show_email: member.show_email || false,
      show_phone: member.show_phone || false,
      show_address: member.show_address || false,
    }
  });

  useEffect(() => {
    if (member) {
      form.reset({
        id: member.id,
        email: member.email || '',
        phone: member.phone || '',
        website: member.website || '',
        physical_address: member.physical_address || '',
        city: member.city || '',
        postal_address: member.postal_address || '',
        emergency_contact: member.emergency_contact || '',
        emergency_phone: member.emergency_phone || '',
        show_email: member.show_email || false,
        show_phone: member.show_phone || false,
        show_address: member.show_address || false,
      });
    }
  }, [member, form]);

  const onSubmit = async (data: IMemberContact) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`http://localhost:3001/api/member/contact/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Contact information updated successfully!",
        variant: "default",
      });
      onContactUpdate(); // Call the callback to refresh dashboard data
    } catch (error) {
      const err = error as Error;
      console.error('Error updating contact information:', err);
      toast({
        title: "Error",
        description: `Failed to update contact information: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                name="show_email"
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
                name="show_phone"
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
                name="physical_address"
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
                  name="show_address"
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
                name="postal_address"
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
                name="emergency_contact"
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
                name="emergency_phone"
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
