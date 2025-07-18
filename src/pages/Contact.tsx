import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, MessageCircle, AlertTriangle, Users, HelpCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Main Office',
      details: [
        'Plot 123, Main Mall',
        'Gaborone, Botswana',
        'P.O. Box 1234'
      ]
    },
    {
      icon: Phone,
      title: 'Phone',
      details: [
        '+267 123 4567',
        '+267 123 4568 (Fax)',
        'Monday - Friday: 8:00 AM - 5:00 PM'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@bspcp.org.bw',
        'membership@bspcp.org.bw',
        'support@bspcp.org.bw'
      ]
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: [
        'Monday - Friday: 8:00 AM - 5:00 PM',
        'Saturday: 9:00 AM - 1:00 PM',
        'Sunday: Closed'
      ]
    }
  ];

  const inquiryTypes = [
    {
      icon: MessageCircle,
      title: 'General Inquiry',
      description: 'General questions about BSPCP services'
    },
    {
      icon: Users,
      title: 'Membership Questions',
      description: 'Information about joining BSPCP'
    },
    {
      icon: HelpCircle,
      title: 'Professional Support',
      description: 'Support for current members'
    },
    {
      icon: AlertTriangle,
      title: 'Professional Complaints',
      description: 'Report concerns about a counsellor'
    }
  ];

  const emergencyContacts = [
    {
      name: 'Emergency Services',
      number: '997',
      description: 'Police, Fire, Medical emergencies',
      available: '24/7'
    },
    {
      name: 'Crisis Helpline',
      number: '16222',
      description: 'Mental health crisis support',
      available: '24/7'
    },
    {
      name: 'Suicide Prevention',
      number: '3905050',
      description: 'Immediate suicide prevention help',
      available: '24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6">
              Contact Us
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-3xl mx-auto">
              We're here to help. Get in touch with BSPCP for support, information, 
              or to connect with mental health professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="font-source text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Send Us a Message
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card className="shadow-soft">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="font-source font-medium">First Name</Label>
                    <Input id="firstName" type="text" placeholder="Your first name" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-source font-medium">Last Name</Label>
                    <Input id="lastName" type="text" placeholder="Your last name" className="mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="font-source font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-source font-medium">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+267 123 4567" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inquiryType" className="font-source font-medium">Inquiry Type</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="membership">Membership Questions</SelectItem>
                      <SelectItem value="professional">Professional Support</SelectItem>
                      <SelectItem value="complaint">Professional Complaints</SelectItem>
                      <SelectItem value="media">Media Inquiries</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="font-source font-medium">Subject</Label>
                  <Input id="subject" type="text" placeholder="Brief subject line" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="message" className="font-source font-medium">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please provide details about your inquiry..." 
                    className="mt-2 h-32"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-source font-semibold"
                  >
                    Send Message
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                  >
                    Call Us Instead
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inquiry Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              How Can We Help?
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the type of inquiry that best matches your needs for faster assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {inquiryTypes.map((type, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                        {type.title}
                      </h3>
                      <p className="font-source text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-destructive/5 border-t-4 border-destructive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
              Emergency Contacts
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              If you're experiencing a mental health emergency or crisis, immediate help is available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border-destructive/20 bg-background text-center">
                <CardContent className="p-6">
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                    {contact.name}
                  </h3>
                  <div className="font-poppins font-bold text-2xl text-destructive mb-2">
                    {contact.number}
                  </div>
                  <p className="font-source text-sm text-muted-foreground mb-3">
                    {contact.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{contact.available}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="font-source text-sm text-muted-foreground">
              If you're in immediate danger, please call emergency services or go to your nearest hospital.
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Find Us
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              Visit our main office in the heart of Gaborone for in-person support.
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-96 bg-gradient-gentle flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="font-poppins font-semibold text-xl text-foreground mb-2">
                    BSPCP Main Office
                  </h3>
                  <p className="font-source text-muted-foreground">
                    Plot 123, Main Mall<br />
                    Gaborone, Botswana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Parking
                </h4>
                <p className="font-source text-muted-foreground">
                  Free parking available in the Main Mall parking area
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Public Transport
                </h4>
                <p className="font-source text-muted-foreground">
                  Accessible by public transport and taxi services
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Accessibility
                </h4>
                <p className="font-source text-muted-foreground">
                  Wheelchair accessible entrance and facilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;