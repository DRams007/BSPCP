import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, User, Award, Briefcase } from 'lucide-react';
import { countries } from '@/lib/countries';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Professional Membership Schema - No student fields
const professionalMembershipSchema = z.object({
  // Membership type
  membershipType: z.literal('professional'),

  // Members Table Fields
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  bspcp_membership_number: z.string().optional(),
  idNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(2, 'Country of Citizenship is required'),
  title: z.string().min(1, 'Professional title is required'),

  // Member Professional Details Table Fields
  occupation: z.string().min(2, 'Occupation is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  otherQualifications: z.string().optional(),
  publicationsLast3Years: z.string().optional(),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  otherSpecialization: z.string().optional(),
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
  yearsExperience: z.string().min(1, 'Years of experience is required'),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
  feeRange: z.string().optional(),
  availability: z.string().optional(),

  // Member Contact Details Table Fields
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  email: z.string().email('Valid email is required'),
  website: z.string().optional(),
  physicalAddress: z.string().min(1, 'Physical address is required'),
  city: z.string().min(2, 'City is required'),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  showAddress: z.boolean().default(false),

  // Member Personal Documents Table Fields
  idDocument: z.any()
    .refine((f) => f instanceof File, 'ID document is required')
    .refine((f) => f instanceof File && f.size <= 10 * 1024 * 1024, 'Max file size is 10MB'),
  policeClearance: z.any()
    .refine((f) => f instanceof File, 'Police clearance is required')
    .refine((f) => f instanceof File && f.size <= 10 * 1024 * 1024, 'Max file size is 10MB'),
  references: z.array(z.any())
    .refine((arr) => Array.isArray(arr) && arr.length > 0, 'At least one reference document is required')
    .refine((arr) => arr.every((f) => f instanceof File && f.size <= 10 * 1024 * 1024), 'Each file must be less than 10MB'),
  profileImage: z.any()
    .optional()
    .refine((f) => !f || (f instanceof File && f.size <= 10 * 1024 * 1024), 'Max file size is 10MB'),

  // Member Certificates Table Fields
  certificates: z.array(z.any())
    .refine((arr) => Array.isArray(arr) && arr.length > 0, 'At least one certificate is required')
    .refine((arr) => arr.every((f) => f instanceof File && f.size <= 10 * 1024 * 1024), 'Each file must be less than 10MB'),
});

type ProfessionalMembershipFormData = z.infer<typeof professionalMembershipSchema>;

const ProfessionalMembershipForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;
  const navigate = useNavigate();

  const form = useForm<ProfessionalMembershipFormData>({
    resolver: zodResolver(professionalMembershipSchema),
    defaultValues: {
      membershipType: 'professional',
      gender: 'male',
      employmentStatus: 'employed',
      specializations: [],
      languages: [],
      sessionTypes: [],
      showEmail: true,
      showPhone: true,
      showAddress: false,
      idDocument: undefined,
      certificates: [],
      references: [],
      otherSpecialization: '',
      otherQualifications: '',
      publicationsLast3Years: '',
    },
  });

  const onSubmit = async (data: ProfessionalMembershipFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();

    // Append all text fields
    for (const key in data) {
      if (key === 'idDocument' || key === 'certificates' || key === 'profileImage' || key === 'policeClearance' || key === 'references') {
        continue; // Skip file fields for now, handle separately
      }

      const value = (data as ProfessionalMembershipFormData)[key as keyof ProfessionalMembershipFormData];
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value)); // Stringify arrays for backend
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    // Append files
    if (data.idDocument) {
      formData.append('idDocument', data.idDocument);
    }
    if (data.policeClearance) {
      formData.append('policeClearance', data.policeClearance);
    }
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }
    if (data.certificates && data.certificates.length > 0) {
      data.certificates.forEach((file) => {
        formData.append('certificates', file);
      });
    }
    if (data.references && data.references.length > 0) {
      data.references.forEach((file) => {
        formData.append('references', file);
      });
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/membership`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Application Submitted!',
          description: 'Your professional membership application has been successfully submitted.',
          variant: 'default',
        });
        navigate('/member-login');
      } else {
        if (response.status === 413) {
          toast({
            title: 'Files Too Large',
            description: 'The total size of the uploaded files exceeds the server limit. Please upload fewer or smaller files.',
            variant: 'destructive',
          });
          return;
        }

        let errorData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          errorData = await response.json();
        } else {
          errorData = { error: `Server Error: ${response.statusText}` };
        }

        toast({
          title: 'Submission Failed',
          description: errorData.error || 'There was an error submitting your application.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      // Check email uniqueness and ID number availability before proceeding
      const email = form.getValues('email');
      const idNumber = form.getValues('idNumber');
      const phone = form.getValues('phone');

      // Check ID number first (since it's more unique than email)
      if (idNumber) {
        try {
          setIsSubmitting(true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-id-number`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idNumber }),
          });

          const result = await response.json();
          setIsSubmitting(false);

          if (!result.available) {
            toast({
              title: 'ID Number Already Exists',
              description: result.message,
              variant: 'destructive',
            });
            return;
          }
        } catch (error) {
          setIsSubmitting(false);
          toast({
            title: 'Error',
            description: 'Failed to validate ID number. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Check email uniqueness
      if (email) {
        try {
          setIsSubmitting(true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const result = await response.json();
          setIsSubmitting(false);

          if (!result.available) {
            toast({
              title: 'Email Already Exists',
              description: result.message,
              variant: 'destructive',
            });
            return;
          }
        } catch (error) {
          setIsSubmitting(false);
          toast({
            title: 'Error',
            description: 'Failed to validate email. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Check phone number uniqueness
      if (phone) {
        try {
          setIsSubmitting(true);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-phone`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
          });

          const result = await response.json();
          setIsSubmitting(false);

          if (!result.available) {
            toast({
              title: 'Phone Number Already Exists',
              description: result.message,
              variant: 'destructive',
            });
            return;
          }
        } catch (error) {
          setIsSubmitting(false);
          toast({
            title: 'Error',
            description: 'Failed to validate phone number. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      isValid = await form.trigger([
        'firstName', 'lastName', 'idNumber', 'dateOfBirth', 'gender', 'nationality',
        'title', 'phone', 'email', 'physicalAddress', 'city', 'idDocument'
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger([
        'highestQualification', 'specializations', 'policeClearance', 'references', 'certificates'
      ]);
    } else if (currentStep === 3) {
      isValid = await form.trigger([
        'employmentStatus', 'occupation', 'organizationName', 'yearsExperience'
      ]);
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields for the current step.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Step {currentStep} of {totalSteps}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 && 'Personal Information'}
          {currentStep === 2 && 'Professional Qualifications'}
          {currentStep === 3 && 'Professional Experience'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {Array.from({ length: totalSteps }, (_, i) => {
              const isActive = i + 1 <= currentStep;
              const stepIcons = [
                { icon: User, number: 1 },
                { icon: Award, number: 2 },
                { icon: Briefcase, number: 3 }
              ];
              const StepIcon = stepIcons[i].icon;

              return (
                <div key={i} className="flex items-center">
                  <div className={`w-12 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                    <StepIcon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span>{stepIcons[i].number}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Personal Info</span>
            <span>Qualifications</span>
            <span>Experience</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
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
                          <Input placeholder="Enter your last name" {...field} />
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
                        <Input placeholder="e.g., Dr., Prof., Mr., Ms." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID/Passport Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ID or passport number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <label htmlFor="male">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <label htmlFor="female">Female</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Country of Citizenship</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? countries.find(
                                    (country) => country === field.value
                                  )
                                  : "Select country..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search country..." />
                              <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                  {countries.map((country) => (
                                    <CommandItem
                                      value={country}
                                      key={country}
                                      onSelect={() => {
                                        form.setValue("nationality", country);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          country === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {country}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="physicalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Street address, plot number, building details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="idDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attach Omang/ID (PDF, JPG, PNG)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size > 10 * 1024 * 1024) {
                              e.target.value = '';
                              form.setError('idDocument', { type: 'manual', message: 'File is larger than 10MB. Max is 10MB.' });
                              field.onChange(undefined);
                            } else {
                              form.clearErrors('idDocument');
                              field.onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {field.value?.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Professional Qualifications */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg border">
                  <h3 className="font-semibold text-primary mb-4">Professional Qualifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please provide your professional qualification details and upload your certificates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="highestQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Qualification in Counselling or Psychotherapy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your highest qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Bachelor of Education (Counselling)">Bachelor of Education (Counselling)</SelectItem>
                            <SelectItem value="Bachelor of Education (Guidance and Counselling)">Bachelor of Education (Guidance and Counselling)</SelectItem>
                            <SelectItem value="Bachelor of Arts (Counselling)">Bachelor of Arts (Counselling)</SelectItem>
                            <SelectItem value="Bachelor of Education Honors (Guidance and Counselling)">Bachelor of Education Honors (Guidance and Counselling)</SelectItem>
                            <SelectItem value="Master of Education (Guidance and Counselling)">Master of Education (Guidance and Counselling)</SelectItem>
                            <SelectItem value="Master of Education (Counselling and Human Services)">Master of Education (Counselling and Human Services)</SelectItem>
                            <SelectItem value="Master of Arts (Life Skills Counselling)">Master of Arts (Life Skills Counselling)</SelectItem>
                            <SelectItem value="Master of Arts (Counselling/Counselling Psychology)">Master of Arts (Counselling/Counselling Psychology)</SelectItem>
                            <SelectItem value="Master of Science (Neuro Psychology)">Master of Science (Neuro Psychology)</SelectItem>
                            <SelectItem value="PhD Counselling">PhD Counselling</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherQualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Qualifications</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any other relevant qualifications"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="publicationsLast3Years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many books or publications have you done in the last 3 years?</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter number of publications (e.g. 0, 1, 5)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas of Specialization</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Select
                              onValueChange={(value) => {
                                const currentSpecializations = form.getValues('specializations') || [];
                                if (!currentSpecializations.includes(value)) {
                                  field.onChange([...currentSpecializations, value]);
                                }
                              }}
                              value="" // Always reset to empty to allow re-selecting different options
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select specializations to add" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="General Practice">General Practice</SelectItem>
                                <SelectItem value="Marriage and Relationships">Marriage and Relationships</SelectItem>
                                <SelectItem value="Substance Use and Addiction Counselling">Substance Use and Addiction Counselling</SelectItem>
                                <SelectItem value="Clinical Supervision">Clinical Supervision</SelectItem>
                                <SelectItem value="Counsellor Trainer/Educator">Counsellor Trainer/Educator</SelectItem>
                                <SelectItem value="Adolescents & Children">Adolescents & Children</SelectItem>
                                <SelectItem value="Trauma & Crisis">Trauma & Crisis</SelectItem>
                                <SelectItem value="Pastoral (Faith Based) Counselling">Pastoral (Faith Based) Counselling</SelectItem>
                                <SelectItem value="Emotional Intelligence Facilitation & Assessment">Emotional Intelligence Facilitation & Assessment</SelectItem>
                                <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                                <SelectItem value="Psychedelics Assisted Psychotherapy">Psychedelics Assisted Psychotherapy</SelectItem>
                                <SelectItem value="Grief and Loss Counselling">Grief and Loss Counselling</SelectItem>
                                <SelectItem value="Career Counselling">Career Counselling</SelectItem>
                                <SelectItem value="Correctional and Prison Counselling">Correctional and Prison Counselling</SelectItem>
                                <SelectItem value="Play Therapy">Play Therapy</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Selected Specializations List */}
                            {field.value && field.value.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {field.value.map((spec, index) => (
                                  <div
                                    key={index}
                                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                  >
                                    <span>{spec}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSpecializations = [...field.value];
                                        newSpecializations.splice(index, 1);
                                        field.onChange(newSpecializations);
                                      }}
                                      className="text-muted-foreground hover:text-destructive focus:outline-none"
                                    >
                                      <span className="sr-only">Remove</span>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherSpecialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Specialization</FormLabel>
                        <FormControl>
                          <Input placeholder="Specify other specialization if not listed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="policeClearance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Process Police Clearance (PDF, JPG, PNG)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size > 10 * 1024 * 1024) {
                              e.target.value = '';
                              form.setError('policeClearance', { type: 'manual', message: 'File is larger than 10MB. Max is 10MB.' });
                              field.onChange(undefined);
                            } else {
                              form.clearErrors('policeClearance');
                              field.onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {field.value?.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="references"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Professional References (PDF, JPG, PNG)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="application/pdf,image/*"
                          className="file:text-sm file:font-medium"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const hasLargeFile = Array.from(files).some(f => f.size > 10 * 1024 * 1024);
                              if (hasLargeFile) {
                                e.target.value = '';
                                form.setError('references', { type: 'manual', message: 'One or more files are larger than 10MB. Max is 10MB per file.' });
                                field.onChange([]);
                                return;
                              }
                            }
                            form.clearErrors('references');
                            field.onChange(Array.from(files || []));
                          }}
                        />
                      </FormControl>
                      {field.value && field.value.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {field.value.map((file: File, index: number) => (
                            <p key={index} className="text-xs text-muted-foreground flex items-center">
                              <Upload className="w-3 h-3 mr-1" /> {file.name}
                            </p>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Professional Certificates</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="application/pdf,image/*"
                          className="file:text-sm file:font-medium"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const hasLargeFile = Array.from(files).some(f => f.size > 10 * 1024 * 1024);
                              if (hasLargeFile) {
                                e.target.value = '';
                                form.setError('certificates', { type: 'manual', message: 'One or more files are larger than 10MB. Max is 10MB per file.' });
                                field.onChange([]);
                                return;
                              }
                            }
                            form.clearErrors('certificates');
                            field.onChange(Array.from(files || []));
                          }}
                        />
                      </FormControl>
                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          ✓ {field.value.length} file(s) selected
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted formats: PDF, JPG, PNG (max 5MB each)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Professional Experience */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Employment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your occupation?</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your current occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Organisation where you work</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the name of your organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Professional Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter years of experience" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Types */}
                <div>
                  <FormLabel>Session Types Offered</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    {['In-Person', 'Online Video', 'Phone Sessions'].map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="sessionTypes"
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
                  <FormMessage>{form.formState.errors.sessionTypes?.message}</FormMessage>
                </div>
              </div>
            )}



            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className={currentStep === 1 ? 'ml-auto' : ''}
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfessionalMembershipForm;
