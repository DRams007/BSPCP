
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Upload, Users, Award, BookOpen, Network, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const membershipSchema = z.object({
  // Members Table Fields
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  bspcpMembershipNumber: z.string().optional(),
  idNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(2, 'Nationality is required'),

  // Member Professional Details Table Fields
  occupation: z.string().min(2, 'Occupation is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  otherQualifications: z.string().optional(),
  scholarlyPublications: z.string().optional(),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  otherSpecialization: z.string().optional(), // Added new field
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
  yearsExperience: z.string().min(1, 'Years of experience is required'),
  bio: z.string().optional(),
  title: z.string().optional(),
  languages: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(), // Ensure this is present
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
  profileImage: z.any().optional(), // Optional for initial application

  // Member Certificates Table Fields
  certificates: z.array(z.any()).refine((arr) => Array.isArray(arr) && arr.length > 0, 'At least one certificate is required'),

  // Member Payments Table Fields
  proofOfPayment: z.any().refine((f) => f instanceof File, 'Proof of payment is required'),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

const Membership = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      gender: 'male',
      employmentStatus: 'employed',
      specializations: [],
      languages: [],
      sessionTypes: [],
      showEmail: true,
      showPhone: true,
      showAddress: false,
      // File uploads
      idDocument: undefined,
      profileImage: undefined,
      proofOfPayment: undefined,
      certificates: [],
      otherSpecialization: '', // Added new field
    },
  });

  const onSubmit = async (data: MembershipFormData) => {
    const formData = new FormData();

    // Append all text fields
    for (const key in data) {
      if (key === 'idDocument' || key === 'proofOfPayment' || key === 'certificates' || key === 'profileImage') {
        continue; // Skip file fields for now, handle separately
      }
      
      const value = (data as MembershipFormData)[key as keyof MembershipFormData];
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
        formData.append(key, value ? 'true' : 'false'); // Convert booleans to string
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
    if (data.proofOfPayment) {
      formData.append('proofOfPayment', data.proofOfPayment);
    }
    if (data.certificates && data.certificates.length > 0) {
      data.certificates.forEach((file) => {
        formData.append('certificates', file);
      });
    }

    try {
      const response = await fetch('http://localhost:3001/api/membership', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Application Submitted!',
          description: 'Your membership application has been successfully submitted.',
          variant: 'default',
        });
        navigate('/member-login'); // Redirect to login page or a success page
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
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await form.trigger([
        'firstName', 'lastName', 'idNumber', 'dateOfBirth', 'gender', 'nationality',
        'phone', 'email', 'physicalAddress', 'city', 'idDocument'
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger([
        'highestQualification', 'certificates'
      ]);
    } else if (currentStep === 3) {
      isValid = await form.trigger([
        'employmentStatus', 'occupation', 'organizationName', 'specializations', 'yearsExperience'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card className="bg-primary-foreground text-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Membership Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">P50 <span className="text-base font-normal">Joining Fee</span></p>
                    <p className="text-2xl font-bold">P150 <span className="text-base font-normal">Annual Subscription</span></p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-primary-foreground text-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    Open to professionally trained counsellors and psychotherapists with a minimum qualification of a <span className="font-semibold">Bachelor's Degree</span>
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

      {/* Application Form Section */}
      <section id="application-form" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Membership Application</h2>
              <p className="text-muted-foreground">
                Complete the form below to apply for BSPCP membership
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      i + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`h-1 w-full mx-2 ${
                        i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Personal Info</span>
                <span>Professional</span>
                <span>Experience</span>
                <span>References</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Step {currentStep} of {totalSteps}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Professional Qualifications'}
                  {currentStep === 3 && 'Professional Experience'}
                  {currentStep === 4 && 'Professional References'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
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
                              <FormLabel>Professional Title (e.g., Dr., Prof., Mr., Ms.)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your professional title" {...field} />
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
                              <FormLabel>What is your BSPCP Membership Number (please skip if you don't remember or never had it)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your BSPCP membership number (optional)" {...field} />
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
                                    className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-datetime-edit]:text-foreground [&::-webkit-date-and-time-value]:text-foreground"
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
                      <div className="space-y-4">


                        <FormField
                          control={form.control}
                          name="highestQualification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Highest Educational Qualification (Write in full)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your highest qualification (write in full)" {...field} />
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
                              <FormLabel>Other Qualifications Completed (Please write full names)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your other qualifications (optional)" {...field} />
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
                              <FormLabel>How many scholarly Counselling or Psychotherapy articles, papers, book chapters or books have you published in the past 5 years?</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter number of publications (optional)" {...field} />
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
                              <FormLabel>Upload Certificates (PDF, JPG, PNG)</FormLabel>
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
                                  value={field.value?.[0] || ''} // Display first selected item or empty
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
                              <FormLabel>Other Specialization (if not listed above)</FormLabel>
                              <FormControl>
                                <Input placeholder="Type your specialization" {...field} />
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
                              <FormLabel>Years of Experience in Counseling/Psychotherapy</FormLabel>
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

                    {/* Step 4: Documents and Payment */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="proofOfPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attach Proof of Payment (PDF, JPG, PNG)</FormLabel>
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

                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Documents Collected
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• <strong>ID Document</strong> - Copy of Omang/ID or Passport (uploaded in Step 1)</li>
                            <li>• <strong>Professional Certificates</strong> - Certification documents (uploaded in Step 2)</li>
                            <li>• <strong>Proof of Payment</strong> - Payment confirmation for membership fees</li>
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">
                            Your documents have been collected in previous steps. Please upload proof of payment before submitting your application.
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            <strong>Note:</strong> Ensure all documents are clear, legible PDFs or images under 5MB each.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-6">
                      {currentStep > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Previous
                        </Button>
                      )}
                      
                      {currentStep < totalSteps ? (
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className={currentStep === 1 ? 'ml-auto' : ''}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button type="submit">
                          Submit Application
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
