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
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Professional Membership Schema - No student fields
const professionalMembershipSchema = z.object({
  // Membership type
  membershipType: z.literal('professional'),

  // Members Table Fields
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  bspcpMembershipNumber: z.string().optional(),
  idNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(2, 'Nationality is required'),
  title: z.string().min(1, 'Professional title is required'),

  // Member Professional Details Table Fields
  occupation: z.string().min(2, 'Occupation is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  otherQualifications: z.string().optional(),
  scholarlyPublications: z.string().optional(),
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
  idDocument: z.any().refine((f) => f instanceof File, 'ID document is required'),
  profileImage: z.any().optional(),

  // Member Certificates Table Fields
  certificates: z.array(z.any()).refine((arr) => Array.isArray(arr) && arr.length > 0, 'At least one certificate is required'),


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
      profileImage: undefined,
      certificates: [],
      otherSpecialization: '',
    },
  });

  const onSubmit = async (data: ProfessionalMembershipFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();

    // Append all text fields
    for (const key in data) {
      if (key === 'idDocument' || key === 'certificates' || key === 'profileImage') {
        continue; // Skip file fields for now, handle separately
      }

      const value = (data as ProfessionalMembershipFormData)[key as keyof ProfessionalMembershipFormData];
      if (Array.isArray(value)) {
        if (key === 'specializations') {
          const combinedSpecializations = [...value];
          if (data.otherSpecialization) {
            combinedSpecializations.push(data.otherSpecialization);
          }
          formData.append(key, JSON.stringify(combinedSpecializations));
        } else {
          formData.append(key, JSON.stringify(value)); // Stringify arrays for backend
        }
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
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }
    if (data.certificates && data.certificates.length > 0) {
      data.certificates.forEach((file) => {
        formData.append('certificates', file);
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
        const errorData = await response.json();
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
        'highestQualification', 'specializations', 'certificates'
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
                  <div className={`w-12 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-semibold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
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

                <FormField
                  control={form.control}
                  name="bspcpMembershipNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BSPCP Membership Number (if any)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter if you have one" {...field} />
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
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your nationality" {...field} />
                        </FormControl>
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
                          onChange={(e) => field.onChange(e.target.files?.[0])}
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

                <FormField
                  control={form.control}
                  name="highestQualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Educational Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Master of Science in Clinical Psychology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherQualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Professional Qualifications</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Diploma in Trauma Counselling, Certificate in CBT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scholarlyPublications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholarly Publications (Past 5 Years)</FormLabel>
                      <FormControl>
                        <Input placeholder="Number of articles, papers, or books published" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas of Specialization</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            const currentSpecializations = form.getValues('specializations') || [];
                            if (currentSpecializations.includes(value)) {
                              field.onChange(currentSpecializations.filter((s) => s !== value));
                            } else {
                              field.onChange([...currentSpecializations, value]);
                            }
                          }}
                          value={field.value?.[0] || ''}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select specializations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Depression & Anxiety">Depression & Anxiety</SelectItem>
                            <SelectItem value="Stress Management">Stress Management</SelectItem>
                            <SelectItem value="Self-esteem Issues">Self-esteem Issues</SelectItem>
                            <SelectItem value="Life Transitions">Life Transitions</SelectItem>
                            <SelectItem value="Relationship Issues">Relationship Issues</SelectItem>
                            <SelectItem value="Communication Problems">Communication Problems</SelectItem>
                            <SelectItem value="Pre-Marital Counselling">Pre-Marital Counselling</SelectItem>
                            <SelectItem value="Separation Support">Separation Support</SelectItem>
                            <SelectItem value="Family Conflicts">Family Conflicts</SelectItem>
                            <SelectItem value="Parenting Support">Parenting Support</SelectItem>
                            <SelectItem value="Blended Family Issues">Blended Family Issues</SelectItem>
                            <SelectItem value="Generational Conflicts">Generational Conflicts</SelectItem>
                            <SelectItem value="Behavioral Issues">Behavioral Issues</SelectItem>
                            <SelectItem value="School Problems">School Problems</SelectItem>
                            <SelectItem value="Developmental Concerns">Developmental Concerns</SelectItem>
                            <SelectItem value="Teen Mental Health">Teen Mental Health</SelectItem>
                            <SelectItem value="Trauma & PTSD">Trauma & PTSD</SelectItem>
                            <SelectItem value="Addiction Support">Addiction Support</SelectItem>
                            <SelectItem value="Grief & Loss">Grief & Loss</SelectItem>
                            <SelectItem value="Career Counselling">Career Counselling</SelectItem>
                          </SelectContent>
                        </Select>
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
                          onChange={(e) => field.onChange(Array.from(e.target.files || []))}
                        />
                      </FormControl>
                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.value.length} file(s) selected
                        </p>
                      )}
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
