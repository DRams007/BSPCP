import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Clock, MessageCircle, AlertTriangle, Users, HelpCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: [
        '+267 75078844',
        'Monday - Friday: 8:00 AM - 5:00 PM'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@bspcp.org.bw'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-3xl mx-auto">
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




      <Footer />
    </div>
  );
};

export default Contact;
