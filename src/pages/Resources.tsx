import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Heart, Phone, Video, Download, ExternalLink, FileText, 
  Headphones, Globe, Users, AlertCircle, Clock, Search, Filter,
  Home, ChevronRight, Play, Star, Calendar, Mail, HelpCircle,
  Brain, TreePine, Shield, Lightbulb, GraduationCap, Briefcase, CheckCircle
} from 'lucide-react';

const Resources = () => {
  const resourceCategories = [
    {
      icon: Heart,
      title: 'Mental Health Information',
      description: 'Comprehensive guides on common mental health conditions, symptoms, and treatment options',
      color: 'bg-primary/10 text-primary',
      resources: [
        'Understanding Depression & Anxiety',
        'Managing Stress & Burnout',
        'Recognizing Mental Health Warning Signs',
        'Supporting Someone with Mental Health Issues'
      ]
    },
    {
      icon: FileText,
      title: 'Self-Help Tools & Worksheets',
      description: 'Downloadable resources to support your mental health journey',
      color: 'bg-terracotta/10 text-terracotta',
      resources: [
        'Mood Tracking Sheets',
        'Anxiety Management Worksheets',
        'Communication Skills Templates',
        'Goal Setting & Progress Tracking'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Emergency & Crisis Resources',
      description: 'Immediate support and crisis intervention information',
      color: 'bg-red-100 text-red-600',
      resources: [
        'Crisis Hotline Numbers',
        'Emergency Contact List',
        'Safety Planning Templates',
        'When to Seek Immediate Help'
      ]
    },
    {
      icon: Video,
      title: 'Educational Videos & Webinars',
      description: 'Learn from mental health professionals through video content',
      color: 'bg-dusty/10 text-dusty',
      resources: [
        'Introduction to Counselling',
        'Coping Strategies Workshop',
        'Family Mental Health Support',
        'Professional Development Series'
      ]
    },
    {
      icon: GraduationCap,
      title: 'Professional Development',
      description: 'Resources for mental health professionals and students',
      color: 'bg-purple-100 text-purple-600',
      resources: [
        'CPD Training Materials',
        'Ethical Guidelines',
        'Research Publications',
        'Best Practice Guidelines'
      ]
    },
    {
      icon: BookOpen,
      title: 'Research & Publications',
      description: 'Latest research findings and professional publications',
      color: 'bg-green-100 text-green-600',
      resources: [
        'BSPCP Journal Articles',
        'Research Reports',
        'Case Studies',
        'Policy Recommendations'
      ]
    }
  ];

  const emergencyContacts = [
    {
      service: 'BSPCP Crisis Line',
      number: '+267 75078844',
      hours: '24/7',
      description: 'Professional mental health crisis support'
    },
    {
      service: 'Police Emergency',
      number: '999',
      hours: '24/7',
      description: 'Emergency police services'
    },
    {
      service: 'Medical Emergency',
      number: '997',
      hours: '24/7',
      description: 'Ambulance and medical emergency'
    },
    {
      service: 'Childline Botswana',
      number: '116',
      hours: '24/7',
      description: 'Support for children and families'
    }
  ];

  const selfHelpTools = [
    {
      title: 'Daily Mood Tracker',
      description: 'Track your emotional patterns and identify triggers',
      format: 'PDF',
      downloads: '2.3k',
      rating: 4.8
    },
    {
      title: 'Anxiety Coping Strategies',
      description: 'Practical techniques for managing anxiety symptoms',
      format: 'PDF',
      downloads: '1.8k',
      rating: 4.9
    },
    {
      title: 'Communication Skills Workbook',
      description: 'Improve relationships through better communication',
      format: 'PDF',
      downloads: '1.5k',
      rating: 4.7
    },
    {
      title: 'Mindfulness Exercises',
      description: 'Guided exercises for stress reduction and awareness',
      format: 'Audio/PDF',
      downloads: '3.1k',
      rating: 4.9
    }
  ];

  const educationalContent = [
    {
      title: 'Understanding Mental Health: A Community Approach',
      type: 'Webinar',
      duration: '45 mins',
      speaker: 'Dr. Keabetswe Moeti',
      views: '1.2K',
      date: '2024-01-15'
    },
    {
      title: 'Parenting Through Difficult Times',
      type: 'Video Series',
      duration: '3 episodes',
      speaker: 'Tshepo Kgathi',
      views: '850',
      date: '2024-02-20'
    },
    {
      title: 'Workplace Mental Health Awareness',
      type: 'Workshop',
      duration: '60 mins',
      speaker: 'Mrs. Goitseone Sebina',
      views: '650',
      date: '2024-03-10'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumb */}
      <section className="py-4 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4" />
            <span className="text-muted-foreground">Home</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Resources</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-6">
              Mental Health Resources
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-4xl mx-auto mb-8">
              Access comprehensive mental health information, self-help tools, professional development materials, 
              and emergency resources to support your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-cream">
                <Search className="w-4 h-4 mr-2" />
                Search Resources
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Download Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Resource Categories
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive resources organized by category to help you find exactly 
              what you need for your mental health and professional development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-foreground mb-4 text-center">
                    {category.title}
                  </h3>
                  <p className="font-source text-muted-foreground text-center mb-6">
                    {category.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {category.resources.map((resource, resourceIndex) => (
                      <div key={resourceIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="font-source text-muted-foreground">{resource}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                    Explore Resources
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Resources */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Emergency & Crisis Resources
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              If you or someone you know is experiencing a mental health crisis, 
              immediate help is available 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-poppins font-bold text-lg text-foreground">
                      {contact.service}
                    </h3>
                    <Badge variant="outline" className="border-red-200 text-red-600">
                      {contact.hours}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span className="font-source font-bold text-xl text-red-600">
                      {contact.number}
                    </span>
                  </div>
                  <p className="font-source text-muted-foreground">
                    {contact.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-red-100 border-red-200">
            <CardContent className="p-8 text-center">
              <h3 className="font-poppins font-bold text-xl text-red-800 mb-4">
                When to Seek Immediate Help
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  'Thoughts of self-harm or suicide',
                  'Severe depression or anxiety',
                  'Substance abuse crisis',
                  'Domestic violence situations',
                  'Psychotic episodes',
                  'Severe panic attacks'
                ].map((situation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="font-source text-red-800 text-sm">{situation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Self-Help Tools */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Self-Help Tools & Worksheets
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Download practical tools and worksheets designed by mental health professionals 
              to support your personal growth and wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {selfHelpTools.map((tool, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-poppins font-bold text-xl text-foreground mb-2">
                        {tool.title}
                      </h3>
                      <p className="font-source text-muted-foreground mb-4">
                        {tool.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{tool.format}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-source text-sm font-medium">{tool.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="font-source text-sm text-muted-foreground">{tool.downloads} downloads</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors duration-300">
                    <Download className="w-4 h-4 mr-2" />
                    Download Free
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg">
              View All Self-Help Tools
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Educational Videos & Webinars
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Learn from BSPCP's mental health professionals through our library of 
              educational videos, webinars, and workshop recordings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {educationalContent.map((content, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-warm flex items-center justify-center">
                    <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-primary/90">
                    {content.type}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-poppins font-bold text-lg text-foreground mb-2">
                    {content.title}
                  </h3>
                  <p className="font-source text-primary font-medium mb-2">
                    {content.speaker}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{content.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{content.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{content.date}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg">
              Explore Full Library
              <Video className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Development */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Professional Development Resources
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Enhance your professional skills and stay current with best practices through 
              our comprehensive professional development materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl">For Professionals</h3>
                </div>
                <div className="space-y-4">
                  {[
                    'CPD Training Materials & Workshops',
                    'Evidence-Based Practice Guidelines',
                    'Ethical Decision-Making Resources',
                    'Supervision & Mentorship Programs',
                    'Professional Development Webinars',
                    'Peer Learning & Discussion Groups'
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="font-source text-muted-foreground">{resource}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6">
                  Access Professional Resources
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-terracotta" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl">For Students</h3>
                </div>
                <div className="space-y-4">
                  {[
                    'Student Membership Benefits',
                    'Internship & Placement Opportunities',
                    'Career Guidance & Mentorship',
                    'Academic Resources & Study Materials',
                    'Professional Networking Events',
                    'Research & Publication Opportunities'
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-terracotta" />
                      <span className="font-source text-muted-foreground">{resource}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6">
                  Explore Student Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter & Updates */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-warm text-white">
            <CardContent className="p-12 text-center">
              <Mail className="w-16 h-16 mx-auto mb-6 text-cream" />
              <h2 className="font-poppins font-bold text-3xl mb-6">
                Stay Updated with Mental Health Resources
              </h2>
              <p className="font-source text-xl text-cream/90 max-w-2xl mx-auto mb-8">
                Subscribe to our newsletter to receive the latest mental health resources, 
                professional development opportunities, and community updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <div className="flex-1">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg border-0 bg-white/20 text-white placeholder-cream/70 backdrop-blur-sm"
                  />
                </div>
                <Button size="lg" className="bg-white text-primary hover:bg-cream">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;