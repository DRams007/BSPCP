import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  title: string;
  specializations: string[];
  bio: string;
  experience: string;
  languages: string[];
  sessionTypes: string[];
  location: string;
  feeRange: string;
  availability: string;
}

const ProfileEditForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg');
  
  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'Clinical Psychologist',
      specializations: ['anxiety', 'depression'],
      bio: 'Experienced clinical psychologist specializing in anxiety and depression treatments.',
      experience: '8 years',
      languages: ['English', 'Setswana'],
      sessionTypes: ['in-person', 'online'],
      location: 'Gaborone',
      feeRange: 'P300-500',
      availability: 'Available'
    }
  });

  const specializations = [
    'Anxiety Disorders', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
    'Addiction', 'Grief & Loss', 'Family Therapy', 'Child Psychology',
    'Career Counseling', 'Stress Management'
  ];

  const languages = ['English', 'Setswana', 'Kalanga', 'Afrikaans', 'Other'];
  const sessionTypes = ['In-Person', 'Online Video', 'Phone Sessions'];

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    // TODO: Implement Supabase update
    console.log('Profile update:', data);
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileImage} alt="Profile" />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <label htmlFor="profile-image" className="cursor-pointer">
              <Button type="button" variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Change Photo
              </Button>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a professional headshot (max 2MB)
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Clinical Psychologist, Counselor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell clients about your background, approach, and areas of expertise..."
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Specializations */}
        <div>
          <FormLabel>Specializations</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {specializations.map((spec) => (
              <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox />
                <span className="text-sm">{spec}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <FormLabel>Languages Spoken</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {languages.map((lang) => (
              <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div>
          <FormLabel>Session Types Offered</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {sessionTypes.map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 5 years" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Gaborone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="feeRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee Range (BWP)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., P300-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Availability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available">Available for new clients</SelectItem>
                  <SelectItem value="Limited">Limited availability</SelectItem>
                  <SelectItem value="Waitlist">Waitlist only</SelectItem>
                  <SelectItem value="Unavailable">Currently unavailable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Updating Profile...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileEditForm;