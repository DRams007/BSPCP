
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
import { CheckCircle, Upload, Users, Award, BookOpen, Network } from 'lucide-react';

const membershipSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Full name is required'),
  idNumber: z.string().min(5, 'ID/Passport number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  nationality: z.string().min(2, 'Nationality is required'),
  // Document Uploads
  idDocument: z.any().refine((f) => f instanceof File, 'ID document is required'),
  
  // Contact Details
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  physicalAddress: z.string().min(10, 'Physical address is required'),
  postalAddress: z.string().min(5, 'Postal address is required'),
  
  // Professional Information
  occupation: z.string().min(2, 'Occupation is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  institutionName: z.string().min(2, 'Institution name is required'),
  graduationYear: z.string().min(4, 'Graduation year is required'),
  professionalLicense: z.string().optional(),
  specializations: z.string().min(5, 'Areas of specialization are required'),
  // Document Uploads
  certificates: z.array(z.any()).refine((arr) => Array.isArray(arr) && arr.length > 0, 'At least one certificate is required'),
  
  // Professional Experience
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
  yearsExperience: z.string().min(1, 'Years of experience is required'),
  practiceType: z.enum(['private-practice', 'hospital', 'ngo', 'government', 'academic', 'other']),
  clientPopulation: z.string().min(5, 'Client population served is required'),
  therapeuticApproaches: z.string().min(5, 'Therapeutic approaches are required'),
  practiceLanguages: z.string().min(2, 'Languages of practice are required'),
  
  // References
  reference1Name: z.string().min(2, 'First reference name is required'),
  reference1Contact: z.string().min(10, 'First reference contact is required'),
  reference1Relationship: z.string().min(5, 'First reference relationship is required'),
  reference2Name: z.string().min(2, 'Second reference name is required'),
  reference2Contact: z.string().min(10, 'Second reference contact is required'),
  reference2Relationship: z.string().min(5, 'Second reference relationship is required'),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

const Membership = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      gender: 'prefer-not-to-say',
      employmentStatus: 'employed',
      practiceType: 'private-practice',
      // File uploads
      idDocument: undefined,
      certificates: [],
    },
  });

  const onSubmit = (data: MembershipFormData) => {
    console.log('Membership application submitted:', data);
    // Handle form submission here
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
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

      {/* Application Form Section */}
      <section className="py-16">
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
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name (as on certificates)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
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
                                  <Input type="date" {...field} />
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
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="other" id="other" />
                                      <label htmlFor="other">Other</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                                      <label htmlFor="prefer-not-to-say">Prefer not to say</label>
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
                                <Textarea placeholder="Enter your physical address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your postal address" {...field} />
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
                          name="highestQualification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Highest Educational Qualification</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your highest qualification" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="institutionName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter institution name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="graduationYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year of Graduation</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter graduation year" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="professionalLicense"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Professional License Numbers (if applicable)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter license numbers" {...field} />
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
                                <Textarea placeholder="Enter your areas of specialization" {...field} />
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

                        <FormField
                          control={form.control}
                          name="practiceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type of Practice</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select practice type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private-practice">Private Practice</SelectItem>
                                  <SelectItem value="hospital">Hospital</SelectItem>
                                  <SelectItem value="ngo">NGO</SelectItem>
                                  <SelectItem value="government">Government</SelectItem>
                                  <SelectItem value="academic">Academic Institution</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="clientPopulation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Population Served</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the client population you serve" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="therapeuticApproaches"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Therapeutic Approaches Used</FormLabel>
                              <FormControl>
                                <Textarea placeholder="List the therapeutic approaches you use" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="practiceLanguages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Languages of Practice</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter languages you practice in" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 4: Professional References */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg">First Professional Reference</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="reference1Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter reference name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference1Contact"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Information</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Phone or email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="reference1Relationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Professional Relationship</FormLabel>
                                <FormControl>
                                  <Input placeholder="Describe your professional relationship" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg">Second Professional Reference</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="reference2Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter reference name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference2Contact"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Information</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Phone or email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="reference2Relationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Professional Relationship</FormLabel>
                                <FormControl>
                                  <Input placeholder="Describe your professional relationship" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Supporting Documents Required
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Degree Certificate(s)</li>
                            <li>• Professional Certificates</li>
                            <li>• CV/Resume</li>
                            <li>• Passport Photo</li>
                            <li>• Copy of ID/Passport</li>
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">
                            Please attach your documents in the relevant fields above before submitting this form.
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
