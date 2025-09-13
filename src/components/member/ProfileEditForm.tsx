import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { IMemberProfile } from '@/types/member';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  member: IMemberProfile;
  onProfileUpdate: () => void;
}

const ProfileEditForm = ({ member, onProfileUpdate }: ProfileEditFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(member.profile_photo_url || '/placeholder.svg');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<IMemberProfile>({
    defaultValues: {
      id: member.id,
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      full_name: member.full_name || '',
      bspcp_membership_number: member.bspcp_membership_number || '',
      id_number: member.id_number || '',
      date_of_birth: member.date_of_birth || '',
      gender: member.gender || '',
      nationality: member.nationality || '',
      application_status: member.application_status || '',
      member_status: member.member_status || 'pending',
      review_comment: member.review_comment || '',
      occupation: member.occupation || '',
      organization_name: member.organization_name || '',
      highest_qualification: member.highest_qualification || '',
      other_qualifications: member.other_qualifications || '',
      scholarly_publications: member.scholarly_publications || '',
      specializations: member.specializations || [],
      employment_status: member.employment_status || '',
      years_experience: member.years_experience || '',
      bio: member.bio || '',
      title: member.title || '',
      languages: member.languages || [],
      session_types: member.session_types || [],
      fee_range: member.fee_range || '',
      availability: member.availability || '',
      profile_photo_url: member.profile_photo_url || '/placeholder.svg',
    }
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  useEffect(() => {
    if (member) {
      form.reset({
        id: member.id,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        full_name: member.full_name || '',
        bspcp_membership_number: member.bspcp_membership_number || '',
        id_number: member.id_number || '',
        date_of_birth: formatDateForInput(member.date_of_birth) || '',
        gender: member.gender || '',
        nationality: member.nationality || '',
        application_status: member.application_status || '',
        member_status: member.member_status || 'pending',
        review_comment: member.review_comment || '',
        occupation: member.occupation || '',
        organization_name: member.organization_name || '',
        highest_qualification: member.highest_qualification || '',
        other_qualifications: member.other_qualifications || '',
        scholarly_publications: member.scholarly_publications || '',
        specializations: member.specializations || [],
        employment_status: member.employment_status || '',
        years_experience: member.years_experience || '',
        bio: member.bio || '',
        title: member.title || '',
        languages: member.languages || [],
        session_types: member.session_types || [],
        fee_range: member.fee_range || '',
        availability: member.availability || '',
        profile_photo_url: member.profile_photo_url || '/placeholder.svg',
      });
      setProfileImage(member.profile_photo_url || '/placeholder.svg');
    }
  }, [member, form]);

  // Watch for changes in first_name and last_name and update full_name automatically
  useEffect(() => {
    const subscription = form.watch((data, { name }) => {
      if (name === 'first_name' || name === 'last_name') {
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (data.full_name !== fullName) {
          form.setValue('full_name', fullName);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const allSpecializations = [
    'Depression & Anxiety',
    'Stress Management',
    'Self-esteem Issues',
    'Life Transitions',
    'Relationship Issues',
    'Communication Problems',
    'Pre-Marital Counselling',
    'Separation Support',
    'Family Conflicts',
    'Parenting Support',
    'Blended Family Issues',
    'Generational Conflicts',
    'Behavioral Issues',
    'School Problems',
    'Developmental Concerns',
    'Teen Mental Health',
    'Trauma & PTSD',
    'Addiction Support',
    'Grief & Loss',
    'Career Counselling',
  ];

  const allLanguages = ['English', 'Setswana', 'Kalanga', 'Afrikaans', 'Other'];
  const allSessionTypes = ['In-Person', 'Online Video', 'Phone Sessions'];

  const onSubmit = async (data: IMemberProfile) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const dataToSend = {
        ...data,
        profile_photo_url: profileImage, // Ensure the most current profile photo URL is sent
      };

      const response = await fetch(`http://localhost:3001/api/member/profile/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      });
      onProfileUpdate(); // Call the callback to refresh dashboard data
    } catch (error) {
      const err = error as Error;
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: `Failed to update profile: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch('http://localhost:3001/api/member/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfileImage(data.profile_photo_url);
      form.setValue('profile_photo_url', data.profile_photo_url); // Update form state
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
        variant: "default",
      });
      onProfileUpdate(); // Refresh dashboard data
    } catch (error) {
      const err = error as Error;
      console.error('Error uploading profile photo:', err);
      toast({
        title: "Error",
        description: `Failed to upload profile photo: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Change Photo
            </Button>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
                aria-label="Profile Image Upload"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Upload a professional headshot (max 2MB)
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
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
            name="last_name"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bspcp_membership_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BSPCP Membership Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter membership number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter ID number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="Enter nationality" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="highest_qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Qualification</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="other_qualifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Qualifications</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List any other relevant qualifications"
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scholarly_publications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scholarly Publications</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List any scholarly publications"
                  className="min-h-20"
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
            {allSpecializations.map((spec) => (
              <FormField
                key={spec}
                control={form.control}
                name="specializations"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={spec}
                      className="flex flex-row items-start space-x-2 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(spec)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, spec])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== spec
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {spec}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage>{form.formState.errors.specializations?.message}</FormMessage>
        </div>

        {/* Languages */}
        <div>
          <FormLabel>Languages Spoken</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {allLanguages.map((lang) => (
              <FormField
                key={lang}
                control={form.control}
                name="languages"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={lang}
                      className="flex flex-row items-start space-x-2 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(lang)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, lang])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== lang
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {lang}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage>{form.formState.errors.languages?.message}</FormMessage>
        </div>

        {/* Session Types */}
        <div>
          <FormLabel>Session Types Offered</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {allSessionTypes.map((type) => (
              <FormField
                key={type}
                control={form.control}
                name="session_types"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={type}
                      className="flex flex-row items-start space-x-2 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(type)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, type])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== type
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {type}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage>{form.formState.errors.session_types?.message}</FormMessage>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="employment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="years_experience"
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
            name="fee_range"
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
