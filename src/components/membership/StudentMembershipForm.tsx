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
import { Loader2, Upload, User, GraduationCap, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Student Membership Schema - Includes student-specific fields and supervision
const studentMembershipSchema = z.object({
  // Membership type
  membershipType: z.literal('student'),

  // Members Table Fields
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  bspcp_membership_number: z.string().optional(),
  idNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(2, 'Nationality is required'),

  // Student-specific fields
  institutionName: z.string().min(2, 'Institution name is required'),
  studyYear: z.string().min(1, 'Year of study is required'),
  programName: z.string().min(2, 'Full name of program is required'),

  // Supervision fields - Required for students
  internshipSupervisorName: z.string().min(2, 'Internship supervisor name is required'),
  internshipSupervisorContact: z.string().min(5, 'Supervisor contact information is required'),

  // Member Professional Details Table Fields
  occupation: z.string().optional(),
  organizationName: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  otherSpecialization: z.string().optional(),
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']).optional(),
  yearsExperience: z.string().optional(), // Made optional for students
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
  studentConfirmationLetter: z.any().refine((f) => f instanceof File, 'Confirmation letter is required'),
  profileImage: z.any().optional(),
});

type StudentMembershipFormData = z.infer<typeof studentMembershipSchema>;

const StudentMembershipForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;
  const navigate = useNavigate();

  const form = useForm<StudentMembershipFormData>({
    resolver: zodResolver(studentMembershipSchema),
    defaultValues: {
      membershipType: 'student',
      gender: 'male',
      employmentStatus: 'employed',
      specializations: [],
      languages: [],
      sessionTypes: [],
      showEmail: true,
      showPhone: true,
      showAddress: false,
      idDocument: undefined,
      studentConfirmationLetter: undefined,
      profileImage: undefined,
      otherSpecialization: '',
      // Student-specific defaults
      internshipSupervisorName: '',
      internshipSupervisorContact: '',
    },
  });

  const onSubmit = async (data: StudentMembershipFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();

    // Append all text fields
    for (const key in data) {
      if (key === 'idDocument' || key === 'studentConfirmationLetter' || key === 'profileImage') {
        continue; // Skip file fields for now, handle separately
      }

      const value = (data as StudentMembershipFormData)[key as keyof StudentMembershipFormData];
      if (Array.isArray(value)) {
        if (key === 'specializations') {
          formData.append(key, JSON.stringify(value));
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
    if (data.studentConfirmationLetter) {
      formData.append('studentConfirmationLetter', data.studentConfirmationLetter);
    }
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
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
          description: 'Your student membership application has been successfully submitted.',
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
        'phone', 'email', 'physicalAddress', 'city', 'idDocument'
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger([
        'institutionName', 'studyYear', 'programName', 'studentConfirmationLetter'
      ]);
    } else if (currentStep === 3) {
      isValid = await form.trigger([
        'internshipSupervisorName', 'internshipSupervisorContact'
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
          {currentStep === 2 && 'Educational Background'}
          {currentStep === 3 && 'Experience & Supervision'}
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
                { icon: GraduationCap, number: 2 },
                { icon: Users, number: 3 }
              ];
              const StepIcon = stepIcons[i].icon;

              return (
                <div key={i} className="flex items-center">
                  <div className={`w-12 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-semibold ${isActive ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    <span>{stepIcons[i].number}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Personal Info</span>
            <span>Educational</span>
            <span>Supervision</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4">Welcome Student Counsellor!</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    As a student in a counselling training program, you'll need to provide your educational information and supervision details in the upcoming steps.
                  </p>
                </div>

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

            {/* Step 2: Educational Background */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Counselling Training Program</h3>
                  <p className="text-sm text-blue-700">
                    Tell us about your current counselling/psychotherapy training program.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Institution Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., University of Botswana"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studyYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Current Year of Study</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                            <SelectItem value="Masters">Masters</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Full Name of Program Being Studied</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., BA Psychology, Diploma in Counselling"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    📄 Letter of Confirmation
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please provide a letter of confirmation that you are a student of Counselling and Psychotherapy.
                    The letter must be from your institution, signed, and have a date stamp.
                  </p>

                  <FormField
                    control={form.control}
                    name="studentConfirmationLetter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Confirmation Letter (PDF, JPG, PNG)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="application/pdf,image/*"
                            className="file:text-sm file:font-medium"
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        {field.value && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ✓ Selected: {field.value?.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: PDF, JPG, PNG (max 5MB)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Professional Experience & Supervision */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Clinical Supervision & Professional Development</h3>
                  <p className="text-sm text-blue-700">
                    As a student counsellor, supervision is required for your safety and professional development.
                  </p>
                </div>

                {/* Supervision Information - REQUIRED for Students - Moved to top */}
                <Card className="p-6 bg-red-50 border-red-200">
                  <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                    👥 Required Supervision Information
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Student counsellors must be supervised by a qualified professional. This information is mandatory.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="internshipSupervisorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Supervisor's Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="internshipSupervisorContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Supervisor's Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone or email" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-3">Optional Employment Information</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Tell us about your current employment status. This is optional for student counsellors.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Employment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select if applicable" />
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
                          <FormLabel>Occupation/Role (if employed)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Optional - describe your role"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Where do you work?"
                              className="h-11"
                              {...field}
                            />
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
                          <FormLabel>Years of Experience (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Any counseling experience?"
                              className="h-11"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Training Focus and Session Types sections removed per simplification request */}
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
    </Card >
  );
};

export default StudentMembershipForm;
